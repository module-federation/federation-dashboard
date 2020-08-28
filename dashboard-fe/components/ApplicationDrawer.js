import { makeStyles, Divider, IconButton, Drawer } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import { observer } from "mobx-react";
import store from "../src/store";

import ApplicationSidebar, {
  ApplicationSidebarHeader
} from "./ApplicationSidebar";

const rightDrawerWidth = 480;

const useStyles = makeStyles(theme => ({
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  }
}));

function ApplicationSidebarDrawer() {
  const classes = useStyles();
  return (
    <Drawer
      anchor="right"
      open={store.detailDrawerOpen}
      onClose={() => (store.detailDrawerOpen = false)}
    >
      <div
        style={{
          display: "flex"
        }}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={() => (store.detailDrawerOpen = false)}>
            <ChevronRightIcon />
          </IconButton>
        </div>
        {store.selectedApplication && <h1>{store.selectedApplication}</h1>}
      </div>
      <Divider />
      <div
        style={{
          width: rightDrawerWidth
        }}
      >
        {store.selectedApplication && (
          <ApplicationSidebar name={store.selectedApplication} />
        )}
      </div>
    </Drawer>
  );
}

export default observer(ApplicationSidebarDrawer);
