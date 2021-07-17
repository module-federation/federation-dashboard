import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from "@material-ui/core";
import ArrowIcon from "@material-ui/icons/Forward";
import { UpArrow, DownArrow } from "./icons";
import { ApplicationLink, ModuleLink } from "./links";
import store from "../src/store";

const useStyles = makeStyles((theme) => ({
  headerRow: {
    background: theme.palette.grey[200],
  },
}));

const ApplicationsTable = ({ applications }) => {
  const classes = useStyles();
  const modules = applications
    .map(({ id, name, versions }) =>
      versions[0].modules.map((mod: { name: string }) => ({
        ...mod,
        absoluteId: `${id}:${mod.name}`,
        applicationId: id,
        applicationName: name,
      }))
    )
    .flat();
  const modulesById = Object.fromEntries(
    modules.map(({ name, applicationId }) => [
      `${applicationId}:${name}`,
      { name, applicationId, applications: {} },
    ])
  );

  applications.forEach(({ id: consumingApplication, versions }) => {
    versions[0].consumes
      .filter(({ application }) => application)
      .forEach(({ name, application: { id: applicationId }, usedIn }) => {
        if (modulesById[`${applicationId}:${name}`]) {
          modulesById[`${applicationId}:${name}`].applications[
            consumingApplication
          ] = { count: usedIn.length };
        }
      });
  });

  const overridesComplete = {};
  applications.forEach(({ id, versions }) =>
    versions[0].overrides.forEach(({ name }) => {
      overridesComplete[name] = [...(overridesComplete[name] || []), id];
    })
  );

  const findVersion = (applicationId, name) => {
    const { versions } = applications.find(({ id }) => id === applicationId);
    let ov = versions[0].overrides.find(({ name: ovName }) => ovName === name);
    return ov ? ` (${ov.version})` : "";
  };

  return (
    <Table aria-label="simple table" style={{ marginTop: "1em" }}>
      <TableHead>
        <TableRow className={classes.headerRow}>
          <TableCell />
          {applications.map(({ id, name, versions }) => (
            <TableCell align="center" key={`application:${id}`}>
              <Typography variant="h5">
                <ApplicationLink group={store.group} application={name}>
                  <a>{name}</a>
                </ApplicationLink>
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
                  <ModuleLink
                    group={store.group}
                    application={applicationName}
                    module={name}
                  >
                    <a>{name}</a>
                  </ModuleLink>
                </Typography>
              </TableCell>
              {applications.map(({ id: appId, name }) => (
                <TableCell
                  align="center"
                  key={`${name}:app:${appId}:mod:${absoluteId}`}
                >
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                    }}
                  >
                    {modulesById[absoluteId].applicationId === appId && (
                      <UpArrow />
                    )}
                    {modulesById[absoluteId].applications[appId] && (
                      <>
                        <DownArrow />
                        <Typography>
                          {" "}
                          {modulesById[absoluteId].applications[appId].count}
                        </Typography>
                      </>
                    )}
                  </div>
                </TableCell>
              ))}
              <TableCell align="left" width="5%">
                <Typography variant="body1" noWrap>
                  {requires
                    .map((name) => `${name}${findVersion(applicationId, name)}`)
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
                {apps.includes(id) ? (
                  <ArrowIcon style={{ transform: "rotate(-90deg)" }} />
                ) : (
                  ""
                )}
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
