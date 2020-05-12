import Head from "next/head";
import { makeStyles, Typography, Grid, Paper } from "@material-ui/core";
import Link from "next/link";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import Layout from "../../../../components/Layout";

const useStyles = makeStyles((theme) => ({
  container: {
    padding: 10,
  },
  panel: {
    padding: 10,
  },
}));

const GET_MODULES = gql`
  query($application: String!, $name: String!) {
    modules(application: $application, name: $name) {
      id
      file
      name
      requires {
        name
      }
    }
  }
`;

const ModulePage = () => {
  const classes = useStyles();
  const router = useRouter();
  const { data } = useQuery(GET_MODULES, {
    variables: {
      name: router.query.module,
      application: router.query.application,
    },
  });
  console.log(data);

  return (
    <Layout>
      <Head>
        <title>Federated Modules Dashboard</title>
      </Head>
      <div className={classes.container}>
        {data &&
          data.modules.map((mod) => (
            <div>
              <Typography variant="h4">
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
            </div>
          ))}
      </div>
    </Layout>
  );
};

export default ModulePage;
