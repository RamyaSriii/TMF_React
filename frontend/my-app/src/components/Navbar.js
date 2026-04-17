import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Add shadow when scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🌿</span>
          <span className="navbar__logo-text">
            Phyto<span>Scan</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="navbar__links">
          <Link to="/" className={`navbar__link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/predict" className={`navbar__link ${location.pathname === '/predict' ? 'active' : ''}`}>
            Analyze Plant
          </Link>
        </nav>

        {/* CTA */}
        <Link to="/predict" className="btn btn-primary navbar__cta">
          Start Scan
        </Link>

        {/* Mobile hamburger */}
        <button
          className="navbar__hamburger"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${mobileOpen ? 'open' : ''}`}></span>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="navbar__mobile-menu animate-fade-in">
          <Link to="/" className={`mobile-link ${location.pathname === '/' ? 'active' : ''}`}>
            🏠 Home
          </Link>
          <Link to="/predict" className={`mobile-link ${location.pathname === '/predict' ? 'active' : ''}`}>
            🔬 Analyze Plant
          </Link>
        </div>
      )}
    </header>
  );
}
