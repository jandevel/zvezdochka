import React from "react";
import { Link } from "react-router-dom";

import "./NavigationMenu.css";

function NavigationMenu() {
  return (
    <header className="main-header">
      <div className="main-header__logo_container">
        <img src="/logo512.png" alt="Zvezdochka" />
      </div>
      <nav className="navigation-menu">
        <ul>
          <li>
            <Link to="/">Events</Link>
          </li>
          <li>
            <Link to="/routes">Routes</Link>
          </li>
          <li>
            <Link to="/photo-map">Photo Map</Link>
          </li>
          <li>
            <Link to="/gallery">Gallery</Link>
            <div className="submenu">
              <Link to="/gallery/best-pictures">Best Pictures</Link>
              <Link to="/gallery/albums">Albums</Link>
              <Link to="/gallery/random-slideshow">Random Slideshow</Link>
            </div>
          </li>
          <li>
            <Link to="/other">Other</Link>
            <div className="submenu">
              <Link to="/other/bikes-and-gear">Bikes & Gear</Link>
              <Link to="/other/statistics">Statistics</Link>
              <Link to="/other/weather">Weather</Link>
            </div>
          </li>
          <li>
            <Link to="/admin-panel">Admin Panel</Link>
            <div className="submenu">
              <Link to="/admin-panel/yearly-albums">Yearly Albums</Link>
              <Link to="/admin-panel/upload-event">Upload Event</Link>
              <Link to="/admin-panel/maintenance-log">Maintenance Log</Link>
            </div>
          </li>
        </ul>
      </nav>
      <div className="login-placeholder"></div>
    </header>
  );
}

export default NavigationMenu;
