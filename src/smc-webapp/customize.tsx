/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
/*
CoCalc: Collaborative Calculation in the Cloud
Copyright (C) 2016, Sagemath Inc.
---

Site Customize -- dynamically customize the look of CoCalc for the client.
*/

import { redux, Redux, rclass, rtypes, Store } from "./app-framework";
import * as React from "react";
import { Loading } from "./r_misc";

// import { SiteSettings as SiteSettingsConfig } from "smc-util/db-schema/site-defaults";
import { callback2 } from "smc-util/async-utils";
const misc = require("smc-util/misc");
import * as theme from "smc-util/theme";
import {
  split_iframe_comm_hosts,
  site_settings_conf
} from "smc-util/db-schema/site-defaults";

import {
  KUCALC_DISABLED,
  KUCALC_COCALC_COM,
  KUCALC_ON_PREMISES
} from "smc-util/db-schema/site-defaults";

// this sets UI modes for using a kubernetes based back-end
// 'yes' (historic value) equals 'cocalc.com'
function validate_kucalc(k?): string {
  if (k == null) return KUCALC_DISABLED;
  const val = k.trim().toLowerCase();
  if ([KUCALC_DISABLED, KUCALC_COCALC_COM, KUCALC_ON_PREMISES].includes(val)) {
    return val;
  }
  console.warn(`site settings customize: invalid kucalc value ${k}`);
  return KUCALC_DISABLED;
}

const result: any[] = [];
for (const k in site_settings_conf) {
  const v = site_settings_conf[k];
  const value: any =
    typeof v.to_val === "function" ? v.to_val(v.default) : v.default;
  result.push([k, value]);
}
const defaults = misc.dict(result);
defaults.is_commercial = defaults.commercial;
defaults._is_configured = false; // will be true after set via call to server

// TODO type the store. it's an extension of what's in SiteSettings
// type SiteSettings = { [k in keyof SiteSettingsConfig]: any  };
//
// interface CustomizeStoreState extends SiteSettings {
//   _is_configured: any;
// }

class CustomizeStore extends Store<any> {
  async until_configured(): Promise<void> {
    if (this.get("_is_configured")) return;
    await callback2(this.wait, { until: () => this.get("_is_configured") });
  }

  get_iframe_comm_hosts(): string[] {
    const hosts = this.get("iframe_comm_hosts");
    if (hosts == null) return [];
    // ATTN: if you change this regex, also change smc-util/db-schema/site-defaults.ts
    return split_iframe_comm_hosts(hosts);
  }
}

redux.createStore("customize", CustomizeStore, defaults);
const actions = redux.createActions("customize");
// really simple way to have a default value -- gets changed below once the $?.get returns.
actions.setState({ is_commercial: true, ssh_gateway: true });

// If we are running in the browser, then we customize the schema.  This also gets run on the backend
// to generate static content, which can't be customized.
export let commercial: boolean = defaults.is_commercial;

if (typeof $ !== "undefined" && $ != undefined) {
  $.get((window as any).app_base_url + "/customize", function(obj, status) {
    if (status === "success") {
      // TODO make this a to_val function in site_settings_conf.kucalc
      obj.kucalc = validate_kucalc(obj.kucalc);

      for (const k in site_settings_conf) {
        const v = site_settings_conf[k];
        obj[k] = obj[k] ?? v.default;
        if (typeof v.to_val === "function") {
          obj[k] = v.to_val(obj[k]);
        }
      }

      // set some special cases, backwards compatibility
      commercial = obj.is_commercial = obj.commercial;

      obj._is_configured = true;
      actions.setState(obj);
    }
  });
}

interface Props0 {
  text: React.ReactNode;
  color?: string;
}

interface ReduxProps {
  help_email: string;
}

const HelpEmailLink0 = rclass<Props0>(
  class HelpEmailLink extends React.Component<Props0 & ReduxProps> {
    public static reduxProps() {
      return {
        customize: {
          help_email: rtypes.string
        }
      };
    }

    public render() {
      const style: React.CSSProperties = {};
      if (this.props.color != undefined) {
        style.color = this.props.color;
      }

      if (this.props.help_email) {
        return (
          <a
            href={`mailto:${this.props.help_email}`}
            target="_blank"
            style={style}
          >
            {this.props.text != undefined
              ? this.props.text
              : this.props.help_email}
          </a>
        );
      } else {
        return <Loading />;
      }
    }
  }
);

interface HelpEmailLink {
  text?: React.ReactNode;
  color?: string;
}

export function HelpEmailLink(props: HelpEmailLink) {
  return (
    <Redux>
      <HelpEmailLink0 text={props.text} color={props.color} />
    </Redux>
  );
}

interface SiteNameProps {
  site_name: string;
}

const SiteName0 = rclass<{}>(
  class SiteName extends React.Component<SiteNameProps> {
    public static reduxProps() {
      return {
        customize: {
          site_name: rtypes.string
        }
      };
    }

    public render(): JSX.Element {
      if (this.props.site_name) {
        return <span>{this.props.site_name}</span>;
      } else {
        return <Loading />;
      }
    }
  }
);

export function SiteName() {
  return (
    <Redux>
      <SiteName0 />
    </Redux>
  );
}

interface SiteDescriptionProps {
  style?: React.CSSProperties;
  site_description?: string;
}

const SiteDescription0 = rclass<{ style?: React.CSSProperties }>(
  class SiteDescription extends React.Component<SiteDescriptionProps> {
    public static reduxProps() {
      return {
        customize: {
          site_description: rtypes.string
        }
      };
    }

    public render(): JSX.Element {
      const style =
        this.props.style != undefined
          ? this.props.style
          : { color: "#666", fontSize: "16px" };
      if (this.props.site_description != undefined) {
        return <span style={style}>{this.props.site_description}</span>;
      } else {
        return <Loading />;
      }
    }
  }
);

export function SiteDescription({ style }: { style?: React.CSSProperties }) {
  return (
    <Redux>
      <SiteDescription0 style={style} />
    </Redux>
  );
}

// TODO also make this configurable? Needed in the <Footer/> and maybe elsewhere …
export const CompanyName = function CompanyName() {
  return <span>{theme.COMPANY_NAME}</span>;
};

interface ReactProps {
  style: React.CSSProperties;
}

interface ReduxProps {
  terms_of_service: string;
}

const TermsOfService0 = rclass<ReactProps>(
  class TermsOfService extends React.Component<ReactProps & ReduxProps> {
    public static reduxProps = () => {
      return {
        customize: {
          terms_of_service: rtypes.string
        }
      };
    };

    render() {
      if (this.props.terms_of_service == undefined) {
        return <div></div>;
      }
      return (
        <div
          style={this.props.style}
          dangerouslySetInnerHTML={{ __html: this.props.terms_of_service }}
        ></div>
      );
    }
  }
);

export function TermsOfService(props: { style: React.CSSProperties }) {
  return (
    <Redux>
      <TermsOfService0 style={props.style} />
    </Redux>
  );
}

interface AccountCreationEmailInstructionsProps {
  account_creation_email_instructions: string;
}

const AccountCreationEmailInstructions0 = rclass<{}>(
  class AccountCreationEmailInstructions extends React.Component<
    AccountCreationEmailInstructionsProps
  > {
    public static reduxProps = () => {
      return {
        customize: {
          account_creation_email_instructions: rtypes.string
        }
      };
    };

    render() {
      return (
        <h3 style={{ marginTop: 0, textAlign: "center" }}>
          {this.props.account_creation_email_instructions}
        </h3>
      );
    }
  }
);

export function AccountCreationEmailInstructions() {
  return (
    <Redux>
      <AccountCreationEmailInstructions0 />
    </Redux>
  );
}

// first step of centralizing these URLs in one place → collecting all such pages into one
// react-class with a 'type' prop is the next step (TODO)
// then consolidate this with the existing site-settings database (e.g. TOS above is one fixed HTML string with an anchor)
const app_base_url = (window && (window as any).app_base_url) || ""; // fallback for react-static
export const PolicyIndexPageUrl = app_base_url + "/policies/index.html";
export const PolicyPricingPageUrl = app_base_url + "/policies/pricing.html";
export const PolicyPrivacyPageUrl = app_base_url + "/policies/privacy.html";
export const PolicyCopyrightPageUrl = app_base_url + "/policies/copyright.html";
export const PolicyTOSPageUrl = app_base_url + "/policies/terms.html";
