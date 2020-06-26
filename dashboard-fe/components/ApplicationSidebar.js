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
    consumingApplications(name: $name) {
      name
      consumes {
        application {
          id
          name
        }
        name
      }
    }
    applications(name: $name) {
      id
      name
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

const ConsumersTable = ({ consumers, name }) => {
  const classes = useStyles();
  const modules = {};
  consumers.forEach((application) => {
    const consumingApp = application.name;
    (application.consumes || []).forEach((consume) => {
      if (consume.application && consume.application.name === name) {
        const moduleName = consume.name;
        modules[moduleName] = modules[moduleName] || new Set();
        modules[moduleName].add(consumingApp);
      }
    });
  });
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
          {Object.entries(modules).map(([moduleName, apps]) => (
            <TableRow key={moduleName}>
              <TableCell>
                <Typography>
                  <Link href={`/applications/${name}/${moduleName}`}>
                    {moduleName}
                  </Link>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography>
                  {Array.from(apps).map((consumer) => (
                    <>
                      <Link href={`/applications/${consumer}`}>{consumer}</Link>{" "}
                    </>
                  ))}
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
      <ConsumersTable consumers={data.consumingApplications} name={name} />
      {application.consumes.length > 0 && (
        <ConsumesTable consumes={application.consumes} />
      )}
    </div>
  );
};

export default ApplicationSidebar;
