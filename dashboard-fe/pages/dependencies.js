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
import Link from "next/link";
import clsx from "clsx";

import Layout from "../components/Layout";

const useStyles = makeStyles((theme) => ({
  headerRow: {
    background: theme.palette.primary.light,
  },
  headerCell: {
    color: theme.palette.primary.contrastText,
  },
  devDependency: {
    fontStyle: "italic",
  },
  override: {
    fontWeight: "bold",
  },
}));

const GET_APPS = gql`
  {
    applications {
      id
      name
      overrides {
        id
        name
        version
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

const Dependencies = () => {
  const { data } = useQuery(GET_APPS);
  const classes = useStyles();

  const dependencyMap = {};
  if (data) {
    data.applications.forEach(
      ({
        id: appId,
        dependencies,
        devDependencies,
        optionalDependencies,
        overrides,
      }) => {
        const addDependency = ({ name, version }, type) => {
          dependencyMap[name] = dependencyMap[name] || {};
          dependencyMap[name][appId] = {
            version,
            type,
            devDependency: type === "devDependency",
            override:
              overrides.find(({ name: ovName }) => ovName === name) !==
              undefined,
          };
        };
        dependencies.forEach((dep) => addDependency(dep, "dependency"));
        devDependencies.forEach((dep) => addDependency(dep, "devDependency"));
        optionalDependencies.forEach((dep) =>
          addDependency(dep, "optionalDependency")
        );
      }
    );
  }

  return (
    <Layout>
      <Head>
        <title>Dependency Matrix</title>
      </Head>
      {data && (
        <>
          <Table>
            <TableHead>
              <TableRow className={classes.headerRow}>
                <TableCell />
                {data.applications.map(({ name, id }) => (
                  <TableCell>
                    <Typography>
                      <Link href={`/applications/${id}`}>
                        <a className={classes.headerCell}>{name}</a>
                      </Link>
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.keys(dependencyMap)
                .sort()
                .map((k) => (
                  <TableRow key={k}>
                    <TableCell>
                      <Typography>{k}</Typography>
                    </TableCell>
                    {data.applications.map(({ id }) => (
                      <TableCell>
                        {dependencyMap[k][id] && (
                          <Typography
                            variant="body2"
                            className={clsx({
                              [classes.devDependency]:
                                dependencyMap[k][id].devDependency,
                              [classes.override]: dependencyMap[k][id].override,
                            })}
                          >
                            {dependencyMap[k][id].version}
                          </Typography>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </>
      )}
    </Layout>
  );
};

export default Dependencies;
