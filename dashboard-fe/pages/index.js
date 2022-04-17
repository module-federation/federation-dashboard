import React from "react";
import Head from "next/head";
import { Typography, Tabs, Tab, makeStyles } from "@material-ui/core";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { observer } from "mobx-react";
import { get } from "lodash";
import dynamic from "next/dynamic";

const Layout = dynamic(() => import("../components/Layout"), { ssr: false });

const ApplicationsTable = dynamic(
  () => import("../components/ApplicationsTable"),
  { ssr: false }
);
const ModuleChordChart = dynamic(
  () => import("../components/ModuleChordChart"),
  { ssr: false }
);
const ModuleNodeGraph = dynamic(() => import("../components/ModuleNodeGraph"), {
  ssr: false,
});
const ModuleUMLDiagram = dynamic(
  () => import("../components/ModuleUMLDiagram.tsx"),
  { ssr: false }
);

const GET_APPS = gql`
  query ($group: String!, $environment: String!) {
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
    marginTop: "1em",
  },
});

const Home = () => {
  const store = require("../src/store");
  const { data } = useQuery(GET_APPS, {
    variables: {
      environment: store.environment,
      group: store.group,
    },
  });
  const [currentTab, currentTabSet] = React.useState(0);
  const classes = useHomeStyles();

  const applications = get(data, "groups[0].applications", []).filter(
    ({ versions }) => versions && versions.length > 0
  );

  return (
    <Layout>
      <Head>
        <title>Medusa</title>
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
          {currentTab === 0 && (
            <div>
              {applications.length > 0 && (
                <ModuleUMLDiagram
                  applications={applications}
                  size={applications.length}
                />
              )}
            </div>
          )}
          {currentTab === 1 && (
            <div>
              <ApplicationsTable applications={applications} />
            </div>
          )}
          {currentTab === 2 && applications.length > 1 && (
            <div>
              <ModuleNodeGraph applications={applications} />
            </div>
          )}
          {currentTab === 3 && applications.length > 1 && (
            <div>
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
              rel="noreferrer"
            >
              @module-federation/dashboard-plugin
            </a>
            .
          </Typography>
          <Typography>
            <br />
            Go to{" "}
            <Link href="/settings" passHref>
              settings
            </Link>{" "}
            and configure read/write tokens. You will not be able to connect to
            Medusa without API tokens
            <br />
          </Typography>
          <Typography className={classes.helpParagraph}>
            If you have an application that you want to configure to import or
            export Federated Modules then use the{" "}
            <Link href="/applications/new" passHref>
              <a>Configuration Wizard</a>
            </Link>
            .
            <br />
          </Typography>
          <Typography variant="h5">
            This is <strong>alpha</strong> software!
          </Typography>
          <Typography>
            Some features are incomplete. We will keep improving the platform
            and soon add a roadmap page. <br />
            Many are looking forward to Remote Module Management. <br />
            Medusa has this capability built-in, but we have not yet released
            the capability in the webpack plugin.
          </Typography>
        </>
      )}
    </Layout>
  );
};

export default observer(Home);
