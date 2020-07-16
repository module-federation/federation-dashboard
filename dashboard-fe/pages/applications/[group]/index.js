import Head from "next/head";
import Link from "next/link";
import gql from "graphql-tag";
import { useLazyQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";

import Layout from "../../../components/Layout";

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
            <Link href={`/applications/${router.query.group}/${id}`}>
              {name}
            </Link>
          </div>
        ))}
    </Layout>
  );
};

export default GroupPage;
