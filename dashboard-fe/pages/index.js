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
import UpArrow from "@material-ui/icons/PublishTwoTone";
import DownArrow from "@material-ui/icons/CloudDownloadOutlined";
import Link from "next/link";
import { ResponsiveChord } from "@nivo/chord";
import { Graph } from "react-d3-graph";
import { useRouter } from "next/router";

import Layout from "../components/Layout";

const useStyles = makeStyles((theme) => ({
  headerRow: {
    background: theme.palette.primary.light,
  },
  headerCell: {
    color: theme.palette.primary.contrastText,
  },
}));

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

const ModuleChordChart = ({ applications }) => {
  const modules = applications.map(({ modules }) => modules).flat();
  const columns = applications.length + modules.length;
  const matrix = new Array(columns)
    .fill(0)
    .map(() => new Array(columns).fill(0));
  const keys = [];
  const appById = {};
  const modulesById = {};
  applications.forEach(({ id, name: appName, modules }) => {
    appById[id] = keys.length;
    keys.push(appName);
    modules.forEach(({ name: moduleName }) => {
      modulesById[`${appName}/${moduleName}`] = keys.length;
      keys.push(`${appName}/${moduleName}`);
    });
  });
  applications.forEach(({ id, consumes }) => {
    consumes
      .filter(({ application }) => application)
      .forEach(({ application: { name: appName }, name, usedIn }) => {
        const modId = `${appName}/${name}`;
        matrix[appById[id]][modulesById[modId]] = usedIn.length;
        matrix[modulesById[modId]][appById[id]] = usedIn.length;
      });
  });

  return (
    <div
      style={{
        height: 1200,
        width: "100%",
        marginTop: 50,
      }}
    >
      <ResponsiveChord
        matrix={matrix}
        keys={keys}
        margin={{ top: 60, right: 60, bottom: 90, left: 60 }}
        valueFormat=".2f"
        padAngle={0.02}
        innerRadiusRatio={0.96}
        innerRadiusOffset={0.02}
        arcOpacity={1}
        arcBorderWidth={1}
        arcBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
        ribbonOpacity={0.5}
        ribbonBorderWidth={1}
        ribbonBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
        enableLabel={true}
        label="id"
        labelOffset={12}
        labelRotation={-90}
        labelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
        colors={{ scheme: "nivo" }}
        isInteractive={true}
        arcHoverOpacity={1}
        arcHoverOthersOpacity={0.25}
        ribbonHoverOpacity={0.75}
        ribbonHoverOthersOpacity={0.25}
        animate={true}
        motionStiffness={90}
        motionDamping={7}
        legends={[
          {
            anchor: "bottom",
            direction: "row",
            justify: false,
            translateX: 0,
            translateY: 70,
            itemWidth: 80,
            itemHeight: 14,
            itemsSpacing: 0,
            itemTextColor: "#999",
            itemDirection: "left-to-right",
            symbolSize: 12,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000",
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

const NodeGraph = ({ applications }) => {
  const router = useRouter();

  const nodes = [];
  const links = [];
  applications.forEach(({ id: appId, name: appName, modules }) => {
    nodes.push({
      color: "darkgreen",
      id: appId,
      label: name,
      size: 800,
      symbolType: "wye",
    });
    modules.forEach(({ id: moduleId, name: moduleName }) => {
      nodes.push({
        color: "darkblue",
        id: moduleId,
        label: moduleName,
        symbolType: "diamond",
      });
      links.push({
        source: appId,
        target: moduleId,
        color: "green",
        type: "CURVE_SMOOTH",
      });
    });
  });
  applications.forEach(({ id: appId, name: appName, consumes }) => {
    consumes
      .filter(({ application }) => application)
      .forEach(
        ({ application: { id: modApp }, name: modName, id: modId, usedIn }) => {
          links.push({
            source: appId,
            target: `${modApp}:${modName}`,
            type: "CURVE_SMOOTH",
          });
        }
      );
  });
  const data = {
    nodes,
    links,
  };

  const myConfig = {
    width: 1200,
    height: 800,
    nodeHighlightBehavior: true,
    node: {
      color: "lightgreen",
      size: 400,
      fontSize: 16,
      highlightStrokeColor: "blue",
      highlightFontSize: 20,
      highlightFontWeight: "bold",
    },
    d3: {
      alphaTarget: 0.5,
      gravity: -300,
      linkLength: 150,
      linkStrength: 0.5,
      disableLinkForce: false,
    },
    link: {
      highlightColor: "darkblue",
      semanticStrokeWidth: true,
      markerHeight: 8,
      markerWidth: 8,
    },
    directed: true,
    panAndZoom: true,
  };
  const onClickNode = (nodeId) => {
    router.push(`/applications/${nodeId.replace(":", "/")}`);
  };
  return (
    <div
      style={{
        marginTop: 50,
      }}
    >
      <Graph
        id="graph-id"
        data={data}
        config={myConfig}
        onClickNode={onClickNode}
      />
    </div>
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
                <Tab label="Node Graph" />
                <Tab label="Dependency Graph" />
                <Tab label="Dependency Table" />
              </Tabs>
              <div style={{ display: currentTab === 0 ? "block" : "none" }}>
                <NodeGraph applications={data.applications} />
              </div>
              <div style={{ display: currentTab === 1 ? "block" : "none" }}>
                <ModuleChordChart applications={data.applications} />
              </div>
              <div style={{ display: currentTab === 2 ? "block" : "none" }}>
                <Applications
                  applications={data.applications}
                  dashboard={data.dashboard || {}}
                />
              </div>
            </>
          )}
          {data.applications.length === 1 && (
            <Applications
              applications={data.applications}
              dashboard={data.dashboard || {}}
            />
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
              href="https://npmjs.com/package/@module-federation/dashboard-plugin"
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
