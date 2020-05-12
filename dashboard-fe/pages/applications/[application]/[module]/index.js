import Head from "next/head";
import { makeStyles } from "@material-ui/core";
import Layout from "../../../../components/Layout";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";

const useStyles = makeStyles((theme) => ({}));

const GET_APPS = gql`
  {
    applications {
      id
      name
      modules {
        id
        name
        requires {
          name
        }
      }
      overrides {
        id
        name
      }
      consumes {
        application {
          id
          name
        }
        name
      }
    }
  }
`;

const ModulePage = () => {
  const classes = useStyles();
  const router = useRouter();
  return (
    <Layout>
      <Head>
        <title>Federated Modules Dashboard</title>
      </Head>
      <div>
        Module: {router.query.application} - {router.query.module}
      </div>
    </Layout>
  );
};

export default ModulePage;
