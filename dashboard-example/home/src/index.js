const injectScript = function(d, s, id, override) {
  const promise = new Promise(resolve => {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    if (override && override.version) {
      window[`remote_${override.name}`] = override.version;
    }
    js.onload = function() {
      resolve();
    };
    const src =
      override && override.version
        ? "http://localhost:3002/" + override.version + "/remoteEntry.js"
        : "http://localhost:3002/remoteEntry.js";
    js.src = src;
    fjs.parentNode.insertBefore(js, fjs);
  });

  return promise;
};

fetch("http://localhost:3000/api/graphql", {
  method: "POST",
  body: `query {
    applications(name: "home") {
      versions {
        override {
          name
          version
        }
      }
    }
  }`
})
  .then(res => res.json())
  .then(({ applications }) => {
    if (!applications.versions.override.length) {
      injectScript(document, "script", "federation-dynamic-remote").then(() => {
        import("./bootstrap");
      });
      return;
    }
    const allOverrides = applications.versions.override.map(override => {
      return injectScript(
        document,
        "script",
        "federation-override-" + override.name,
        override
      );
    });
    Promise.all(allOverrides).then(() => {
      import("./bootstrap");
    });
  });
