import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import EventsPage from "./pages/Events/EventsPage";
import RoutesPage from "./pages/Routes/RoutesPage";
import PhotoMapPage from "./pages/PhotoMap/PhotoMapPage";
// import TestApp from "./components/layout/TestWidget";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><EventsPage /></Layout>} />
        <Route path="/routes" element={<Layout><RoutesPage /></Layout>} />
        <Route path="/photo_map" element={<Layout><PhotoMapPage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
