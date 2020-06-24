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
                  <Link href={`/applications/${application.name}`}>
                    {application.name}
                  </Link>
                  /
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

const ApplicationSidebar = ({ name }) => {
  const { data } = useQuery(GET_APPS, {
    variables: { name },
  });

  if (!data) {
    return null;
  }

  const application = data.applications[0];

  return (
    <div
      style={{
        padding: "1em",
      }}
    >
      <ModulesTable application={application} modules={application.modules} />
      {application.consumes.length > 0 && (
        <ConsumesTable consumes={application.consumes} />
      )}
    </div>
  );
};

export default ApplicationSidebar;
