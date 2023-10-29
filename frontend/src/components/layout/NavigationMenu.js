import React from 'react';
import { Link } from 'react-router-dom';

import './NavigationMenu.css';

function NavigationMenu() {
    return (
        <header className='header'>
        <div className='logo'>Bicycle Club "Zvezdochka"</div>
            <nav>
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
            </nav>
        </header>
    );
}

export default NavigationMenu;
