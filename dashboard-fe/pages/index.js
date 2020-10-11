import Head from "next/head";
import { Typography, Tabs, Tab, makeStyles } from "@material-ui/core";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";
import { observer } from "mobx-react";
import { get } from "lodash";

import ApplicationsTable from "../components/ApplicationsTable";
import ModuleChordChart from "../components/ModuleChordChart";
import ModuleNodeGraph from "../components/ModuleNodeGraph";
const ModuleUMLDiagram =
  typeof window === "undefined"
    ? () => <div />
    : require("../components/ModuleUMLDiagram.tsx").default;
import Layout from "../components/Layout";
import withAuth from "../components/with-auth";
import store from "../src/store";

const GET_APPS = gql`
  query($group: String!, $environment: String!) {
    groups(name: $group) {
      applications {
        id
        name
        versions(latest: true, environment: $environment) {
          modules {
            id
            name
            requires
          }
          overrides {
            id
            name
            version
          }
          consumes {
            application {
              id
              name
            }
            name
            usedIn {
              file
            }
          }
        }
      }
    }
  }
`;

const useHomeStyles = makeStyles({
  helpParagraph: {
    marginTop: "1em"
  }
});

const Home = () => {
  const { data } = useQuery(GET_APPS, {
    variables: {
      environment: store.environment,
      group: store.group
    }
  });
  const [currentTab, currentTabSet] = React.useState(0);
  const classes = useHomeStyles();

  const applications = get(data, "groups[0].applications", []).filter(
    ({ versions }) => versions && versions.length > 0
  );

  return (
    <Layout>
      <Head>
        <title>Federated Modules Dashboard</title>
      </Head>
      {applications && applications.length > 0 && (
        <>
          <Tabs
            value={currentTab}
            onChange={(event, newValue) => {
              currentTabSet(newValue);
            }}
            aria-label="simple tabs example"
          >
            <Tab label="UML" />
            <Tab label="Dependency Table" />
            {applications.length > 1 && <Tab label="Node Graph" />}
            {applications.length > 1 && <Tab label="Dependency Graph" />}
          </Tabs>
          <div style={{ display: currentTab === 0 ? "block" : "none" }}>
            {applications.length > 0 && (
              <ModuleUMLDiagram
                applications={applications}
                size={applications.length}
              />
            )}
          </div>
          <div style={{ display: currentTab === 1 ? "block" : "none" }}>
            <ApplicationsTable applications={applications} />
          </div>
          {applications.length > 1 && (
            <div style={{ display: currentTab === 2 ? "block" : "none" }}>
              <ModuleNodeGraph applications={applications} />
            </div>
          )}
          {applications.length > 1 && (
            <div style={{ display: currentTab === 3 ? "block" : "none" }}>
              <ModuleChordChart applications={applications} />
            </div>
          )}
        </>
      )}
      {data && applications.length === 0 && (
        <>
          <img src="/empty-data.svg" style={{ maxHeight: 400 }}></img>
          <Typography variant="h5">
            Get Started With Federated Modules
          </Typography>
          <Typography className={classes.helpParagraph}>
            If you already have applications that create or consume Federated
            Modules then you can import their metadata into this dashboard using
            the
            <a
              href="https://www.npmjs.com/package/@module-federation/dashboard-plugin"
              target="_blank"
            >
              @module-federation/dashboard-plugin
            </a>
            .
          </Typography>
          <Typography className={classes.helpParagraph}>
            If you have an application that you want to configure to import or
            export Federated Modules then use the{" "}
            <Link href="/applications/new">
              <a>Configuration Wizard</a>
            </Link>
            .
          </Typography>
        </>
      )}
    </Layout>
  );
};

export default withAuth(observer(Home));
