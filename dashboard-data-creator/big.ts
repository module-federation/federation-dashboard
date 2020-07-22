/* Run the dashboard this way:
rm -fr examples/big && DATA_DIR=examples/big yarn dev
*/

import Application from "./builder";
import { interactiveHold } from "./runner";
import moment from "moment";

const home = new Application("team/home", "frontend", 8080, { team: "earth" }, [
  "react-app",
]);
const search = new Application("search", "frontend", 8080, { team: "venus" }, [
  "react-app",
]);
const cart = new Application("cart", "frontend", 8080, { team: "saturn" }, [
  "react-app",
  "buy-flow",
]);
const checkout = new Application(
  "checkout",
  "frontend",
  8080,
  { team: "mars" },
  ["react-app", "buy-flow"]
);
const pdp = new Application("pdp", "frontend", 8080, { team: "pluto" }, [
  "react-app",
]);

const cms = new Application("cms", "admin", 8080, { team: "green" }, [
  "react-app",
]);
cms.addConsumes("admin-shared", "Header");
cms.addConsumes("admin-shared", "Footer");
const admin_shared = new Application(
  "admin-shared",
  "admin",
  8080,
  { team: "green" },
  ["react-app"]
);
admin_shared.addModule("Header", "src/Header.jsx");
admin_shared.addModule("Footer", "src/Footer.jsx");
const collections = new Application(
  "collections",
  "admin",
  8080,
  { team: "blue" },
  ["react-app"]
);
collections.addConsumes("admin-shared", "Header");
collections.addConsumes("admin-shared", "Footer");
collections.addConsumes("assets", "Image");
const assets = new Application("assets", "admin", 8080, { team: "blue" }, [
  "react-app",
]);
collections.addConsumes("admin-shared", "Header");
collections.addConsumes("admin-shared", "Footer");
assets.addModule("Image", "src/Image.jsx");

const adminApplications = [cms, admin_shared, collections, assets];
const productionApplications = [home, search, cart, checkout, pdp];
const applications = [...adminApplications, ...productionApplications];

async function buildProjects() {
  applications.forEach((app) =>
    app.setPosted(moment().subtract(21, "days").toDate())
  );

  await interactiveHold("Upload home project");
  home.bumpVersion("1.0.0");
  await home.pushDevelopmentVersion();
  await home.pushProductionVersion();
  applications.forEach((app) =>
    app.setPosted(moment().subtract(14, "days").toDate())
  );

  await interactiveHold("Update home project");
  home.addModule(
    "Header",
    "src/Header.jsx",
    {
      type: "component",
      framework: "react",
      storybook: "http://our.storybook.com",
    },
    ["react", "shell"]
  );
  home.addModule(
    "Footer",
    "src/Footer.jsx",
    {
      type: "component",
      framework: "react",
      storybook: "http://our.storybook.com",
    },
    ["react", "shell"]
  );
  home.bumpVersion("1.1.0");
  await home.pushDevelopmentVersion();
  await home.pushProductionVersion();
  applications.forEach((app) =>
    app.setPosted(moment().subtract(10, "days").toDate())
  );

  await interactiveHold("Update home project");
  home.bumpVersion("1.2.0");
  home.addModule(
    "MiniLogin",
    "src/MiniLogin.jsx",
    {
      type: "component",
      framework: "react",
      storybook: "http://our.storybook.com",
    },
    ["react", "shell", "external"]
  );
  await home.pushProductionVersion();
  await home.pushDevelopmentVersion();
  applications.forEach((app) =>
    app.setPosted(moment().subtract(8, "days").toDate())
  );

  await interactiveHold("Upload search project");
  search.addConsumes("team/home", "Header");
  await search.pushDevelopmentVersion();
  applications.forEach((app) =>
    app.setPosted(moment().subtract(6, "days").toDate())
  );

  await interactiveHold("Adding AutoCompleteSearch to search project");
  search.addModule("AutoCompleteSearch", "src/AutoCompleteSearch.jsx");
  await search.pushDevelopmentVersion();

  await interactiveHold("Connecting home project");
  home.addConsumes("search", "AutoCompleteSearch");
  home.bumpVersion("1.2.1");
  await home.pushDevelopmentVersion();
  await home.pushProductionVersion();
  applications.forEach((app) =>
    app.setPosted(moment().subtract(4, "days").toDate())
  );

  await interactiveHold("Pushing production versions");
  await search.pushProductionVersion();

  await interactiveHold("Adding cart, checkout, pdp");
  pdp.addConsumes("team/home", "Header");
  checkout.addConsumes("team/home", "Header");
  cart.addConsumes("team/home", "Header");
  pdp.addConsumes("team/home", "Footer");
  checkout.addConsumes("team/home", "Footer");
  cart.addConsumes("team/home", "Footer");

  pdp.addModule("HeroImage", "src/HeroImage.jsx");
  checkout.addModule("ExpressCheckout", "src/ExpressCheckout.jsx");
  cart.addModule("AddToCartButton", "src/AddToCartButton.jsx");

  await cart.pushDevelopmentVersion();
  await checkout.pushDevelopmentVersion();
  await pdp.pushDevelopmentVersion();

  await interactiveHold("Adding admin applications");
  await cms.pushDevelopmentVersion();
  await admin_shared.pushDevelopmentVersion();
  await collections.pushDevelopmentVersion();
  await assets.pushDevelopmentVersion();
  applications.forEach((app) =>
    app.setPosted(moment().subtract(2, "days").toDate())
  );

  await interactiveHold("Add more production versions");

  home.bumpVersion("1.3.0");
  home.addModule("LogoutButton", "src/LogoutButton.jsx");
  await home.pushProductionVersion();

  applications.forEach((app) =>
    app.setPosted(moment().subtract(1, "days").toDate())
  );

  home.bumpVersion("1.3.1");
  home.setOverrideVersion("react", "16.13.1");
  home.setDependencyVersion("react", "16.13.1");
  await home.pushProductionVersion();

  search.bumpVersion("1.1.0");
  await search.pushProductionVersion();
  cart.bumpVersion("1.1.0");
  await cart.pushProductionVersion();
  checkout.bumpVersion("1.1.0");
  await checkout.pushProductionVersion();
  pdp.bumpVersion("1.1.0");
  await pdp.pushProductionVersion();
  pdp.bumpVersion("1.1.1");
  await pdp.pushProductionVersion();
  pdp.bumpVersion("1.2.0");
  await pdp.pushProductionVersion();

  process.exit(0);
}

buildProjects();
