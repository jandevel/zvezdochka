import React from 'react';

import './NavigationMenu.css';

function NavigationMenu() {
    return (
        <header className='header'>
        <div className='logo'>Bicycle Club "Zvezdochka"</div>
            <nav>
                <ul>
                    <li><a href="/">Home</a></li>
                    <li><a href="/cycling">Cycling</a></li>
                    <li><a href="/travel">Travel & Hiking</a></li>
                    <li><a href="/routes">Routes</a></li>
                    <li><a href="/photo_map">Photo Map</a></li>
                    <li><a href="/gallery">Gallery</a></li>
                    <li><a href="/other">Other</a></li>
                    <li><a href="/admin_panel">Admin Panel</a></li>
                </ul>
            </nav>
        </header>
    );
}

export default NavigationMenu;
