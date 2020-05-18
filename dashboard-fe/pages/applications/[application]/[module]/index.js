import Head from "next/head";
import { makeStyles, Typography, Grid, Paper } from "@material-ui/core";
import Link from "next/link";
import gql from "graphql-tag";
import { useLazyQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import Layout from "../../../../components/Layout";
import { Code, CodeWrapper, GeneratedCode } from "../../../../components/Code";

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
  query($app: String!, $name: String!) {
    modules(application: $app, name: $name) {
      id
      file
      name
      requires {
        name
      }
    }
    applications(name: $app) {
      remote
      name
    }
  }
`;

const ModulePage = () => {
  const classes = useStyles();
  const router = useRouter();
  const [getData, { data }] = useLazyQuery(GET_MODULES);

  React.useEffect(() => {
    if (router.query.module && router.query.application) {
      getData({
        variables: {
          name: router.query.module,
          app: router.query.application,
        },
      });
    }
  }, [router]);

  return (
    <Layout>
      <Head>
        <title>
          {router.query.application}/
          {data && data.modules && data.modules[0].name}
        </title>
      </Head>
      <div className={classes.container}>
        {data &&
          data.modules.map((mod) => (
            <div>
              <Typography variant="h4" className={classes.moduleHeader}>
                <Link href={`/applications/${router.query.application}`}>
                  {router.query.application}
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
                <Grid item xs={6}>
                  <Paper elevation={3} className={classes.panel}>
                    <Typography variant="h6" className={classes.panelTitle}>
                      Requires
                    </Typography>
                    <Typography>
                      {mod.requires.map(({ name }) => name).join()}
                    </Typography>
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
                  <GeneratedCode>{`<script src="${data.applications[0].remote}"></script>`}</GeneratedCode>
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
                  <GeneratedCode>{`      "${data.applications[0].name}": "${data.applications[0].name}",`}</GeneratedCode>
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
                  <GeneratedCode>{`import ${data.modules[0].name} from "${data.applications[0].name}/${data.modules[0].name}";`}</GeneratedCode>
                  <Code>{`// Import asynchronously`}</Code>
                  <GeneratedCode>{`import("${data.applications[0].name}/${data.modules[0].name}").then((${data.modules[0].name}) => {});`}</GeneratedCode>
                </CodeWrapper>
              </Paper>
            </div>
          ))}
      </div>
    </Layout>
  );
};

export default ModulePage;
