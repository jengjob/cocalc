/*
Spell check setting.  The options are:

 (*) Browser default (en-US)
 ( ) Disable spellcheck
 ( ) Other [dropdown menu with 400+ choices]

Internally which of the above is stored in a single string, with the following possibilities:

  - 'default' -- use browser default
  - 'disabled'
  - an entry in DICTS (one of the aspell dictionaries)

*/

import { DropdownButton, MenuItem } from "react-bootstrap";

import { React, Rendered, Component } from "../../app-framework";

import { is_different } from "smc-util/misc2";

import { DICTS, dict_desc } from "./aspell-dicts";

interface Props {
  value: string;
  set: Function;
  available: boolean;
}

export class SpellCheck extends Component<Props, {}> {
  shouldComponentUpdate(props): boolean {
    return is_different(this.props, props, ["value", "available"]);
  }

  render_other_items(): Rendered[] {
    const v: Rendered[] = [];
    const set = (lang) => this.props.set(lang);
    for (const lang of DICTS) {
      v.push(
        <MenuItem key={lang} eventKey={lang} onSelect={set}>
          {dict_desc(lang)}
        </MenuItem>
      );
      if (lang == "disabled") {
        v.push(<MenuItem divider key={"div"} />);
      }
    }
    return v;
  }

  render_dropdown(): Rendered {
    return (
      <DropdownButton title={dict_desc(this.props.value)} id="other">
        {this.render_other_items()}
      </DropdownButton>
    );
  }

  render(): Rendered {
    const style = { fontSize: "11pt", paddingRight: "10px" };
    if (this.props.available) {
      return (
        <div>
          <span style={style}>
            <b>Spellcheck language</b> for this file (updates on save):
          </span>
          {this.render_dropdown()}
        </div>
      );
    } else {
      return (
        <div>
          <span style={style}>
            <b>Spellcheck</b> is not available for this project.
          </span>
        </div>
      );
    }
  }
}
