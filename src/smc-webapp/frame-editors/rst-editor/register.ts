/*
Register the Rst editor
*/

import { Editor } from "./editor";
import { Actions } from "./actions";

import { register_file_editor } from "../frame-tree/register";

register_file_editor({
  ext: "rst",
  component: Editor,
  Actions,
});
