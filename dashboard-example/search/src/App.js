import LocalButton from "./SearchList";
import React from "react";

const RemoteButton = React.lazy(() => import("home/Button"));

const App = () => (
  <div>
    <h1>Bi-Directional</h1>
    <h2>App 2</h2>
    <LocalButton />
    <React.Suspense fallback="Loading Button">
      <RemoteButton />
    </React.Suspense>
  </div>
);

export default App;
