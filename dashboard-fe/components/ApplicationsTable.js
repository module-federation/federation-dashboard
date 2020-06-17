import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from "@material-ui/core";
import UpArrow from "@material-ui/icons/PublishTwoTone";
import DownArrow from "@material-ui/icons/CloudDownloadOutlined";
import Link from "next/link";

const useStyles = makeStyles((theme) => ({
  headerRow: {
    background: theme.palette.primary.light,
  },
  headerCell: {
    color: theme.palette.primary.contrastText,
  },
}));

const ApplicationsTable = ({ applications }) => {
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
      { name, applicationId, applications: {} },
    ])
  );

  applications.forEach(({ id: consumingApplication, consumes }) => {
    consumes
      .filter(({ application }) => application)
      .forEach(({ name, application: { id: applicationId }, usedIn }) => {
        modulesById[`${applicationId}:${name}`].applications[
          consumingApplication
        ] = { count: usedIn.length };
      });
  });

  const overridesComplete = {};
  applications.forEach(({ id, overrides }) =>
    overrides.forEach(({ name }) => {
      overridesComplete[name] = [...(overridesComplete[name] || []), id];
    })
  );

  const findVersion = (applicationId, name) => {
    const { overrides } = applications.find(({ id }) => id === applicationId);
    let ov = overrides.find(({ name: ovName }) => ovName === name);
    return ov ? ` (${ov.version})` : "";
  };

  return (
    <Table aria-label="simple table">
      <TableHead>
        <TableRow className={classes.headerRow}>
          <TableCell />
          {applications.map(({ id, name, versions }) => (
            <TableCell align="center" key={`application:${id}`}>
              <Typography variant="h5">
                <Link href={`/applications/${name}`}>
                  <a className={classes.headerCell}>{name}</a>
                </Link>
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
        {modules.map(
          ({ name, absoluteId, applicationName, requires, applicationId }) => (
            <TableRow key={`module:${absoluteId}`}>
              <TableCell align="right">
                <Typography variant="body1">
                  <Link href={`/applications/${applicationName}/${name}`}>
                    <a>{name}</a>
                  </Link>
                </Typography>
              </TableCell>
              {applications.map(({ id: appId, name }) => (
                <TableCell
                  align="center"
                  key={`${name}:app:${appId}:mod:${absoluteId}`}
                >
                  {modulesById[absoluteId].applicationId === appId && (
                    <UpArrow />
                  )}
                  {modulesById[absoluteId].applications[appId] && (
                    <>
                      <Typography>
                        <DownArrow />{" "}
                        {modulesById[absoluteId].applications[appId].count}
                      </Typography>
                    </>
                  )}
                </TableCell>
              ))}
              <TableCell align="left" width="5%">
                <Typography variant="body1" noWrap>
                  {requires
                    .map(
                      ({ name }) => `${name}${findVersion(applicationId, name)}`
                    )
                    .join(", ")}
                </Typography>
              </TableCell>
            </TableRow>
          )
        )}
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

export default ApplicationsTable;
