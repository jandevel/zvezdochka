import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NavigationMenu from "./components/layout/NavigationMenu";
import HeaderImage from "./components/layout/HeaderImage";
import GPXTracksMap from "./components/map/MapWidget";
// import TestApp from "./components/layout/TestWidget";

function App() {
  return (
    <Router>
      <div>
        <NavigationMenu />
        <Routes>
          <Route path="/" element={<HeaderImage />} />
          <Route path="/routes" element={<GPXTracksMap />} />
        </Routes>  
      </div>
    </Router>
  );
}

export default App;
