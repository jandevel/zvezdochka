import React from "react";

import NavigationMenu from "./components/layout/NavigationMenu";
import HeaderImage from "./components/layout/HeaderImage";
import GPXTracksMap from "./components/map/MapWidget";
import TestApp from "./components/layout/TestWidget";

function App() {
  return (
    <div>
      <NavigationMenu />
      <HeaderImage />
      <GPXTracksMap />
      {/* <TestApp /> */}
    </div>
  );
}

export default App;
