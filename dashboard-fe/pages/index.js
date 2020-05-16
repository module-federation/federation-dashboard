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

const Applications = ({ applications }) => {
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
    consumes.forEach(({ name, application: { id: applicationId }, usedIn }) => {
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

  return (
    <Table aria-label="simple table">
      <TableHead>
        <TableRow className={classes.headerRow}>
          <TableCell />
          {applications.map(({ id, name }) => (
            <TableCell align="center" key={`application:${id}`}>
              <Typography variant="h5" className={classes.headerCell}>
                <Link href={`/applications/${name}`}>{name}</Link>
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
        {modules.map(({ name, absoluteId, applicationName, requires }) => (
          <TableRow key={`module:${absoluteId}`}>
            <TableCell align="right">
              <Typography variant="body1">
                <Link href={`/applications/${applicationName}/${name}`}>
                  {name}
                </Link>
              </Typography>
            </TableCell>
            {applications.map(({ id: appId, name }) => (
              <TableCell
                align="center"
                key={`${name}:app:${appId}:mod:${absoluteId}`}
              >
                {modulesById[absoluteId].applicationId === appId && <UpArrow />}
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
            <TableCell align="left">
              <Typography variant="body1">
                {requires.map(({ name }) => name).join(", ")}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
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
    consumes.forEach(({ application: { name: appName }, name, usedIn }) => {
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

const Home = () => {
  const { data } = useQuery(GET_APPS);
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Layout>
      <Head>
        <title>Federated Modules Dashboard</title>
      </Head>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="simple tabs example"
      >
        <Tab label="Dependency Graph" />
        <Tab label="Dependency Table" />
      </Tabs>
      {data && value === 0 && (
        <ModuleChordChart applications={data.applications} />
      )}
      {data && value === 1 && <Applications applications={data.applications} />}
    </Layout>
  );
};

export default Home;
