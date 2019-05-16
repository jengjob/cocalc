import { merge } from "smc-util/misc2";

import { JupyterEditorActions } from "../actions";

// The actual data is stored in the desc of the leaf node.

export class NotebookFrameStore {
  private frame_tree_actions: JupyterEditorActions;
  private id: string;

  constructor(frame_tree_actions: JupyterEditorActions, id: string) {
    this.frame_tree_actions = frame_tree_actions;
    this.id = id;
  }

  /***
   * standard Store API
   ***/

  get(key: string, def?: any): any {
    return this.frame_tree_actions._get_frame_data(this.id, key, def);
  }

  getIn(key: string[], def?: any): any {
    if (key.length == 0) return;
    if (key.length == 1)
      return this.frame_tree_actions._get_frame_data(this.id, key[0], def);
    const x = this.frame_tree_actions._get_frame_data(this.id, key[0]);
    if (x != null && typeof x.getIn === "function") {
      return x.getIn(key.slice(1), def);
    } else {
      return def;
    }
  }

  setState(obj): void {
    this.frame_tree_actions.set_frame_data(merge({ id: this.id }, obj));
  }

  /***
   * convenience functions
   ***/

  public get_cur_cell_index(): number {
    return this.frame_tree_actions.jupyter_actions.store.get_cell_index(
      this.get("cur_id")
    );
  }

  // Return map from selected cell ids to true, obviously
  // in no particular order
  public get_selected_cell_ids(): { [id: string]: true } {
    const selected: { [id: string]: true } = {};
    const cur_id = this.get("cur_id");
    if (cur_id != null) {
      selected[cur_id] = true;
    }
    const sel_ids = this.get("sel_ids");
    if (sel_ids != null) {
      sel_ids.forEach(function(x) {
        selected[x] = true;
      });
    }
    return selected;
  }

  // Return sorted javascript array of the selected cell ids
  public get_selected_cell_ids_list(): string[] {
    // iterate over *ordered* list so we run the selected
    // cells in order
    // TODO: Could do in O(1) instead of O(n) by sorting
    // only selected first by position...; maybe use algorithm
    // based on size...
    const selected = this.get_selected_cell_ids();
    const v: string[] = [];
    const cell_list = this.frame_tree_actions.jupyter_actions.store.get(
      "cell_list"
    );
    if (cell_list == null) {
      // special case -- no cells
      return v;
    }
    cell_list.forEach(function(id) {
      if (selected[id]) {
        v.push(id);
      }
    });
    return v;
  }
}
