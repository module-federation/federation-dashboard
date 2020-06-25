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
  TableCell
} from "@material-ui/core";
import Link from "next/link";
import gql from "graphql-tag";
import { useLazyQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import clsx from "clsx";

import Layout from "../../../components/Layout";
import { useFetchUser } from "../../../lib/user";
import React from "react";

const useStyles = makeStyles(theme => ({
  title: {
    fontWeight: "bold"
  },
  container: {
    padding: 10
  },
  panel: {
    padding: 10
  },
  panelTitle: {
    fontWeight: "bold"
  },
  dependenciesTable: {
    marginBottom: "3em"
  },
  overridden: {
    fontWeight: "bold"
  }
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
        usedIn {
          file
          url
        }
      }
      dependencies {
        name
        version
      }
      devDependencies {
        name
        version
      }
      optionalDependencies {
        name
        version
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
        {consumes
          .filter(({ application }) => application)
          .map(({ name, application, usedIn }) => (
            <TableRow key={[application.id, name].join()}>
              <TableCell>
                <Typography>
                  <Link href={`/applications/${application.name}/${name}`}>
                    <a>{name}</a>
                  </Link>
                </Typography>
              </TableCell>
              <TableCell>
                {usedIn.map(({ file, url }) => (
                  <Typography variant="body2">
                    <a href={url}>{file}</a>
                  </Typography>
                ))}
              </TableCell>
            </TableRow>
          ))}
      </Table>
    </>
  );
};

const DependenciesTable = ({ title, dependencies, overrides }) => {
  const classes = useStyles();
  return (
    <div className={classes.dependenciesTable}>
      <Typography variant="h6" className={classes.panelTitle}>
        {title}
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
          {dependencies.map(({ name, version }) => {
            const isOverride =
              overrides.find(({ name: overName }) => overName === name) !==
              undefined;
            return (
              <TableRow key={[title, name, version].join()}>
                <TableCell>
                  <Typography
                    className={clsx({ [classes.overridden]: isOverride })}
                  >
                    {name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    className={clsx({ [classes.overridden]: isOverride })}
                  >
                    {version}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const OverridesTable = ({ overrides }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h6" className={classes.panelTitle}>
        Shared
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

const ModulesTable = ({ application, modules, overrides }) => {
  const classes = useStyles();
  const findVersion = name => {
    let ov = overrides.find(({ name: ovName }) => ovName === name);
    return ov ? ` (${ov.version})` : "";
  };
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
                  {requires
                    .map(({ name }) => `${name}${findVersion(name)}`)
                    .join(", ")}
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
  const [getData, { data }] = useLazyQuery(GET_APPS);

  React.useEffect(() => {
    if (router.query.application) {
      getData({
        variables: { name: router.query.application }
      });
    }
  }, [router]);
  const { user, loading } = useFetchUser();

  return (
    <Layout user={user} loading={loading}>
      <Head>
        <title>Federated Modules Dashboard</title>
      </Head>
      <div className={classes.container}>
        {data &&
          data.applications.map(application => (
            <div key={application.id}>
              <Grid container>
                <Grid item xs={9}>
                  <Typography variant="h4" className={classes.title}>
                    {application.name}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper className={classes.panel} elevation={3}>
                    <ModulesTable
                      application={application}
                      modules={application.modules}
                      overrides={application.overrides}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={6}>
                  <Paper className={classes.panel} elevation={3}>
                    <OverridesTable overrides={application.overrides} />
                  </Paper>
                </Grid>

                {application.consumes.length > 0 && (
                  <Grid item xs={6}>
                    <Paper className={classes.panel} elevation={3}>
                      <ConsumesTable consumes={application.consumes} />
                    </Paper>
                  </Grid>
                )}

                <Grid item xs={6}>
                  <Paper className={classes.panel} elevation={3}>
                    {application.dependencies.length > 0 && (
                      <DependenciesTable
                        title="Direct Dependencies"
                        dependencies={application.dependencies}
                        overrides={application.overrides}
                      />
                    )}
                    {application.devDependencies.length > 0 && (
                      <DependenciesTable
                        title="Development Dependencies"
                        dependencies={application.devDependencies}
                        overrides={application.overrides}
                      />
                    )}
                    {application.optionalDependencies.length > 0 && (
                      <DependenciesTable
                        title="Optional Dependencies"
                        dependencies={application.optionalDependencies}
                        overrides={application.overrides}
                      />
                    )}
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
