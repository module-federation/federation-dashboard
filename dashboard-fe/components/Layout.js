import clsx from "clsx";
import {
  makeStyles,
  CssBaseline,
  AppBar,
  Toolbar,
  Paper,
  List,
  ListItem,
  Divider,
  ListItemText,
  ListItemIcon,
  ListSubheader,
  Typography,
  TextField,
  IconButton,
  Drawer,
  Container,
  fade,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import DashboardIcon from "@material-ui/icons/Dashboard";
import PlusIcon from "@material-ui/icons/Add";
import WebIcon from "@material-ui/icons/Web";
import ShareIcon from "@material-ui/icons/Share";
import WidgetsIcon from "@material-ui/icons/Widgets";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import { useRecoilState, useRecoilValue } from "recoil";

import ApplicationSidebar from "../components/ApplicationSidebar";
import { selectedApplicationAtom, detailDrawerOpenAtom } from "../src/store";

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
const SideBar = ({ data }) => {
  return (
    <List>
      <Link href="/">
        <ListItem button>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </Link>
      <Link href={`/dependencies`}>
        <ListItem button>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText primary="Dependencies" />
        </ListItem>
      </Link>
      {data && (
        <>
          <ListSubheader inset>Applications</ListSubheader>
          {data.applications.map(({ id, name }) => (
            <Link href={`/applications/${id}`} key={`application:${id}`}>
              <ListItem button>
                <ListItemIcon>
                  <WebIcon />
                </ListItemIcon>
                <ListItemText primary={name} />
              </ListItem>
            </Link>
          ))}
          <Link href={`/applications/new`}>
            <ListItem button>
              <ListItemIcon>
                <PlusIcon />
              </ListItemIcon>
              <ListItemText primary="New" />
            </ListItem>
          </Link>
        </>
      )}
      {data && (
        <>
          <ListSubheader inset>Modules</ListSubheader>
          {data.modules.map(({ id, name, application }) => (
            <Link
              href={`/applications/${application.id}/${name}`}
              key={`module:${id}`}
            >
              <ListItem button>
                <ListItemIcon>
                  <WidgetsIcon />
                </ListItemIcon>
                <ListItemText primary={name} />
              </ListItem>
            </Link>
          ))}
        </>
      )}
    </List>
  );
};

const leftDrawerWidth = 240;
const rightDrawerWidth = 480;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  rightToolbarIcon: {
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "0 8px",
    ...theme.mixins.toolbar,
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

export default function Dashboard({ children }) {
  const { data } = useQuery(GET_SIDEBAR_DATA);
  const classes = useStyles();
  const router = useRouter();
  const [detailDrawerOpen, setDetailDrawerOpen] = useRecoilState(
    detailDrawerOpenAtom
  );
  const selectedApplication = useRecoilValue(selectedApplicationAtom);

  const [leftOpen, setLeftOpen] = React.useState(true);
  const handleDrawerLeftOpen = () => {
    setLeftOpen(true);
  };
  const handleDrawerLeftClose = () => {
    setLeftOpen(false);
  };

  const handleDrawerRightClose = () => {
    setDetailDrawerOpen(false);
  };

  const options = [];
  if (data) {
    data.applications.forEach(({ id, name }) => {
      options.push({
        type: "Application",
        url: `/applications/${name}`,
        name,
      });
    });
    data.modules.forEach(({ id, application, name }) => {
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
        <SideBar data={data} />
      </Drawer>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />
        <Container maxWidth="lg" className={classes.container}>
          {children}
        </Container>
      </main>
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={handleDrawerRightClose}
      >
        <div
          style={{
            display: "flex",
          }}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={handleDrawerRightClose}>
              <ChevronRightIcon />
            </IconButton>
          </div>
          {selectedApplication && <h1>{selectedApplication}</h1>}
        </div>
        <Divider />
        <div
          style={{
            width: rightDrawerWidth,
          }}
        >
          {selectedApplication && (
            <ApplicationSidebar name={selectedApplication} />
          )}
        </div>
      </Drawer>
    </div>
  );
}
