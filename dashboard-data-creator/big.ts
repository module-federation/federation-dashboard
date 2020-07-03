/* Run the dashboard this way:
rm -fr examples/big && DATA_DIR=examples/big yarn dev
*/

import Application from "./builder";
import { interactiveHold } from "./runner";

const home = new Application("home", "frontend");
const search = new Application("search", "frontend");
const cart = new Application("cart", "frontend");
const checkout = new Application("checkout", "frontend");
const pdp = new Application("pdp", "frontend");

async function buildProjects() {
  await interactiveHold("Upload home project");
  await home.pushDevelopmentVersion();

  await interactiveHold("Update home project");
  home.addModule("Header", "src/Header.jsx");
  home.addModule("Footer", "src/Footer.jsx");
  await home.pushDevelopmentVersion();

  await interactiveHold("Upload search project");
  search.addConsumes("home", "Header");
  await search.pushDevelopmentVersion();

  await interactiveHold("Adding AutoCompleteSearch to search project");
  search.addModule("AutoCompleteSearch", "src/AutoCompleteSearch.jsx");
  await search.pushDevelopmentVersion();

  await interactiveHold("Connecting home project");
  home.addConsumes("search", "AutoCompleteSearch");
  await home.pushDevelopmentVersion();

  await interactiveHold("Pushing production versions");
  await search.pushProductionVersion();
  await home.pushProductionVersion();

  await interactiveHold("Adding cart, checkout, pdp");
  pdp.addConsumes("home", "Header");
  checkout.addConsumes("home", "Header");
  cart.addConsumes("home", "Header");
  pdp.addConsumes("home", "Footer");
  checkout.addConsumes("home", "Footer");
  cart.addConsumes("home", "Footer");

  pdp.addModule("HeroImage", "src/HeroImage.jsx");
  checkout.addModule("ExpressCheckout", "src/ExpressCheckout.jsx");
  cart.addModule("AddToCartButton", "src/AddToCartButton.jsx");

  await cart.pushDevelopmentVersion();
  await checkout.pushDevelopmentVersion();
  await pdp.pushDevelopmentVersion();

  process.exit(0);
}

buildProjects();
