import React from 'react';
import { Link } from 'react-router-dom';
import vendexLogo from '../assets/logo.png';
import './Navbar.css';

const Navbar = () => (
  <nav className="navbar">
    <img src={vendexLogo} alt="VendexLabs Logo" className="navbar-logo" />
    <ul className="navbar-links">
      <li><Link to="/">Home</Link></li>
      <li><Link to="/subscriptions">Subscriptions</Link></li>
      <li><Link to="/vendor-analysis">Vendor Analysis</Link></li>
      {/* Add more links as needed */}
    </ul>
  </nav>
);

export default Navbar;
