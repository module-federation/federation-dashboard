import Head from "next/head";
import {
  makeStyles,
  Typography,
  Grid,
  Paper,
  Table,
  TableRow,
  TableCell,
  TableBody,
} from "@material-ui/core";
import Link from "next/link";
import gql from "graphql-tag";
import { useLazyQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import { observer } from "mobx-react";
import { get } from "lodash";

import Layout from "../../../../../components/Layout";
import {
  Code,
  CodeWrapper,
  GeneratedCode,
} from "../../../../../components/Code";
import store from "../../../../../src/store";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: 10,
  },
  panel: {
    padding: 10,
  },
  usageTitle: {
    marginTop: 20,
  },
  usageSection: {
    marginTop: 10,
    marginBottom: 10,
  },
  moduleHeader: {
    marginBottom: 20,
  },
}));

const GET_MODULES = gql`
  query($group: String!, $app: String!, $type: String!, $name: String!) {
    groups(name: $group) {
      applications(id: $app) {
        name
        versions(type: $type, latest: true) {
          remote
          modules(name: $name) {
            id
            file
            name
            requires
            consumedBy {
              consumingApplication {
                name
                id
              }
              usedIn {
                file
                url
              }
            }
          }
        }
      }
    }
  }
`;

const ConsumesTable = ({ consumed }) => {
  const classes = useStyles();
  return (
    <>
      <Typography variant="h6" className={classes.panelTitle}>
        Used By
      </Typography>
      <Table>
        <TableBody>
          {consumed
            .filter(({ consumingApplication }) => consumingApplication)
            .map(({ name, consumingApplication, usedIn }) => (
              <TableRow key={[consumingApplication.id, name].join()}>
                <TableCell>
                  <Typography>
                    <Link
                      href={`/applications/${store.group}/${consumingApplication.name}/${name}`}
                    >
                      <a>{consumingApplication.name}</a>
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

const ModulePage = () => {
  const classes = useStyles();
  const router = useRouter();
  const [getData, { data }] = useLazyQuery(GET_MODULES);

  React.useEffect(() => {
    if (router.query.group && router.query.module && router.query.application) {
      getData({
        variables: {
          group: router.query.group,
          type: store.versionType,
          name: router.query.module,
          app: router.query.application,
        },
      });
    }
  }, [router]);

  const mod = get(data, "groups[0].applications[0].versions[0].modules[0]");
  const remote = get(data, "groups[0].applications[0].versions[0].remote");
  const appName = get(data, "groups[0].applications[0].name");

  return (
    <Layout>
      <Head>
        <title>
          {router.query.application}/{mod && mod.name}
        </title>
      </Head>
      <div className={classes.container}>
        {mod && (
          <div>
            <Typography variant="h4" className={classes.moduleHeader}>
              <Link
                href={`/applications/${store.group}/${router.query.application}`}
              >
                <a>{router.query.application}</a>
              </Link>
              /{mod.name}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Paper elevation={3} className={classes.panel}>
                  <Typography variant="h6" className={classes.panelTitle}>
                    File
                  </Typography>
                  <Typography>{mod.file}</Typography>
                </Paper>
              </Grid>
              {mod.requires.length > 0 && (
                <Grid item xs={6}>
                  <Paper elevation={3} className={classes.panel}>
                    <Typography variant="h6" className={classes.panelTitle}>
                      Requires
                    </Typography>
                    <Typography>
                      {mod.requires.map((name) => name).join()}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              <Grid item xs={6}>
                <Paper elevation={3} className={classes.panel}>
                  <ConsumesTable consumed={mod.consumedBy} />
                </Paper>
              </Grid>
            </Grid>
            <Typography variant="h5" className={classes.usageTitle}>
              Usage
            </Typography>
            <Typography className={classes.usageSection}>
              Add this script tag to your page template
            </Typography>
            <Paper elevation={3}>
              <CodeWrapper>
                <GeneratedCode>{`<script src="${remote}"></script>`}</GeneratedCode>
              </CodeWrapper>
            </Paper>
            <Typography className={classes.usageSection}>
              Alter your webpack config to add this remote key
            </Typography>
            <Paper elevation={3}>
              <CodeWrapper>
                <Code>{`  new ModuleFederationPlugin({
    ...
    remotes: {
      ...
`}</Code>
                <GeneratedCode>{`      "${appName}": "${appName}",`}</GeneratedCode>
                <Code>{`      ...
    }
    ...
  }
`}</Code>
              </CodeWrapper>
            </Paper>
            <Typography className={classes.usageSection}>
              And then add an import to your code.
            </Typography>
            <Paper elevation={3}>
              <CodeWrapper>
                <Code>{`// Import synchronously`}</Code>
                <GeneratedCode>{`import ${mod.name} from "${appName}/${mod.name}";`}</GeneratedCode>
                <Code>{`// Import asynchronously`}</Code>
                <GeneratedCode>{`import("${appName}/${mod.name}").then((${mod.name}) => {});`}</GeneratedCode>
              </CodeWrapper>
            </Paper>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default observer(ModulePage);
