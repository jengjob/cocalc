import * as React from "react";
import { Popover } from "antd";
import { Icon } from "./r_misc";
const { NavItem } = require("react-bootstrap");
import { AccountActions } from "./account";
import { COLORS } from "smc-util/theme";
//{COLORS} = require('smc-util/theme');

interface Props {
  icon: React.ReactNode | String; // When clicked, show popover
  links: React.ReactNode; // Should change view to correct account settings tab when clicked
  label_class: string; // class name for AccountTabDropdown label
  show_label: boolean; // This tells button to show the word "account"
  is_active: boolean; // if true set button background to ACTIVE_BG_COLOR
  user_label: string;
}

export const AccountTabDropdown: React.FC<Props> = ({
  icon,
  links,
  label_class,
  show_label,
  is_active,
  user_label
}) => {
  // If icon is a string then use the Icon component
  // Else (it is a node already) just render
  // Do I still need to do something like this? change in desktop_app makes me think I dont have to because its never passed in as a String anymore
  if (typeof icon == "string") {
    icon = <Icon>icon</Icon>;
  }

  return (
    <Popover
      placement="bottom"
      title={"Signed in as " + user_label}
      trigger="click"
      content={links}
    >
      <NavItem
        style={{
          float: "left",
          position: "relative",
          height: "30px"
        }}
      >
        <div style={{ padding: "10px" }}>
          {icon}
          <span style={{ marginLeft: 5 }} className={label_class}>
            Account
          </span>
        </div>
      </NavItem>
    </Popover>
  );
};

// interface LinksProps {
//   actions: AccountActions;
// }
//Can you do this with react stuff? Couldnt find anything
function DropDownLinks(name, label, account_actions, page_actions) {
  return (
    <a
      style={{
        width: "100%",
        padding: "4px 8px 4px 16px",
        display: "block"
      }}
      className={"cocalc-account-button"}
      onClick={_ => {
        event.preventDefault();
        page_actions.set_active_tab("account"); // Set to account page
        account_actions.set_active_tab(name); /// Set to the Preferences tab
      }}
      href=""
    >
      {label}
    </a>
  );
}

export const DefaultAccountDropDownLinks: React.FC<> = ({
  account_actions, // Type AccountActions
  page_actions // PageActions (untyped for now)
}) => {
  return (
    <>
      <div className="cocalc-account-button-dropdown-links">
        {DropDownLinks("account", "Preferences", account_actions, page_actions)}
        {DropDownLinks("billing", "Billing", account_actions, page_actions)}
        {DropDownLinks("upgrades", "Upgrades", account_actions, page_actions)}
        {DropDownLinks("support", "Support", account_actions, page_actions)}
        {DropDownLinks("account", "Preferences", account_actions, page_actions)}
        <a
          style={{
            width: "100%",
            padding: "4px 8px 4px 16px",
            display: "block"
          }}
          className={"cocalc-account-button"}
          onClick={_ => {
            account_actions.sign_out();
          }}
          href=""
        >
          Sign out
        </a>
      </div>
    </>
  );
};
