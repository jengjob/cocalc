import { React, Component, Rendered } from "smc-webapp/app-framework";

import { Loading } from "../../r_misc";
const { APP_BASE_URL } = require("../../misc_page");

const { webapp_client } = require("../../webapp_client");

import { callback2 } from "smc-util/async-utils";

interface Props {
  account_id: string;
  first_name: string;
  last_name: string;
}

interface State {
  auth_token?: string;
  err?: string;
}

export class Impersonate extends Component<Props, State> {
  constructor(props, state) {
    super(props, state);
    this.state = {};
  }

  async get_token(): Promise<void> {
    try {
      const { auth_token } = await callback2(
        webapp_client.get_user_auth_token,
        {
          account_id: this.props.account_id,
        }
      );
      this.setState({ auth_token });
    } catch (err) {
      this.setState({ err: err.toString() });
    }
  }

  componentDidMount(): void {
    this.get_token();
  }

  render_link(): Rendered {
    if (this.state.auth_token == null) {
      return <Loading />;
    }
    return (
      <a
        href={`${APP_BASE_URL}/app?auth_token=${this.state.auth_token}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Right click and open this link in a new incognito window, where you will
        be signed in as {this.props.first_name} {this.props.last_name}... Sign
        out when done.
      </a>
    );
  }

  render_err(): Rendered {
    if (this.state.err != null) {
      return (
        <div>
          <b>ERROR</b> {this.state.err}
        </div>
      );
    }
  }

  render(): Rendered {
    return (
      <div
        style={{
          padding: "15px",
          border: "1px solid red",
          borderRadius: "3px",
          fontSize: "14pt",
          margin: "15px",
        }}
      >
        <b>
          Impersonate {this.props.first_name} {this.props.last_name}
        </b>
        <br />
        {this.render_err()}
        {this.render_link()}
      </div>
    );
  }
}
