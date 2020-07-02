import {
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
import { observer } from "mobx-react";
import _ from "lodash";

import store from "../src/store";

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
  dependenciesTable: {
    marginBottom: "3em",
  },
  overridden: {
    fontWeight: "bold",
  },
}));

const GET_APPS = gql`
  query($name: String!, $group: String!, $type: String!) {
    groups(name: $group) {
      applications(id: $name) {
        id
        name
        versions(latest: true, type: $type) {
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
          modules {
            name
            consumedBy {
              consumingApplication {
                name
                id
              }
            }
          }
        }
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
        <TableBody>
          {consumes.map(({ name, application, usedIn }) => (
            <TableRow key={[application.id, name].join()}>
              <TableCell>
                <Typography>
                  <Link
                    href={`/applications/${store.group}/${application.name}`}
                  >
                    <a>{application.name}</a>
                  </Link>
                  /
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
};

const ConsumersTable = ({ modules, name }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h6" className={classes.panelTitle}>
        Consumers
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography>Module</Typography>
            </TableCell>
            <TableCell>
              <Typography>Consumers</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {modules
            .filter(({ consumedBy }) => consumedBy.length)
            .map(({ name: moduleName, consumedBy }) => (
              <TableRow key={moduleName}>
                <TableCell>
                  <Typography>
                    <Link
                      href={`/applications/${store.group}/${name}/${moduleName}`}
                    >
                      <a>{moduleName}</a>
                    </Link>
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography>
                    {consumedBy.map(
                      ({ consumingApplication: { name: consumer } }) => (
                        <span key={[name, moduleName, consumer].join(":")}>
                          <Link
                            href={`/applications/${store.group}/${consumer}`}
                          >
                            <a>{consumer}</a>
                          </Link>{" "}
                        </span>
                      )
                    )}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </>
  );
};

const ApplicationSidebar = ({ name }) => {
  const { data } = useQuery(GET_APPS, {
    variables: { name, type: store.versionType, group: store.group },
  });

  if (!data) {
    return null;
  }

  const consumes = _.get(
    data,
    "groups[0].applications[0].versions[0].consumes",
    []
  );
  const consumedBy = _.get(
    data,
    "groups[0].applications[0].versions[0].modules",
    []
  );

  return (
    <div
      style={{
        padding: "1em",
      }}
    >
      <ConsumersTable modules={consumedBy} name={name} />
      {consumes.length > 0 && <ConsumesTable consumes={consumes} />}
    </div>
  );
};

export default observer(ApplicationSidebar);
