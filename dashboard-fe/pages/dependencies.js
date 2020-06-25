import Head from "next/head";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Popover,
  makeStyles
} from "@material-ui/core";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";
import clsx from "clsx";

import Layout from "../components/Layout";
import { useFetchUser } from "../lib/user";
import withAuth from "../components/with-auth";

const useStyles = makeStyles(theme => ({
  headerRow: {
    background: theme.palette.primary.light
  },
  headerCell: {
    color: theme.palette.primary.contrastText
  },
  devDependency: {
    fontStyle: "italic"
  },
  override: {
    fontWeight: "bold"
  },
  warning: {
    color: "red"
  },
  popover: {
    pointerEvents: "none"
  },
  paper: {
    padding: theme.spacing(1)
  }
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

  const Dependency = ({ devDependency, override, version }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handlePopoverOpen = event => {
      setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
      setAnchorEl(null);
    };

    return (
      <>
        <Typography
          aria-owns={open ? "mouse-over-popover" : undefined}
          variant="body2"
          className={clsx({
            [classes.devDependency]: devDependency,
            [classes.override]: override,
            [classes.warning]: !devDependency && !override
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
              paper: classes.paper
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left"
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left"
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
  if (data) {
    data.applications.forEach(
      ({
        id: appId,
        dependencies,
        devDependencies,
        optionalDependencies,
        overrides
      }) => {
        const addDependency = ({ name, version }, type) => {
          dependencyMap[name] = dependencyMap[name] || {};
          dependencyMap[name][appId] = {
            version,
            type,
            devDependency: type === "devDependency",
            override:
              overrides.find(({ name: ovName }) => ovName === name) !==
              undefined
          };
        };
        dependencies.forEach(dep => addDependency(dep, "dependency"));
        devDependencies.forEach(dep => addDependency(dep, "devDependency"));
        optionalDependencies.forEach(dep =>
          addDependency(dep, "optionalDependency")
        );
      }
    );
  }
  const { user, loading } = useFetchUser();

  return (
    <Layout user={user} loading={loading}>
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
                .map(k => (
                  <TableRow key={k}>
                    <TableCell>
                      <Typography>{k}</Typography>
                    </TableCell>
                    {data.applications.map(({ id }) => (
                      <TableCell>
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

export default withAuth(Dependencies);
