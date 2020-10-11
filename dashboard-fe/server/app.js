/* eslint-disable global-require */

"use strict";

const express = require("express");
const cookieParser = require("cookie-parser");
const ipfilter = require("express-ipfilter").IpFilter;
const createNextRouteHandler = require("./lib/create-next-route-handler");
const ipaddr = require("ipaddr.js");
const isEqual = require("lodash/isEqual")
module.exports = ({ nextRoutesHandler }) => {
  const app = express();
  const routesHandler = nextRoutesHandler || createNextRouteHandler({ log });
  app.use(cookieParser());
  if (process.env.IP_WHITELIST) {
    const ips = process.env.IP_WHITELIST.split(" ").map((address)=>{
      return address
    });

    app.use(ipfilter(ips, { mode: "allow" }));
  }
  app.use(routesHandler);

  return app;
};
