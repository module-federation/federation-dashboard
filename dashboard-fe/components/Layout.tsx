import React from "react";
import clsx from "clsx";
import {
  makeStyles,
  CssBaseline,
  AppBar,
  Toolbar,
  Divider,
  Typography,
  IconButton,
  Drawer,
  Container,
  Avatar,
  Menu,
  MenuItem,
} from "@material-ui/core";
import Link from "next/link";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { observer } from "mobx-react";

import store from "../src/store";

import ApplicationDrawer from "./ApplicationDrawer";
import SideBar from "./Sidebar";
import SearchBox from "./SearchBox";

const leftDrawerWidth = 240;

const UserMenu = observer(() => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (store.authUser) {
    return (
      <>
        <Avatar
          alt={store.authUser.name}
          src={store.authUser.picture}
          onClick={handleClick}
        />
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem>
            <Link href="/profile" passHref>
              Profile
            </Link>
          </MenuItem>
          <MenuItem>
            <Link href="/settings" passHref>
              Settings
            </Link>
          </MenuItem>
          <MenuItem>
            <Link href="/api/auth/logout" prefetch={false}>
              Logout
            </Link>
          </MenuItem>
        </Menu>
      </>
    );
  }
  return null;
});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: leftDrawerWidth,
    width: `calc(100% - ${leftDrawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
    color: "white",
  },
  leftDrawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: leftDrawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  leftDrawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 240,
  },
}));

const Layout = ({ children }) => {
  const classes = useStyles();

  const [leftOpen, setLeftOpen] = React.useState(true);
  const handleDrawerLeftOpen = () => {
    setLeftOpen(true);
  };
  const handleDrawerLeftClose = () => {
    setLeftOpen(false);
  };

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, leftOpen && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Open left drawer"
            onClick={handleDrawerLeftOpen}
            className={clsx(
              classes.menuButton,
              leftOpen && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>
          <Link href="/" passHref>
            <Typography
              className={classes.title}
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
            >
              <strong>Federated Modules</strong> Dashboard
            </Typography>
          </Link>
          <SearchBox />
          <UserMenu />
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(
            classes.leftDrawerPaper,
            !leftOpen && classes.leftDrawerPaperClose
          ),
        }}
        open={leftOpen}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerLeftClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <SideBar />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          {children}
        </Container>
      </main>
      <ApplicationDrawer />
    </div>
  );
};

export default Layout;
