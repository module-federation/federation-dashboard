import {
  makeStyles,
  CssBaseline,
  AppBar,
  Toolbar,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListSubheader,
  Typography,
  Grid,
} from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";
import WebIcon from "@material-ui/icons/Web";
import WidgetsIcon from "@material-ui/icons/Widgets";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";

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
      }
    }
  }
`;
const SideBar = () => {
  const { data } = useQuery(GET_SIDEBAR_DATA);
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

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {},
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  drawer: {
    width: drawerWidth,
  },
  drawerContainer: {
    padding: 5,
  },
  contentContainer: {
    padding: 5,
  },
}));

export default function Dashboard({ children }) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            <strong>Federated Modules</strong> Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Grid container className={classes.content}>
        <Grid xs={2} className={classes.drawerContainer}>
          <Paper variant="outlined" square>
            <SideBar />
          </Paper>
        </Grid>
        <Grid xs={10} className={classes.contentContainer}>
          {children}
        </Grid>
      </Grid>
    </div>
  );
}
