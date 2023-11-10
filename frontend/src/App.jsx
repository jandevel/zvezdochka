import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";
import EventsPage from "./pages/Events/EventsPage";
import RoutesPage from "./pages/Routes/RoutesPage";
import PhotoMapPage from "./pages/PhotoMap/PhotoMapPage";
import GalleryPage from "./pages/Gallery/GalleryPage";
import GalleryBestPicturesPage from "./pages/GalleryBestPictures/GalleryBestPicturesPage";
import GalleryAlbumsPage from "./pages/GalleryAlbums/GalleryAlbumsPage";
import GalleryRandomSlideshowPage from "./pages/GalleryRandomSlideshow/GalleryRandomSlideshowPage";
import OtherPage from "./pages/Other/OtherPage";
import OtherBikesGearPage from "./pages/OtherBikesGear/OtherBikesGearPage";
import OtherStatisticsPage from "./pages/OtherStatistics/OtherStatisticsPage";
import OtherWeatherPage from "./pages/OtherWeather/OtherWeatherPage";
import AdminPanelPage from "./pages/AdminPanel/AdminPanelPage";
import AdminPanelYearlyAlbumsPage from "./pages/AdminPanelYearlyAlbums/AdminPanelYearlyAlbumsPage";
import AdminPanelUploadEventPage from "./pages/AdminPanelUploadEvent/AdminPanelUploadEventPage";
import AdminPanelMaintenanceLogPage from "./pages/AdminPanelMaintenanceLog/AdminPanelMaintenanceLogPage";

// import TestApp from "./components/layout/TestWidget";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout><EventsPage /></Layout>} />
        <Route path="/routes" element={<Layout><RoutesPage /></Layout>} />
        <Route path="/photo-map" element={<Layout><PhotoMapPage /></Layout>} />
        <Route path="/gallery" element={<Layout><GalleryPage /></Layout>} />
        <Route path="/gallery/best-pictures" element={<Layout><GalleryBestPicturesPage /></Layout>} />
        <Route path="/gallery/albums" element={<Layout><GalleryAlbumsPage /></Layout>} />
        <Route path="/gallery/random-slideshow" element={<Layout><GalleryRandomSlideshowPage /></Layout>} />
        <Route path="/other" element={<Layout><OtherPage /></Layout>} />
        <Route path="/other/bikes-and-gear" element={<Layout><OtherBikesGearPage /></Layout>} />
        <Route path="/other/statistics" element={<Layout><OtherStatisticsPage /></Layout>} />
        <Route path="/other/weather" element={<Layout><OtherWeatherPage /></Layout>} />
        <Route path="/admin-panel" element={<Layout><AdminPanelPage /></Layout>} />
        <Route path="/admin-panel/yearly-albums" element={<Layout><AdminPanelYearlyAlbumsPage /></Layout>} />
        <Route path="/admin-panel/upload-event" element={<Layout><AdminPanelUploadEventPage /></Layout>} />
        <Route path="/admin-panel/maintenance-log" element={<Layout><AdminPanelMaintenanceLogPage /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
