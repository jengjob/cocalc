/*
Show the last latex build log, i.e., output from last time we ran the LaTeX build process.
*/

import { List } from "immutable";
import { ButtonGroup, Button } from "react-bootstrap";
import { is_different, path_split } from "smc-util/misc2";
import {
  React,
  rclass,
  rtypes,
  Rendered,
  Component
} from "../../app-framework";

import { BuildLogs } from "./actions";

import { BuildCommand } from "./build-command";

import { Icon, Loading } from "smc-webapp/r_misc";

interface IBuildSpec {
  button: boolean;
  label: string;
  icon: string;
  tip: string;
}

export interface IBuildSpecs {
  build: IBuildSpec;
  latex: IBuildSpec;
  bibtex: IBuildSpec;
  sagetex: IBuildSpec;
  pythontex: IBuildSpec;
  knitr: IBuildSpec;
  clean: IBuildSpec;
}

const BUILD_SPECS: IBuildSpecs = {
  build: {
    button: true,
    label: "Build",
    icon: "retweet",
    tip: "Build the document, running LaTeX, BibTex, Sage, etc."
  },

  latex: {
    button: false,
    label: "LaTeX",
    icon: "cc-icon-tex-file",
    tip: "Run the LaTeX build command (typically latexmk)"
  },

  bibtex: {
    button: false,
    label: "BibTeX",
    icon: "file-code-o",
    tip: "Process bibliography using Bibtex"
  },

  sagetex: {
    button: false,
    label: "SageTex",
    icon: "cc-icon-sagemath-bold",
    tip: "Run SageTex, if necessary"
  },

  pythontex: {
    button: false,
    label: "PythonTeX",
    icon: "cc-icon-python",
    tip: "Run PythonTeX3, if necessary"
  },

  knitr: {
    button: false,
    label: "Knitr",
    icon: "cc-icon-r",
    tip: "Run Knitr, if necessary"
  },

  clean: {
    button: true,
    label: "Clean",
    icon: "trash",
    tip: "Delete all autogenerated auxiliary files"
  }
};

interface Props {
  id: string;
  actions: any;
  editor_state: Map<string, any>;
  is_fullscreen: boolean;
  project_id: string;
  path: string;
  reload: number;
  font_size: number;
  status: string;

  // reduxProps:
  build_logs: BuildLogs;
  build_command: string | List<string>;
  knitr: boolean;
}

class Build extends Component<Props, {}> {
  static reduxProps({ name }) {
    return {
      [name]: {
        build_logs: rtypes.immutable.Map,
        build_command: rtypes.oneOfType([rtypes.string, rtypes.immutable.List]),
        knitr: rtypes.bool
      }
    };
  }

  shouldComponentUpdate(props): boolean {
    return is_different(this.props, props, [
      "build_logs",
      "status",
      "font_size",
      "build_command",
      "knitr"
    ]);
  }

  render_log_label(stage: string, time_str: string): Rendered {
    return (
      <h5>
        {BUILD_SPECS[stage].label} Output {time_str}
      </h5>
    );
  }

  render_log(stage): Rendered {
    if (this.props.build_logs == null) return;
    const x = this.props.build_logs.get(stage);
    if (!x) return;
    const value: string | undefined = x.get("stdout") + x.get("stderr");
    if (!value) {
      return;
    }
    const time: number | undefined = x.get("time");
    let time_str: string = "";
    if (time) {
      time_str = `(${(time / 1000).toFixed(1)} seconds)`;
    }
    return (
      <>
        {this.render_log_label(stage, time_str)}
        <textarea
          readOnly={true}
          style={{
            color: "#666",
            background: "#f8f8f0",
            display: "block",
            width: "100%",
            padding: "10px",
            flex: 1
          }}
          value={value}
        />
      </>
    );
  }

  render_clean(): Rendered {
    const value =
      this.props.build_logs != null
        ? this.props.build_logs.getIn(["clean", "output"])
        : undefined;
    if (!value) {
      return;
    }
    return (
      <>
        <h4>Clean Auxiliary Files</h4>
        <textarea
          readOnly={true}
          style={{
            color: "#666",
            background: "#f8f8f0",
            display: "block",
            width: "100%",
            padding: "10px",
            flex: 1
          }}
          value={value}
        />
      </>
    );
  }

  render_build_command(): Rendered {
    return (
      <BuildCommand
        filename={path_split(this.props.path).tail}
        actions={this.props.actions}
        build_command={this.props.build_command}
        knitr={this.props.knitr}
      />
    );
  }

  render_status(): Rendered {
    if (this.props.status) {
      return (
        <div style={{ margin: "15px" }}>
          <Loading
            text={this.props.status}
            style={{
              fontSize: "10pt",
              textAlign: "center",
              marginTop: "15px",
              color: "#666"
            }}
          />
        </div>
      );
    }
  }

  render_build_action_button(action: string, spec: IBuildSpec): Rendered {
    return (
      <Button
        key={spec.label}
        title={spec.tip}
        onClick={() => this.props.actions.build_action(action)}
        disabled={!!this.props.status}
      >
        <Icon name={spec.icon} /> {spec.label}
      </Button>
    );
  }

  render_buttons() {
    const v: Rendered[] = [];
    for (const action in BUILD_SPECS) {
      const spec: IBuildSpec = BUILD_SPECS[action];
      if (spec.button) {
        v.push(this.render_build_action_button(action, spec));
      }
    }
    return <ButtonGroup>{v}</ButtonGroup>;
  }

  render() {
    return (
      <div
        className={"smc-vfill"}
        style={{
          overflowY: "scroll",
          padding: "5px 15px",
          fontSize: "10pt"
        }}
      >
        {this.render_build_command()}
        {this.render_status()}
        {this.render_log("latex")}
        {this.render_log("sagetex")}
        {this.render_log("pythontex")}
        {this.render_log("knitr")}
        {this.render_log("bibtex")}
        {this.render_clean()}
      </div>
    );
  }
}

const Build0 = rclass(Build);
export { Build0 as Build };
