import React from "react";
import { UserProvider } from "../lib/user";
import clsx from "clsx";
import {
  makeStyles,
  CssBaseline,
  AppBar,
  Toolbar,
  List,
  ListItem,
  Divider,
  Typography,
  TextField,
  IconButton,
  Drawer,
  Container,
  fade,
} from "@material-ui/core";
import SideBar from "./Sidebar";
import Autocomplete from "@material-ui/lab/Autocomplete";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { useRouter } from "next/router";

import ApplicationDrawer from "../components/ApplicationDrawer";

const GET_SIDEBAR_DATA = gql`
  {
    applications {
      id
      name
    }
    modules {
      id
      name
      application {
        id
        name
      }
    }
  }
`;

const leftDrawerWidth = 240;

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
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: 200,
    color: "white",
    padding: 5,
  },
}));

const Layout = ({ user, loading = false, children }) => {
  const { data } = useQuery(GET_SIDEBAR_DATA);
  const classes = useStyles();
  const router = useRouter();

  const [leftOpen, setLeftOpen] = React.useState(true);
  const handleDrawerLeftOpen = () => {
    setLeftOpen(true);
  };
  const handleDrawerLeftClose = () => {
    setLeftOpen(false);
  };

  const options = [];
  if (data) {
    data.applications.forEach(({ name }) => {
      options.push({
        type: "Application",
        url: `/applications/${name}`,
        name,
      });
    });
    data.modules.forEach(({ application, name }) => {
      options.push({
        type: "Modules",
        url: `/applications/${application.name}/${name}`,
        name,
      });
    });
  }
  const onChange = (evt, opt, reason) => {
    if (reason === "select-option") {
      router.push(opt.url);
    }
  };

  return (
    <UserProvider value={{ user, loading }}>
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
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              className={classes.title}
            >
              <strong>Federated Modules</strong> Dashboard
            </Typography>
            <Autocomplete
              onChange={onChange}
              options={options}
              groupBy={(option) => option.type}
              getOptionLabel={(option) => option.name}
              className={classes.searchBox}
              renderInput={(params) => (
                <TextField {...params} className={classes.search} />
              )}
            />
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
          <SideBar restricted={!user} data={data} />
        </Drawer>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="lg" className={classes.container}>
            {children}
          </Container>
        </main>
        <ApplicationDrawer />
      </div>
    </UserProvider>
  );
};

export default Layout;
