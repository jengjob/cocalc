import * as React from "react";
import memoizeOne from "memoize-one";

import { ProjectActions } from "../../../project_actions";
import { analytics_event } from "../../../tracker";

import { CopyButton } from "./copy-button";
import { PublicButton } from "./public-button";
import { FileCheckbox } from "./file-checkbox";
import { generate_click_for } from "./utils";

import { COLORS, TimeAgo, Tip, Icon } from "../../../r_misc";

const { Button, Row, Col } = require("react-bootstrap");
const misc = require("smc-util/misc");
const { project_tasks } = require("../../../project_tasks");

interface Props {
  name: string;
  display_name: string; // if given, will display this, and will show true filename in popover
  size: number; // sometimes is NOT known!
  time: number;
  issymlink: boolean; // TODO: actually use
  checked: boolean;
  bordered: boolean;
  color: string;
  mask: boolean;
  public_data: object;
  is_public: boolean;
  current_path: string;
  actions: ProjectActions;
  no_select: boolean;
  public_view: boolean;
}

interface State {
  selection_at_last_mouse_down: string;
}

export class FileRow extends React.Component<Props, State> {
  shouldComponentUpdate(next) {
    return (
      this.props.name !== next.name ||
      this.props.display_name !== next.display_name ||
      this.props.size !== next.size ||
      this.props.time !== next.time ||
      this.props.issymlink !== next.issymlink ||
      this.props.checked !== next.checked ||
      this.props.mask !== next.mask ||
      this.props.public_data !== next.public_data ||
      this.props.current_path !== next.current_path ||
      this.props.bordered !== next.bordered ||
      this.props.no_select !== next.no_select ||
      this.props.public_view !== next.public_view
    );
  }

  render_icon() {
    // get the file_associations[ext] just like it is defined in the editor
    let name: string;
    const { file_options } = require("../../../editor");
    const info = file_options(this.props.name);
    if (info != undefined) {
      name = info.icon;
    } else {
      name = "file";
    }
    const style = {
      color: this.props.mask ? "#bbbbbb" : undefined,
      verticalAlign: "sub",
    };
    return (
      <a style={style}>
        <Icon name={name} style={{ fontSize: "14pt" }} />
      </a>
    );
  }

  render_name_link(styles, name, ext) {
    return (
      <a style={styles} cocalc-test="file-line">
        <span style={{ fontWeight: this.props.mask ? "normal" : "bold" }}>
          {misc.trunc_middle(name, 50)}
        </span>
        <span style={{ color: !this.props.mask ? "#999" : undefined }}>
          {ext === "" ? "" : `.${ext}`}
        </span>
      </a>
    );
  }

  render_name() {
    let name =
      this.props.display_name != undefined
        ? this.props.display_name
        : this.props.name;
    const name_and_ext = misc.separate_file_extension(name);
    ({ name } = name_and_ext);
    const { ext } = name_and_ext;

    const show_tip =
      (this.props.display_name != undefined &&
        this.props.name !== this.props.display_name) ||
      name.length > 50;

    const styles = {
      whiteSpace: "pre-wrap",
      wordWrap: "break-word",
      overflowWrap: "break-word",
      verticalAlign: "middle",
      color: this.props.mask ? "#bbbbbb" : undefined,
    };

    if (show_tip) {
      return (
        <Tip
          title={
            this.props.display_name
              ? "Displayed filename is an alias. The actual name is:"
              : "Full name"
          }
          tip={this.props.name}
        >
          {this.render_name_link(styles, name, ext)}
        </Tip>
      );
    } else {
      return this.render_name_link(styles, name, ext);
    }
  }

  generate_on_copy_click = memoizeOne((full_path: string) => {
    return generate_click_for("copy", full_path, this.props.actions);
  });

  generate_on_share_click = memoizeOne((full_path: string) => {
    return generate_click_for("share", full_path, this.props.actions);
  });

  render_public_file_info() {
    if (this.props.public_view) {
      return (
        <CopyButton on_click={this.generate_on_copy_click(this.full_path())} />
      );
    } else if (this.props.is_public) {
      return (
        <PublicButton
          on_click={this.generate_on_share_click(this.full_path())}
        />
      );
    }
  }

  full_path() {
    return misc.path_to_file(this.props.current_path, this.props.name);
  }

  handle_mouse_down = () => {
    this.setState({
      selection_at_last_mouse_down: (window.getSelection() || "").toString(),
    });
  };

  handle_click = (e) => {
    if (
      this.state != null &&
      (window.getSelection() || "").toString() !==
        this.state.selection_at_last_mouse_down
    ) {
      // This is a trick so that you can select a filename without
      // the click to do the selection triggering opening of the file.
      return;
    }

    const foreground = misc.should_open_in_foreground(e);
    this.props.actions.open_file({
      path: this.full_path(),
      foreground,
    });
    if (foreground) {
      this.props.actions.set_file_search("");
    }
    analytics_event(
      "project_file_listing",
      "clicked_file_row",
      misc.filename_extension(this.full_path())
    );
  };

  handle_download_click = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.props.actions.download_file({
      path: this.full_path(),
      log: true,
    });
  };

  render_timestamp() {
    try {
      return (
        <TimeAgo
          date={new Date(this.props.time * 1000).toISOString()}
          style={{ color: "#666" }}
        />
      );
    } catch (error) {
      return (
        <div style={{ color: "#666", display: "inline" }}>
          Invalid Date Time
        </div>
      );
    }
  }

  render_download_button(url_href) {
    // ugly width 2.5em is to line up with blank space for directory.
    // TODO: This really should not be in the size column...
    return (
      <Button
        style={{ marginLeft: "1em", background: "transparent", width: "2.5em" }}
        bsStyle="default"
        bsSize="xsmall"
        href={`${url_href}`}
        onClick={this.handle_download_click}
      >
        <Icon name="cloud-download" style={{ color: "#666" }} />
      </Button>
    );
  }

  render() {
    const row_styles = {
      cursor: "pointer",
      borderRadius: "4px",
      backgroundColor: this.props.color,
      borderStyle: "solid",
      borderColor: this.props.bordered ? COLORS.BLUE_BG : this.props.color,
      margin: "1px 1px 1px 1px",
    };

    // See https://github.com/sagemathinc/cocalc/issues/1020
    // support right-click → copy url for the download button
    const url_href = project_tasks(this.props.actions.project_id).url_href(
      this.full_path()
    );

    return (
      <Row
        style={row_styles}
        onMouseDown={this.handle_mouse_down}
        onClick={this.handle_click}
        className={this.props.no_select ? "noselect" : undefined}
      >
        <Col sm={2} xs={3}>
          <FileCheckbox
            name={this.props.name}
            checked={this.props.checked}
            current_path={this.props.current_path}
            actions={this.props.actions}
            style={{ verticalAlign: "sub" }}
          />
          {this.render_public_file_info()}
        </Col>
        <Col sm={1} xs={3}>
          {this.render_icon()}
        </Col>
        <Col sm={4} smPush={5} xs={6}>
          {this.render_timestamp()}
          <span className="pull-right" style={{ color: "#666" }}>
            {misc.human_readable_size(this.props.size)}
            {this.render_download_button(url_href)}
          </span>
        </Col>
        <Col sm={5} smPull={4} xs={12}>
          {this.render_name()}
        </Col>
      </Row>
    );
  }
}
