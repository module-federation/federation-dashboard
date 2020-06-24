import Head from "next/head";
import { Typography, Tabs, Tab, makeStyles } from "@material-ui/core";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";

import ApplicationsTable from "../components/ApplicationsTable";
import ModuleChordChart from "../components/ModuleChordChart";
import ModuleNodeGraph from "../components/ModuleNodeGraph";
const ModuleUMLDiagram =
  typeof window === "undefined"
    ? () => <div />
    : require("../components/ModuleUMLDiagram.tsx").default;

import Layout from "../components/Layout";

const GET_APPS = gql`
  {
    applications {
      id
      name
      modules {
        id
        name
        requires {
          name
        }
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
`;

const useHomeStyles = makeStyles({
  helpParagraph: {
    marginTop: "1em",
  },
});

const Home = () => {
  const { data } = useQuery(GET_APPS);
  const [currentTab, currentTabSet] = React.useState(0);
  const classes = useHomeStyles();

  return (
    <Layout>
      <Head>
        <title>Federated Modules Dashboard</title>
      </Head>
      {data && data.applications.length > 0 && (
        <>
          {data.applications.length > 1 && (
            <>
              <Tabs
                value={currentTab}
                onChange={(event, newValue) => {
                  currentTabSet(newValue);
                }}
                aria-label="simple tabs example"
              >
                <Tab label="UML" />
                <Tab label="Node Graph" />
                <Tab label="Dependency Graph" />
                <Tab label="Dependency Table" />
              </Tabs>
              <div style={{ display: currentTab === 0 ? "block" : "none" }}>
                <ModuleUMLDiagram applications={data.applications} />
              </div>
              <div style={{ display: currentTab === 1 ? "block" : "none" }}>
                <ModuleNodeGraph applications={data.applications} />
              </div>
              <div style={{ display: currentTab === 2 ? "block" : "none" }}>
                <ModuleChordChart applications={data.applications} />
              </div>
              <div style={{ display: currentTab === 3 ? "block" : "none" }}>
                <ApplicationsTable applications={data.applications} />
              </div>
            </>
          )}
          {data.applications.length === 1 && (
            <ApplicationsTable applications={data.applications} />
          )}
        </>
      )}
      {data && data.applications.length === 0 && (
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

export default Home;
