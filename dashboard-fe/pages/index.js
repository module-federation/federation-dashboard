import Head from "next/head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from "@material-ui/core";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import UpArrow from "@material-ui/icons/PublishTwoTone";
import DownArrow from "@material-ui/icons/CloudDownloadOutlined";
import Link from "next/link";

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
      { name, applicationId, applications: [] },
    ])
  );

  applications.forEach(({ id: consumingApplication, consumes }) => {
    consumes.forEach(({ name, application: { id: applicationId } }) => {
      modulesById[`${applicationId}:${name}`].applications.push(
        consumingApplication
      );
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
                {modulesById[absoluteId].applications.includes(appId) && (
                  <DownArrow />
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

const Home = () => {
  const { data } = useQuery(GET_APPS);

  return (
    <Layout>
      <Head>
        <title>Federated Modules Dashboard</title>
      </Head>
      {data && <Applications applications={data.applications} />}
    </Layout>
  );
};

export default Home;
