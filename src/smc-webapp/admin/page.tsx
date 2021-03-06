import { React, Component, redux, rclass, rtypes } from "../app-framework";

import { AccountCreationToken } from "./account-creation-token";
import { SiteSettings } from "./site-settings";
import { StripeAPIKeys } from "./stripe-api-keys";
//import { SubscriptionManager } from "./subscription-manager";
import { SystemNotifications } from "./system-notifications";
import { UserSearch } from "./users/user-search";
import { List } from "immutable";
import { SiteLicenses } from "../site-licenses/admin/component";

import { User } from "./store";

interface ReduxProps {
  user_search_state: "edit" | "running";
  user_search_status: string;
  user_search_query: string;
  user_search_result: List<User>;
}

require("./init").init(redux);
const admin_actions = redux.getActions("admin-page");

export const AdminPage = rclass(
  class AdminPage extends Component<ReduxProps> {
    static reduxProps() {
      return {
        "admin-page": {
          user_search_state: rtypes.string,
          user_search_status: rtypes.string,
          user_search_query: rtypes.string,
          user_search_result: rtypes.immutable.List
        }
      };
    }

    render() {
      return (
        <div
          style={{
            overflowY: "scroll",
            overflowX: "hidden",
            padding: "30px 45px"
          }}
        >
          <h3>Administration</h3>
          <hr />
          <UserSearch
            state={this.props.user_search_state}
            status={this.props.user_search_status}
            query={this.props.user_search_query}
            result={this.props.user_search_result}
            search={admin_actions.fetch_for_user_search}
            set_query={admin_actions.set_user_search_query}
            clear_status={admin_actions.clear_user_search_status}
          />
          <hr />
          <SiteSettings />
          <hr />
          <SiteLicenses />
          <hr />
          <StripeAPIKeys />
          <hr />
          <AccountCreationToken />
          <hr />
          <SystemNotifications />
        </div>
      );
    }
  }
);
