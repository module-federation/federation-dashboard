import Head from "next/head";
import {
  Grid,
  Paper,
  makeStyles,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@material-ui/core";
import Link from "next/link";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";

import Layout from "../../../components/Layout";

const useStyles = makeStyles((theme) => ({
  title: {
    fontWeight: "bold",
  },
  container: {
    padding: 10,
  },
  panel: {
    padding: 10,
  },
  panelTitle: {
    fontWeight: "bold",
  },
}));

const GET_APPS = gql`
  query($name: String!) {
    applications(name: $name) {
      id
      name
      modules {
        id
        file
        name
        requires {
          name
        }
      }
      overrides {
        id
        version
        name
      }
      consumes {
        application {
          id
          name
        }
        name
        usedIn
      }
    }
  }
`;

const ConsumesTable = ({ consumes }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h6" className={classes.panelTitle}>
        Consumes
      </Typography>
      <Table>
        {consumes.map(({ name, application, usedIn }) => (
          <TableRow key={[application.id, name].join()}>
            <TableCell>
              <Typography>
                <Link href={`/applications/${application.name}/${name}`}>
                  <a>{name}</a>
                </Link>
              </Typography>
            </TableCell>
            <TableCell>
              {usedIn.map((file) => (
                <Typography variant="body2">{file}</Typography>
              ))}
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </>
  );
};

const OverridesTable = ({ overrides }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h6" className={classes.panelTitle}>
        Overrides
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography>Name</Typography>
            </TableCell>
            <TableCell>
              <Typography>Version</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {overrides.map(({ name, version }) => (
            <TableRow key={[name, version].join()}>
              <TableCell>
                <Typography>{name}</Typography>
              </TableCell>
              <TableCell>
                <Typography>{version}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

const ModulesTable = ({ application, modules }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h6" className={classes.panelTitle}>
        Modules
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography>Name</Typography>
            </TableCell>
            <TableCell>
              <Typography>File</Typography>
            </TableCell>
            <TableCell>
              <Typography>Requires</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {modules.map(({ name, file, requires }) => (
            <TableRow key={[application.id, name].join()}>
              <TableCell>
                <Typography>
                  <Link href={`/applications/${application.name}/${name}`}>
                    {name}
                  </Link>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography>{file}</Typography>
              </TableCell>
              <TableCell>
                <Typography>
                  {requires.map(({ name }) => name).join(", ")}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

const Application = () => {
  const classes = useStyles();
  const router = useRouter();
  const { data } = useQuery(GET_APPS, {
    variables: { name: router.query.application },
  });

  return (
    <Layout>
      <Head>
        <title>Federated Modules Dashboard</title>
      </Head>
      <div className={classes.container}>
        {data &&
          data.applications.map((application) => (
            <div key={application.id}>
              <Typography variant="h4" className={classes.title}>
                {application.name}
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper className={classes.panel} elevation={3}>
                    <ModulesTable
                      application={application}
                      modules={application.modules}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={6}>
                  <Paper className={classes.panel} elevation={3}>
                    <OverridesTable overrides={application.overrides} />
                  </Paper>
                </Grid>

                <Grid item xs={6}>
                  <Paper className={classes.panel} elevation={3}>
                    <ConsumesTable consumes={application.consumes} />
                  </Paper>
                </Grid>
              </Grid>
            </div>
          ))}
      </div>
    </Layout>
  );
};

export default Application;
