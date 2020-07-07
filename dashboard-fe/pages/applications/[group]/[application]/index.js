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
  Select,
  MenuItem,
} from "@material-ui/core";
import Link from "next/link";
import gql from "graphql-tag";
import { useLazyQuery, useMutation, useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import clsx from "clsx";
import { observer } from "mobx-react";
import _ from "lodash";

import Layout from "../../../../components/Layout";
import store from "../../../../src/store";

const useStyles = makeStyles({
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
  dependenciesTable: {
    marginBottom: "3em",
  },
  overridden: {
    fontWeight: "bold",
  },
});

const GET_REMOTE_VERSIONS = gql`
  query($name: String!, $type: String!, $group: String!) {
    groups(name: $group) {
      applications(id: $name) {
        versions(type: $type) {
          version
          latest
        }
      }
    }
  }
`;

const GET_HEAD_VERSION = gql`
  query($name: String!, $group: String!, $type: String!) {
    groups(name: $group) {
      applications(id: $name) {
        id
        name
        overrides {
          version
          name
        }
        versions(latest: true, type: $type) {
          modules {
            id
            file
            name
            requires
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
            type
            version
          }
        }
      }
    }
  }
`;

const GET_APPS = gql`
  query($name: String!, $group: String!, $type: String!) {
    groups(name: $group) {
      applications(id: $name) {
        id
        name
        versions(type: $type) {
          version
          latest
        }
      }
    }
  }
`;

const SET_VERSION = gql`
  mutation($group: String!, $application: String!, $version: String!) {
    publishVersion(
      group: $group
      application: $application
      version: $version
    ) {
      type
    }
  }
`;

const SET_REMOTE_VERSION = gql`
  mutation(
    $group: String!
    $application: String!
    $remote: String!
    $version: String
  ) {
    setRemoteVersion(
      group: $group
      application: $application
      remote: $remote
      version: $version
    ) {
      name
    }
  }
`;

const ConsumesTable = observer(({ consumes }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h6" className={classes.panelTitle}>
        Consumes
      </Typography>
      <Table>
        <TableBody>
          {consumes
            .filter(({ application }) => application)
            .map(({ name, application, usedIn }) => (
              <TableRow key={[application.id, name].join()}>
                <TableCell>
                  <Typography>
                    <Link
                      href={`/applications/${store.group}/${application.name}/${name}`}
                    >
                      <a>{name}</a>
                    </Link>
                  </Typography>
                </TableCell>
                <TableCell>
                  {usedIn.map(({ file, url }) => (
                    <Typography variant="body2" key={[file, url].join(":")}>
                      <a href={url}>{file}</a>
                    </Typography>
                  ))}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
});

const DependenciesTable = observer(({ title, dependencies, overrides }) => {
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
});

const RemoteVersionSelector = observer(({ application, remote, version }) => {
  const router = useRouter();
  const { data } = useQuery(GET_REMOTE_VERSIONS, {
    variables: { name: remote, type: store.versionType, group: store.group },
  });
  const [setRemoteVersion] = useMutation(SET_REMOTE_VERSION);

  const versions = _.get(data, "groups[0].applications[0].versions", []);
  if (!versions.length) {
    return null;
  }

  const currentVersion =
    version || versions.find(({ latest }) => latest).version;

  const handleVersionChange = (newVersion) => {
    setRemoteVersion({
      variables: {
        group: store.group,
        application,
        remote,
        version: newVersion === currentVersion ? null : newVersion,
      },
      refetchQueries: [
        {
          query: GET_HEAD_VERSION,
          variables: {
            name: router.query.application,
            type: store.versionType,
            group: store.group,
          },
        },
      ],
    });
  };

  return (
    <Select
      variant="outlined"
      value={currentVersion}
      onChange={(evt) => handleVersionChange(evt.target.value)}
    >
      {versions.map((v) => (
        <MenuItem key={v.version} value={v.version}>
          {v.version} {v.latest ? "(default)" : ""}
        </MenuItem>
      ))}
    </Select>
  );
});

const RemoteVersionManager = observer(
  ({ appName, application, applicationOverrides }) => {
    const classes = useStyles();
    const apps = Array.from(
      application.consumes.reduce(
        (s, { application: { name } }) => s.add(name),
        new Set()
      )
    );
    const overrides = {};
    applicationOverrides.forEach(({ name, version }) => {
      overrides[name] = version;
    });
    return (
      <div>
        <Typography variant="h6" className={classes.panelTitle}>
          Remote Versions
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
            {apps.map((name) => (
              <TableRow key={["rvm", name].join()}>
                <TableCell>
                  <Typography>{name}</Typography>
                </TableCell>
                <TableCell>
                  <RemoteVersionSelector
                    application={appName}
                    remote={name}
                    version={overrides[name]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
);

const OverridesTable = observer(({ overrides }) => {
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
});

const ModulesTable = observer(({ application, modules, overrides }) => {
  const classes = useStyles();
  const findVersion = (name) => {
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
                  <Link
                    href={`/applications/${store.group}/${application.name}/${name}`}
                  >
                    <a>{name}</a>
                  </Link>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography>{file}</Typography>
              </TableCell>
              <TableCell>
                <Typography>
                  {requires
                    .map((name) => `${name}${findVersion(name)}`)
                    .join(", ")}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
});

const ApplicationSection = observer(
  ({ name, applicationOverrides, application, versions }) => {
    const router = useRouter();
    const classes = useStyles();
    const [publishVersion] = useMutation(SET_VERSION);

    const handleVersionChange = (application, version) => {
      publishVersion({
        variables: {
          group: store.group,
          application: name,
          version,
        },
        refetchQueries: [
          {
            query: GET_APPS,
            variables: {
              name: router.query.application,
              type: store.versionType,
              group: store.group,
            },
          },
          {
            query: GET_HEAD_VERSION,
            variables: {
              name: router.query.application,
              type: store.versionType,
              group: store.group,
            },
          },
        ],
      });
    };

    const dependencies = application.dependencies.filter(
      ({ type }) => type === "dependency"
    );
    const devDependencies = application.dependencies.filter(
      ({ type }) => type === "devDependency"
    );
    const optionalDependencies = application.dependencies.filter(
      ({ type }) => type === "optionalDependency"
    );

    const currentVersion =
      versions.length > 0 ? versions.find(({ latest }) => latest).version : "";

    return (
      <div>
        <Grid container>
          <Grid item xs={9}>
            <Typography variant="h4" className={classes.title}>
              {name}
            </Typography>
          </Grid>
          {store.showVersionManagement && (
            <Grid item xs={3}>
              <Typography variant="h6" className={classes.title}>
                <>
                  Default Version:{"  "}
                  <Select
                    variant="outlined"
                    value={currentVersion}
                    onChange={(evt) =>
                      handleVersionChange(application.id, evt.target.value)
                    }
                  >
                    {versions.map((v) => (
                      <MenuItem key={v.version} value={v.version}>
                        {v.version}
                      </MenuItem>
                    ))}
                  </Select>
                </>
              </Typography>
            </Grid>
          )}
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

          {store.showVersionManagement && (
            <Grid item xs={6}>
              <Paper className={classes.panel} elevation={3}>
                <RemoteVersionManager
                  appName={name}
                  application={application}
                  applicationOverrides={applicationOverrides}
                />
              </Paper>
            </Grid>
          )}

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
              {dependencies.length > 0 && (
                <DependenciesTable
                  title="Direct Dependencies"
                  dependencies={dependencies}
                  overrides={application.overrides}
                />
              )}
              {devDependencies.length > 0 && (
                <DependenciesTable
                  title="Development Dependencies"
                  dependencies={devDependencies}
                  overrides={application.overrides}
                />
              )}
              {optionalDependencies.length > 0 && (
                <DependenciesTable
                  title="Optional Dependencies"
                  dependencies={optionalDependencies}
                  overrides={application.overrides}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
);

const Application = () => {
  const classes = useStyles();
  const router = useRouter();
  const [getVersioningData, { data: versioningData }] = useLazyQuery(GET_APPS);
  const [getData, { data }] = useLazyQuery(GET_HEAD_VERSION);

  React.useEffect(() => {
    if (router.query.application) {
      getData({
        variables: {
          name: router.query.application,
          type: store.versionType,
          group: store.group,
        },
      });
      getVersioningData({
        variables: {
          name: router.query.application,
          type: store.versionType,
          group: store.group,
        },
      });
    }
  }, [router]);

  const applicationOverrides = _.get(
    data,
    "groups[0].applications[0].overrides"
  );
  const application = _.get(data, "groups[0].applications[0].versions[0]");
  const name = _.get(data, "groups[0].applications[0].name");
  const versions = _.get(
    versioningData,
    "groups[0].applications[0].versions",
    []
  );

  return (
    <Layout>
      <Head>
        <title>Federated Modules Dashboard</title>
      </Head>
      <div className={classes.container}>
        {application && (
          <ApplicationSection
            name={name}
            applicationOverrides={applicationOverrides}
            application={application}
            versions={versions}
          />
        )}
      </div>
    </Layout>
  );
};

export default observer(Application);
