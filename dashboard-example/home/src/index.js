fetch("http://localhost:3010/")
  .then((res) => res.json())
  .then((versions) => {
    window.versions = versions;
    Object.assign(versions, { currentHost: "home" });
    const promiseArray = [];
    versions.home.override.forEach((override) => {
      window[override] = null;
      (function (d, s, id) {
        var js,
          fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement(s);
        js.id = id;
        js.onload = function () {
          import("./bootstrap");
        };
        js.src =
          "http://localhost:3002/" + override.version + "/remoteEntry.js";
        Object.assign(versions.home, { dsl: override.version });
        fjs.parentNode.insertBefore(js, fjs);
      })(document, "script", "federation-override-" + override.name);
    });
  });
