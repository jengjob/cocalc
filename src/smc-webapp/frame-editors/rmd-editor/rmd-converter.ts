/*
Convert R Markdown file to hidden Markdown file, then read.
*/

// import { aux_file } from "../frame-tree/util";
import { path_split } from "smc-util/misc2";
import {
  exec,
  ExecOutput /* read_text_file_from_project */,
} from "../generic/client";

export async function convert(
  project_id: string,
  path: string,
  frontmatter: string,
  time?: number
): Promise<ExecOutput> {
  const x = path_split(path);
  const infile = x.tail;
  // console.log("frontmatter", frontmatter);
  let cmd: string;
  // https://www.rdocumentation.org/packages/rmarkdown/versions/1.10/topics/render
  // unless user specifies some self_contained value or user did set an explicit "output: ..." mode,
  // we disable it as a convenience (rough heuristic, but should be fine)
  if (
    frontmatter.indexOf("self_contained") >= 0 ||
    frontmatter.indexOf("output:") >= 0
  ) {
    // , output_file = '${outfile}'
    cmd = `rmarkdown::render('${infile}', output_format = NULL, run_pandoc = TRUE)`;
  } else {
    cmd = `rmarkdown::render('${infile}', output_format = NULL, run_pandoc = TRUE, output_options = list(self_contained = FALSE))`;
  }
  // console.log("rmd cmd", cmd);

  return await exec({
    allow_post: false, // definitely could take a long time to fully run all the R stuff...
    timeout: 4 * 60,
    bash: true, // so timeout is enforced by ulimit
    command: "Rscript",
    args: ["-e", cmd],
    env: { MPLBACKEND: "Agg" }, // for python plots -- https://github.com/sagemathinc/cocalc/issues/4202
    project_id: project_id,
    path: x.head,
    err_on_exit: true,
    aggregate: time,
  });
}
