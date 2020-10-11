/* eslint-disable global-require */

"use strict";

const express = require("express");
const cookieParser = require("cookie-parser");
const ipfilter = require("express-ipfilter").IpFilter;
const createNextRouteHandler = require("./lib/create-next-route-handler");

module.exports = ({ nextRoutesHandler }) => {
  const app = express();
  const routesHandler = nextRoutesHandler || createNextRouteHandler({ log });

  app.use(cookieParser());
  const ips = ["34.100.90.12"];

  app.use(ipfilter(ips));
  app.use(routesHandler);

  return app;
};
