import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, Settings, User, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/Button';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function TopNav() {
  const location = useLocation();
  const { isDark, toggle } = useDarkMode();

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'History', path: '/reports' },
    { name: 'Pricing', path: '/pricing' },
  ];

  return (
    <header className="top-nav">
      <div className="top-nav-container">
        <div className="top-nav-left">
          <Link to="/" className="logo-link">
            <div className="logo-icon-wrapper" style={{ overflow: 'hidden' }}>
              <img src="/logo.jpg" alt="AI Code Review Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <span className="logo-text">AI Code Review</span>
          </Link>
          
          <nav className="nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="top-nav-right">
          <Link to="/upload">
            <Button variant="primary">New Analysis</Button>
          </Link>
          <button 
            className="icon-button" 
            aria-label="Toggle Theme"
            onClick={toggle}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/settings" className="icon-button" aria-label="Settings">
            <Settings size={20} />
          </Link>
          <Link to="/profile" className="profile-button" aria-label="Profile">
            <User size={20} />
          </Link>
        </div>
      </div>
    </header>
  );
}
