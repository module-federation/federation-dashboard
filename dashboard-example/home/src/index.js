const injectScript = function (d, s, id, override) {
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
  js.onload = function () {
    import("./bootstrap");
  };
  const src =
    override && override.version
      ? "http://localhost:3002/" + override.version + "/remoteEntry.js"
      : "http://localhost:3002/remoteEntry.js";
  js.src = src;
  fjs.parentNode.insertBefore(js, fjs);
};
fetch("http://localhost:3010/")
  .then((res) => res.json())
  .then((versions) => {
    window.versions = versions;
    Object.assign(versions, { currentHost: "home" });
    console.log(versions)
    if (!versions.home.override.length) {
      injectScript(document, "script", "federation-dynamic-remote");
      return
    }
    versions.home.override.forEach((override) => {
      injectScript(
        document,
        "script",
        "federation-override-" + override.name,
        override
      );
    });
  });
