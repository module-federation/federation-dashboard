import React from "react";
import gql from "graphql-tag";
import {
  makeStyles,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Typography
} from "@material-ui/core";
import { useQuery } from "@apollo/react-hooks";
import moment from "moment";
import { UpArrow, DownArrow } from "../icons";
import { uniq } from "lodash";

import { ModuleLink } from "../links";

const useStyles = makeStyles({
  headerCell: {
    textAlign: "center"
  },
  headerVersion: {
    fontWeight: "bold"
  },
  headerDate: {
    fontStyle: "italic",
    fontSize: "small"
  },
  sectionHeading: {
    fontWeight: "bold"
  },
  centeredCell: {
    textAlign: "center"
  }
});

export const GET_ALL_VERSIONS = gql`
  query($name: String!, $group: String!, $environment: String!) {
    groups(name: $group) {
      applications(id: $name) {
        versions(environment: $environment) {
          version
          posted
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

export const VersionComparison = ({ group, environment, name }) => {
  const classes = useStyles();
  const { data } = useQuery(GET_ALL_VERSIONS, {
    variables: { name, environment, group }
  });

  if (!data) {
    return null;
  }

  const versions = (data?.groups?.[0].applications?.[0].versions || [])
    .map(version => ({
      ...version,
      postedDate: Date.parse(version.posted).valueOf()
    }))
    .sort((a, b) => {
      if (a.postedDate < b.postedDate) {
        return -1;
      }
      if (a.postedDate > b.postedDate) {
        return 1;
      }
      return 0;
    });

  const moduleCounts = {};
  const consumesCounts = {};
  const consumeApp = {};
  const overridesCounts = {};
  const dependenciesCounts = {};
  const overrideNames = {};
  versions.forEach(version => {
    version.overrides.forEach(({ name, version }) => {
      overrideNames[name] = true;
      overridesCounts[`${name}:${version}`] =
        (overridesCounts[`${name}:${version}`] || 0) + 1;
    }, {});
    version.modules.forEach(({ name }) => {
      moduleCounts[name] = (moduleCounts[name] || 0) + 1;
    }, {});
    version.consumes.forEach(({ name, application }) => {
      consumeApp[name] = application.id;
      consumesCounts[name] = (consumesCounts[name] || 0) + 1;
    }, {});
    version.dependencies.forEach(({ name, version, type }) => {
      dependenciesCounts[`${name}:${version}:${type}`] =
        (dependenciesCounts[`${name}:${version}:${type}`] || 0) + 1;
    }, {});
  });
  const uniqueModules = Object.entries(moduleCounts)
    .filter(([k, v]) => v !== versions.length)
    .map(([k]) => k);
  const uniqueConsumes = Object.entries(consumesCounts)
    .filter(([k, v]) => v !== versions.length)
    .map(([k]) => k);
  let uniqueOverrides = uniq(
    Object.entries(overridesCounts)
      .filter(([k, v]) => v !== versions.length)
      .map(([k]) => k.split(":")[0])
  );
  const uniqueDependencies = uniq(
    Object.entries(dependenciesCounts)
      .filter(([k, v]) => v !== versions.length)
      .map(([k]) => k.split(":")[0])
  );
  uniqueDependencies.forEach(name => {
    if (overrideNames[name]) {
      uniqueOverrides.push(name);
    }
  });
  uniqueOverrides = uniq(uniqueOverrides);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell></TableCell>
          {versions.map(({ version, posted }) => (
            <TableCell
              key={["header", version, posted].join("")}
              className={classes.headerCell}
            >
              <Typography className={classes.headerVersion}>
                {version}
              </Typography>
              <Typography className={classes.headerDate}>
                {moment(posted).fromNow()}
              </Typography>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={versions.length + 1}
            className={classes.sectionHeading}
          >
            Exposes
          </TableCell>
        </TableRow>
        {uniqueModules.map(module => (
          <TableRow>
            <TableCell key={["module", module].join("")}>
              <ModuleLink group={group} application={name} module={module}>
                {module}
              </ModuleLink>
            </TableCell>
            {versions.map(({ version, modules }) => (
              <TableCell
                key={["module", version, module].join("")}
                className={classes.centeredCell}
              >
                {modules.find(({ name }) => name === module) && <UpArrow />}
              </TableCell>
            ))}
          </TableRow>
        ))}

        <TableRow>
          <TableCell
            colSpan={versions.length + 1}
            className={classes.sectionHeading}
          >
            Consumes
          </TableCell>
        </TableRow>
        {uniqueConsumes.map(module => (
          <TableRow>
            <TableCell key={["consumes", module].join("")}>
              <ModuleLink
                group={group}
                application={consumeApp[module]}
                module={module}
              >
                <a>{module}</a>
              </ModuleLink>
            </TableCell>
            {versions.map(({ version, consumes }) => (
              <TableCell
                key={["consumes", version, module].join("")}
                className={classes.centeredCell}
              >
                {consumes.find(({ name }) => name === module) && <DownArrow />}
              </TableCell>
            ))}
          </TableRow>
        ))}

        <TableRow>
          <TableCell
            colSpan={versions.length + 1}
            className={classes.sectionHeading}
          >
            Shared
          </TableCell>
        </TableRow>
        {uniqueOverrides.map(module => (
          <TableRow>
            <TableCell key={["override", module].join("")}>{module}</TableCell>
            {versions.map(({ version, dependencies }) => (
              <TableCell
                key={["override", version, module].join("")}
                className={classes.centeredCell}
              >
                {dependencies.find(({ name }) => name === module) && (
                  <div>
                    {dependencies.find(({ name }) => name === module).version}
                  </div>
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}

        <TableRow>
          <TableCell
            colSpan={versions.length + 1}
            className={classes.sectionHeading}
          >
            Dependencies
          </TableCell>
        </TableRow>
        {uniqueDependencies.map(module => (
          <TableRow>
            <TableCell key={["dependency", module].join("")}>
              {module}
            </TableCell>
            {versions.map(({ version, dependencies }) => (
              <TableCell
                key={["dependency", version, module].join("")}
                className={classes.centeredCell}
              >
                {dependencies.find(({ name }) => name === module) && (
                  <div>
                    {dependencies.find(({ name }) => name === module).version}
                  </div>
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
