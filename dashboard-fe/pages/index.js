import Head from "next/head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tabs,
  Tab,
  makeStyles,
} from "@material-ui/core";
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
    dashboard {
      versionManagementEnabled
    }
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
      versions {
        versions
        latest
      }
    }
  }
`;

const Applications = ({ applications, dashboard }) => {
  const classes = useStyles();
  const modules = applications
    .map(({ id, name, modules }) =>
      modules.map((mod) => ({
        ...mod,
        absoluteId: `${id}:${mod.name}`,
        applicationId: id,
        applicationName: name,
      }))
    )
    .flat();
  const modulesById = Object.fromEntries(
    modules.map(({ id, name, applicationId }) => [
      `${applicationId}:${name}`,
      { name, applicationId, applications: {} },
    ])
  );

  applications.forEach(({ id: consumingApplication, consumes }) => {
    consumes
      .filter(({ application }) => application)
      .forEach(({ name, application: { id: applicationId }, usedIn }) => {
        modulesById[`${applicationId}:${name}`].applications[
          consumingApplication
        ] = { count: usedIn.length };
      });
  });

  const overridesComplete = {};
  applications.forEach(({ id, overrides }) =>
    overrides.forEach(({ name }) => {
      overridesComplete[name] = [...(overridesComplete[name] || []), id];
    })
  );

  const findVersion = (applicationId, name) => {
    const { overrides } = applications.find(({ id }) => id === applicationId);
    let ov = overrides.find(({ name: ovName }) => ovName === name);
    return ov ? ` (${ov.version})` : "";
  };

  return (
    <Table aria-label="simple table">
      <TableHead>
        <TableRow className={classes.headerRow}>
          <TableCell />
          {applications.map(({ id, name, versions }) => (
            <TableCell align="center" key={`application:${id}`}>
              <Typography variant="h5">
                <Link href={`/applications/${name}`}>
                  <a className={classes.headerCell}>{name}</a>
                </Link>
                {dashboard.versionManagementEnabled && (
                  <Typography variant="body2">({versions.latest})</Typography>
                )}
              </Typography>
            </TableCell>
          ))}
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell colSpan={applications.length + 1}>
            <Typography variant="h5">Modules</Typography>
          </TableCell>
          <TableCell align="left">
            <Typography variant="body1">Requires</Typography>
          </TableCell>
        </TableRow>
        {modules.map(
          ({ name, absoluteId, applicationName, requires, applicationId }) => (
            <TableRow key={`module:${absoluteId}`}>
              <TableCell align="right">
                <Typography variant="body1">
                  <Link href={`/applications/${applicationName}/${name}`}>
                    <a>{name}</a>
                  </Link>
                </Typography>
              </TableCell>
              {applications.map(({ id: appId, name }) => (
                <TableCell
                  align="center"
                  key={`${name}:app:${appId}:mod:${absoluteId}`}
                >
                  {modulesById[absoluteId].applicationId === appId && (
                    <UpArrow />
                  )}
                  {modulesById[absoluteId].applications[appId] && (
                    <>
                      <Typography>
                        <DownArrow />{" "}
                        {modulesById[absoluteId].applications[appId].count}
                      </Typography>
                    </>
                  )}
                </TableCell>
              ))}
              <TableCell align="left" width="5%">
                <Typography variant="body1" noWrap>
                  {requires
                    .map(
                      ({ name }) => `${name}${findVersion(applicationId, name)}`
                    )
                    .join(", ")}
                </Typography>
              </TableCell>
            </TableRow>
          )
        )}
        <TableRow>
          <TableCell colSpan={applications.length + 2}>
            <Typography variant="h5">Overrides</Typography>
          </TableCell>
        </TableRow>
        {Object.entries(overridesComplete).map(([name, apps]) => (
          <TableRow key={`override:${name}`}>
            <TableCell align="right">
              <Typography variant="body1">{name}</Typography>
            </TableCell>
            {applications.map(({ id, name }) => (
              <TableCell align="center" key={`override:${name}:${id}`}>
                {apps.includes(id) ? <UpArrow /> : ""}
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

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
          <Typography variant="h5">
            Get Started With Federated Modules
          </Typography>
          <Typography className={classes.helpParagraph}>
            If you already have applications that create or consume Federated
            Modules then you can import their metadata into this dashboard using
            the{" "}
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
