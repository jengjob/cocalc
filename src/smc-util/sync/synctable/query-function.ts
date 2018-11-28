/*
Determine function that does query.
*/

const async = require("async");

const schema = require("../../schema");
const misc = require("smc-util/misc");

export function query_function(
  client_query: Function,
  table: string
): Function {
  const s = schema.SCHEMA[table];
  if (s == null) {
    throw Error(`unknown table ${table}`);
  }
  const db_standby = s.db_standby;

  if (!db_standby) {
    // just use default client.query, which queries the master database.
    return client_query;
  }

  function do_query(opts: any): void {
    if (opts == null) {
      throw Error("opts must be an object");
    }

    let read_done: boolean = false;
    const change_queue: { err: any; change: any }[] = [];

    function do_initial_read_query(cb: Function): void {
      const opts2 = misc.copy(opts);
      opts2.standby = true;
      opts2.changes = false;
      opts2.cb = function(err, resp): void {
        opts.cb(err, resp);
        read_done = true;
        if (!err) {
          while (change_queue.length > 0) {
            const x = change_queue.shift();
            if (x == null) break; // make typescript happy.
            const { err, change } = x;
            opts.cb(err, change);
          }
        }
        cb(err);
      };
      client_query(opts2);
    }

    function start_changefeed(cb: Function): void {
      let first_resp: boolean = true;
      const opts2 = misc.copy(opts);
      opts2.standby = false;
      opts2.changes = true;
      opts2.cb = function(err, change): void {
        if (first_resp) {
          first_resp = false;
          cb(err, change);
          return;
        }
        if (read_done) {
          opts.cb(err, change);
        } else {
          change_queue.push({ err, change });
        }
      };
      opts2.options = opts2.options.concat({ only_changes: true });
      client_query(opts2);
    }

    let f : Function;
    if (db_standby === "unsafe") {
      /* If db_standby == 'unsafe', then we do not even require
         the changefeed to be working before doing the full query.
         This will for sure miss all changes from when the query
         finishes until the changefeed starts.  For some
         tables this is fine; for others, not. */

      f = async.parallel;
    } else {
      // Otherwise, the query could miss a small amount of data,
      // but only for a tiny window of time.
      f = async.series;
    }

    f([do_initial_read_query, start_changefeed]);
  }

  return do_query;
}
