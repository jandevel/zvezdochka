import React from "react";
import { Link } from "react-router-dom";
// import headerImage from '../../assets/t2303 Newfoundland/t2303_150_20230521-1723.jpg';

import "./NavigationMenu.css";

function NavigationMenu() {
  return (
    <header className="main-header">
      <div className="main-header__logo_container">
        <img
          src="/logo512.png"
          alt="Zvezdochka"
        />
      </div>
      <nav className="navigation-menu">
        <ul>
            <li><Link to="/">Events</Link></li>
            <li><Link to="/routes">Routes</Link></li>
            <li><Link to="/photo_map">Photo Map</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/other">Other</Link></li>
            <li><Link to="/admin_panel">Admin Panel</Link></li>
        </ul>
      </nav>
      <div className="login-placeholder">
      </div>      
      {/* <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/cycling">Cycling</Link></li>
                    <li><Link to="/travel">Travel & Hiking</Link></li>
                    <li><Link to="/routes">Routes</Link></li>
                    <li><Link to="/photo_map">Photo Map</Link></li>
                    <li><Link to="/gallery">Gallery</Link></li>
                    <li><Link to="/other">Other</Link></li>
                    <li><Link to="/admin_panel">Admin Panel</Link></li>
                </ul>
            </nav> */}
    </header>
  );
}

export default NavigationMenu;
