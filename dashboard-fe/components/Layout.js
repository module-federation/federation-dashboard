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
  TextField,
  Grid,
  fade,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import DashboardIcon from "@material-ui/icons/Dashboard";
import WebIcon from "@material-ui/icons/Web";
import WidgetsIcon from "@material-ui/icons/Widgets";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import Link from "next/link";
import { useRouter } from "next/router";

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
  title: {
    flexGrow: 1,
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
  toolbar: {
    display: "flex",
  },
}));

export default function Dashboard({ children }) {
  const { data } = useQuery(GET_SIDEBAR_DATA);
  const classes = useStyles();
  const router = useRouter();

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
      <AppBar position="static" className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <Typography variant="h6" noWrap className={classes.title}>
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
      <Grid container className={classes.content}>
        <Grid item xs={2} className={classes.drawerContainer}>
          <Paper variant="outlined" square>
            <SideBar data={data} />
          </Paper>
        </Grid>
        <Grid item xs={10} className={classes.contentContainer}>
          {children}
        </Grid>
      </Grid>
    </div>
  );
}
