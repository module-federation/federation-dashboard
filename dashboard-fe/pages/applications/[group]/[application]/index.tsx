import * as React from "react";
import Head from "next/head";
import { makeStyles, Tabs, Tab } from "@material-ui/core";
import { useQuery } from "@apollo/client";
import { useRouter } from "next/router";
import { observer } from "mobx-react";

import Layout from "../../../../components/Layout";
import {
  CurrentVersion,
  GET_APPS,
  GET_HEAD_VERSION,
} from "../../../../components/application/CurrentVersion";
import { VersionComparison } from "../../../../components/application/VersionComparison";
import store from "../../../../src/store";

const useStyles = makeStyles({
  container: {
    padding: 10,
  },
});

const Application = () => {
  const [currentTab, currentTabSet] = React.useState(0);
  const classes = useStyles();
  const router = useRouter();
  const { data: versioningData, loading: versionsLoading } = useQuery(
    GET_APPS,
    {
      variables: {
        name: router.query.application,
        environment: store.environment,
        group: store.group,
      },
      skip: !router.query.application || !store.group || !store.environment,
    }
  );
  const { data, loading: headLoading } = useQuery(GET_HEAD_VERSION, {
    variables: {
      name: router.query.application,
      environment: store.environment,
      group: store.group,
    },
    skip: !router.query.application || !store.group || !store.environment,
  });

  const applicationOverrides = data?.groups?.[0].applications?.[0].overrides;
  const application = data?.groups?.[0].applications?.[0].versions?.[0];
  const name = data?.groups?.[0].applications?.[0].name;
  const versions = versioningData?.groups?.[0].applications?.[0].versions || [];

  if (versionsLoading || headLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <Head>
        <title>Medusa</title>
      </Head>
      <div className={classes.container}>
        {application && (
          <>
            <Tabs
              value={currentTab}
              onChange={(_, newValue) => {
                currentTabSet(newValue);
              }}
            >
              <Tab label="Current Version" />
              <Tab label="Version Comparison" />
            </Tabs>
            <div style={{ display: currentTab === 0 ? "block" : "none" }}>
              <CurrentVersion
                name={name}
                applicationOverrides={applicationOverrides}
                application={application}
                versions={versions}
              />
            </div>
            <div style={{ display: currentTab === 1 ? "block" : "none" }}>
              <VersionComparison
                environment={store.environment}
                group={store.group}
                name={name}
              />
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default observer(Application);
