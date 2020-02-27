import * as React from "react";
import { analytics_event } from "../../tracker";
import { Menu } from "antd";

const misc = require("smc-util/misc");
import {
  Icon,
  NonMemberProjectWarning,
  NoNetworkProjectWarning
} from "../../r_misc";
import { redux, rtypes, rclass } from "../../app-framework";
import { JupyterServerPanel } from "../plain-jupyter-server";
import { JupyterLabServerPanel } from "../jupyterlab-server";
import {
  AddCollaboratorsPanel,
  CurrentCollaboratorsPanel
} from "../../collaborators";

import { TitleDescriptionBox } from "./title-description-box";
import { UpgradeUsage } from "./upgrade-usage";
import { HideDeleteBox } from "./hide-delete-box";
import { SagewsControl } from "./sagews-control";
import { ProjectCapabilities } from "./project-capabilites";
import { ProjectControl } from "./project-control";
import { Customer, ProjectMap, UserMap } from "smc-webapp/todo-types";
import { Project } from "./types";
import { SSHPanel } from "./ssh";
import { KUCALC_COCALC_COM } from "smc-util/db-schema/site-defaults";

const { webapp_client } = require("../../webapp_client");
const { Col, Row } = require("react-bootstrap");

interface ReactProps {
  project_id: string;
  account_id?: string;
  project: Project;
  user_map: UserMap;
  customer?: Customer;
  email_address?: string;
  project_map?: ProjectMap; // if this changes, then available upgrades change, so we may have to re-render, if editing upgrades.
  name: string;
  anItem?: string;
}

interface ReduxProps {
  get_total_upgrades: Function;
  groups: string[];

  kucalc: string;
  ssh_gateway: boolean;

  get_course_info: Function;
  get_total_upgrades_you_have_applied: Function;
  get_upgrades_you_applied_to_project: Function;
  get_total_project_quotas: Function;
  get_upgrades_to_project: Function;
  compute_images: Map<string, any>;
  all_projects_have_been_loaded: boolean;

  configuration: Map<string, any>;
  available_features: object;
}

export const Body = rclass<ReactProps>(
  class Body extends React.Component<
    ReactProps & ReduxProps,
    { anItem: string }
  > {
    public static reduxProps({ name }) {
      return {
        account: {
          get_total_upgrades: rtypes.func,
          groups: rtypes.array
        },
        customize: {
          kucalc: rtypes.string
        },
        projects: {
          get_course_info: rtypes.func,
          get_total_upgrades_you_have_applied: rtypes.func,
          get_upgrades_you_applied_to_project: rtypes.func,
          get_total_project_quotas: rtypes.func,
          get_upgrades_to_project: rtypes.func,
          compute_images: rtypes.immutable.Map,
          all_projects_have_been_loaded: rtypes.bool
        },
        [name]: {
          configuration: rtypes.immutable,
          available_features: rtypes.object
        }
      };
    }

    constructor(props) {
      super(props);
      this.state = { anItem: "" };
    }

    shouldComponentUpdate(props) {
      return (
        misc.is_different(this.props, props, [
          "project",
          "user_map",
          "project_map",
          "compute_images",
          "configuration",
          "available_features",
          "all_projects_have_been_loaded"
        ]) ||
        (props.customer != undefined &&
          !props.customer.equals(this.props.customer))
      );
    }

    render() {
      // get the description of the share, in case the project is being shared
      const id = this.props.project_id;

      const upgrades_you_can_use = this.props.get_total_upgrades();

      const course_info = this.props.get_course_info(this.props.project_id);
      const upgrades_you_applied_to_all_projects = this.props.get_total_upgrades_you_have_applied();
      const upgrades_you_applied_to_this_project = this.props.get_upgrades_you_applied_to_project(
        id
      );
      const total_project_quotas = this.props.get_total_project_quotas(id); // only available for non-admin for now.
      const all_upgrades_to_this_project = this.props.get_upgrades_to_project(
        id
      );
      const store = redux.getStore("projects");
      const site_license_upgrades = store.get_total_site_license_upgrades_to_project(
        this.props.project_id
      );
      const site_license_ids: string[] = store.get_site_license_ids(
        this.props.project_id
      );
      const allow_urls = store.allow_urls_in_emails(this.props.project_id);

      const { commercial } = require("../../customize");

      const { is_available } = require("../../project_configuration");
      const available = is_available(this.props.configuration);
      const have_jupyter_lab = available.jupyter_lab;
      const have_jupyter_notebook = available.jupyter_notebook;

      const componentSwitch = key => {
        switch (key) {
          case "TitleDescriptionBox": {
            return (
              <TitleDescriptionBox
                project_id={id}
                project_title={this.props.project.get("title") || ""}
                description={this.props.project.get("description") || ""}
                actions={redux.getActions("projects")}
              />
            );
            break;
          }
          case "UpgradeUsage": {
            return (
              <UpgradeUsage
                project_id={id}
                project={this.props.project}
                actions={redux.getActions("projects")}
                user_map={this.props.user_map}
                account_groups={this.props.groups}
                upgrades_you_can_use={upgrades_you_can_use}
                upgrades_you_applied_to_all_projects={
                  upgrades_you_applied_to_all_projects
                }
                upgrades_you_applied_to_this_project={
                  upgrades_you_applied_to_this_project
                }
                total_project_quotas={total_project_quotas}
                all_upgrades_to_this_project={all_upgrades_to_this_project}
                all_projects_have_been_loaded={
                  this.props.all_projects_have_been_loaded
                }
                site_license_upgrades={site_license_upgrades}
                site_license_ids={site_license_ids}
              />
            );
            break;
          }
          case "HideDeleteBox": {
            return (
              <HideDeleteBox
                key="hidedelete"
                project={this.props.project}
                actions={redux.getActions("projects")}
              />
            );
            break;
          }
        }
      };

      return (
        <div>
          {commercial &&
          total_project_quotas != undefined &&
          !total_project_quotas.member_host ? (
            <NonMemberProjectWarning
              upgrade_type="member_host"
              upgrades_you_can_use={upgrades_you_can_use}
              upgrades_you_applied_to_all_projects={
                upgrades_you_applied_to_all_projects
              }
              course_info={course_info}
              account_id={webapp_client.account_id}
              email_address={this.props.email_address}
            />
          ) : (
            undefined
          )}
          {commercial &&
          total_project_quotas != undefined &&
          !total_project_quotas.network ? (
            <NoNetworkProjectWarning
              upgrade_type="network"
              upgrades_you_can_use={upgrades_you_can_use}
              upgrades_you_applied_to_all_projects={
                upgrades_you_applied_to_all_projects
              }
            />
          ) : (
            undefined
          )}
          <h1 style={{ marginTop: "0px" }}>
            <Icon name="wrench" /> Project Settings
          </h1>
          <Row>
            <Col sm={2}>
              <Menu
                defaultSelectedKeys={["TitleDescriptionBox"]}
                mode="inline"
                onClick={e => {
                  this.setState({ anItem: e.key });
                  //console.log(e.key);
                  //console.log(this.state.anItem);
                }}
                theme="dark"
              >
                <Menu.Item key="TitleDescriptionBox">
                  Title and Description
                </Menu.Item>
                <Menu.Item key="UpgradeUsage">UpgradeUsage</Menu.Item>
              </Menu>
            </Col>
            <Col sm={8}>{componentSwitch(this.state.anItem)}</Col>
          </Row>
          <Row margin="200px">
            <HideDeleteBox
              key="hidedelete"
              project={this.props.project}
              actions={redux.getActions("projects")}
            />
            {this.props.ssh_gateway ||
            this.props.kucalc === KUCALC_COCALC_COM ? (
              <SSHPanel
                key="ssh-keys"
                project={this.props.project}
                user_map={this.props.user_map}
                account_id={this.props.account_id}
              />
            ) : (
              undefined
            )}
            <ProjectCapabilities
              name={this.props.name}
              key={"capabilities"}
              project={this.props.project}
            />
            <CurrentCollaboratorsPanel
              key="current-collabs"
              project={this.props.project}
              user_map={this.props.user_map}
            />
            <AddCollaboratorsPanel
              key="new-collabs"
              project={this.props.project}
              on_invite={() => {
                return analytics_event("project_settings", "add collaborator");
              }}
              allow_urls={allow_urls}
            />
            <ProjectControl key="control" project={this.props.project} />
            <SagewsControl key="worksheet" project={this.props.project} />
            {have_jupyter_notebook ? (
              <JupyterServerPanel
                key="jupyter"
                project_id={this.props.project_id}
              />
            ) : (
              undefined
            )}
            {have_jupyter_lab ? (
              <JupyterLabServerPanel
                key="jupyterlab"
                project_id={this.props.project_id}
              />
            ) : (
              undefined
            )}
          </Row>
        </div>
      );
    }
  }
);
