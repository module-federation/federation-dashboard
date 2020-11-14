import * as React from "react";
import Head from "next/head";
import { makeStyles, Tabs, Tab } from "@material-ui/core";
import { useLazyQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";
import { observer } from "mobx-react";
import withAuth from "../../../../components/with-auth";
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
  const [getVersioningData, { data: versioningData }] = useLazyQuery(GET_APPS);
  const [getData, { data }] = useLazyQuery(GET_HEAD_VERSION);

  React.useEffect(() => {
    if (router.query.application) {
      getData({
        variables: {
          name: router.query.application,
          environment: store.environment,
          group: store.group,
        },
      });
      getVersioningData({
        variables: {
          name: router.query.application,
          environment: store.environment,
          group: store.group,
        },
      });
    }
  }, [router]);

  const applicationOverrides = data?.groups?.[0].applications?.[0].overrides;
  const application = data?.groups?.[0].applications?.[0].versions?.[0];
  const name = data?.groups?.[0].applications?.[0].name;
  const versions = versioningData?.groups?.[0].applications?.[0].versions || [];

  return (
    <Layout>
      <Head>
        <title>Federated Modules Dashboard</title>
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
