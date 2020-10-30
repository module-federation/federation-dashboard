import Head from "next/head";
import gql from "graphql-tag";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/router";
import withAuth from "../../../components/with-auth";
import Layout from "../../../components/Layout";

import { ApplicationLink } from "../../../components/links";

const GET_APPS = gql`
  query($name: String!) {
    groups(name: $name) {
      applications {
        id
        name
      }
    }
  }
`;

const GroupPage = () => {
  const router = useRouter();
  const [getData, { data }] = useLazyQuery(GET_APPS);

  const group = data && data.groups.length > 0 ? data.groups[0] : null;
  if (!group) {
    return null;
  }

  React.useEffect(() => {
    if (router.query.group) {
      getData({
        variables: { name: router.query.group },
      });
    }
  }, [router]);

  return (
    <Layout>
      <Head>
        <title>Group: {router.query.group}</title>
      </Head>
      {group &&
        group.applications.map(({ id, name }) => (
          <div key={id}>
            <ApplicationLink group={router.query.group} application={id}>
              <a>{name}</a>
            </ApplicationLink>
          </div>
        ))}
    </Layout>
  );
};

export default withAuth(GroupPage);
