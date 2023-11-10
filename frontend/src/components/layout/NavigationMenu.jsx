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
            <Link to="/photo_map">Photo Map</Link>
          </li>
          <li>
            <Link to="/gallery">Gallery</Link>
            <div className="submenu">
              <Link to="/best-pictures">Best Pictures</Link>
              <Link to="/albums">Albums</Link>
              <Link to="/random-slideshow">Random Slideshow</Link>
            </div>
          </li>
          <li>
            <Link to="/other">Other</Link>
          </li>
          <li>
            <Link to="/admin_panel">Admin Panel</Link>
          </li>
        </ul>
      </nav>
      <div className="login-placeholder"></div>
    </header>
  );
}

export default NavigationMenu;
