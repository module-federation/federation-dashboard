import Head from "next/head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Popover,
  makeStyles,
} from "@material-ui/core";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import clsx from "clsx";
import { observer } from "mobx-react";
import _ from "lodash";

import store from "../src/store";
import Layout from "../components/Layout";
import withAuth from "../components/with-auth";
import { ApplicationLink } from "../components/links";

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
  warning: {
    color: "red",
  },
  popover: {
    pointerEvents: "none",
  },
  paper: {
    padding: theme.spacing(1),
  },
}));

const GET_APPS = gql`
  query($environment: String!, $group: String!) {
    groups(name: $group) {
      applications {
        id
        name
        versions(latest: true, environment: $environment) {
          overrides {
            id
            name
            version
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

const Dependencies = () => {
  const { data } = useQuery(GET_APPS, {
    variables: {
      group: store.group,
      environment: store.environment,
    },
  });
  const classes = useStyles();

  const Dependency = ({ devDependency, override, version }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
      setAnchorEl(null);
    };

    return (
      <>
        <Typography
          aria-owns="mouse-over-popover"
          variant="body2"
          className={clsx({
            [classes.devDependency]: devDependency,
            [classes.override]: override,
            [classes.warning]: !devDependency && !override,
          })}
          onMouseEnter={handlePopoverOpen}
          onMouseLeave={handlePopoverClose}
        >
          {version}
        </Typography>
        {!devDependency && !override && anchorEl && (
          <Popover
            id="mouse-over-popover"
            className={classes.popover}
            classes={{
              paper: classes.paper,
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={open}
            anchorEl={anchorEl}
            onClose={handlePopoverClose}
            disableRestoreFocus
          >
            <Typography>This should be shared.</Typography>
          </Popover>
        )}
      </>
    );
  };

  const dependencyMap = {};
  const applications = _.get(data, "groups[0].applications", []);
  if (applications) {
    applications.forEach(({ id: appId, versions }) => {
      versions[0].dependencies.forEach(({ name, version, type }) => {
        dependencyMap[name] = dependencyMap[name] || {};
        dependencyMap[name][appId] = {
          version,
          type,
          devDependency: type === "devDependency",
          override:
            versions[0].overrides.find(
              ({ name: ovName }) => ovName === name
            ) !== undefined,
        };
      });
    });
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
                {applications.map(({ name, id }) => (
                  <TableCell key={["header", name, id].join(":")}>
                    <Typography>
                      <ApplicationLink group={store.group} application={id}>
                        <a className={classes.headerCell}>{name}</a>
                      </ApplicationLink>
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
                    {applications.map(({ id }) => (
                      <TableCell key={id}>
                        {dependencyMap[k][id] && (
                          <Dependency {...dependencyMap[k][id]} />
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

export default observer(Dependencies);
