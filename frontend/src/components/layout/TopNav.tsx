import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3, ChevronDown, Code2, FileSearch, Github, History, Menu, Moon,
  Settings, ShieldCheck, Sparkles, Sun, User, X,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useDarkMode } from '../../hooks/useDarkMode';

const productLinks = [
  { name: 'Repository review', description: 'Scan a GitHub repository or uploaded project.', path: '/upload', icon: Github },
  { name: 'Live code analysis', description: 'Write code and receive inline feedback.', path: '/upload?mode=code', icon: Code2 },
  { name: 'Security insights', description: 'Find vulnerabilities and risky patterns.', path: '/#capabilities', icon: ShieldCheck },
  { name: 'Reports & scoring', description: 'Explore quality scores and export findings.', path: '/reports', icon: BarChart3 },
];

export default function TopNav() {
  const location = useLocation();
  const { isDark, toggle } = useDarkMode();
  const [productOpen, setProductOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProductOpen(false);
    setProfileOpen(false);
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        setProductOpen(false);
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProductOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="top-nav" ref={navRef}>
      <div className="top-nav-container">
        <div className="top-nav-left">
          <Link to="/" className="logo-link" aria-label="CodeLens home">
            <span className="logo-icon-wrapper"><img src="/logo.jpg" alt="" /></span>
            <span className="logo-copy"><strong>CodeLens</strong><small>AI Review</small></span>
          </Link>

          <nav className="nav-links" aria-label="Primary navigation">
            <div className="nav-dropdown">
              <button
                className={`nav-link nav-dropdown-trigger ${productOpen ? 'active' : ''}`}
                type="button"
                aria-expanded={productOpen}
                aria-haspopup="true"
                onClick={() => { setProductOpen((value) => !value); setProfileOpen(false); }}
              >
                Product <ChevronDown size={15} className={productOpen ? 'rotate-chevron' : ''} />
              </button>
              {productOpen && (
                <div className="dropdown-panel product-dropdown" role="menu">
                  <div className="dropdown-heading"><span>Platform</span><small>From first scan to final report</small></div>
                  <div className="dropdown-grid">
                    {productLinks.map(({ name, description, path, icon: Icon }) => (
                      <Link key={name} to={path} className="dropdown-item" role="menuitem">
                        <span className="dropdown-item-icon"><Icon size={18} /></span>
                        <span><strong>{name}</strong><small>{description}</small></span>
                      </Link>
                    ))}
                  </div>
                  <Link to="/upload" className="dropdown-footer-link"><Sparkles size={16} /> Start a free analysis</Link>
                </div>
              )}
            </div>
            <Link to="/reports" className={`nav-link ${isActive('/reports') ? 'active' : ''}`}>History</Link>
            <Link to="/pricing" className={`nav-link ${isActive('/pricing') ? 'active' : ''}`}>Pricing</Link>
          </nav>
        </div>

        <div className="top-nav-right">
          <Link to="/upload" className="desktop-new-analysis"><Button variant="primary"><FileSearch size={16} /> New analysis</Button></Link>
          <button className="icon-button" type="button" aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`} onClick={toggle}>
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <div className="nav-dropdown profile-dropdown-wrap">
            <button
              className={`profile-button ${profileOpen ? 'active' : ''}`}
              type="button"
              aria-label="Open account menu"
              aria-expanded={profileOpen}
              onClick={() => { setProfileOpen((value) => !value); setProductOpen(false); }}
            ><User size={18} /></button>
            {profileOpen && (
              <div className="dropdown-panel account-dropdown" role="menu">
                <div className="account-summary"><span className="account-avatar">D</span><span><strong>Developer</strong><small>dev@aicode.review</small></span></div>
                <Link to="/profile" className="account-menu-item" role="menuitem"><User size={16} /> Profile</Link>
                <Link to="/settings" className="account-menu-item" role="menuitem"><Settings size={16} /> Settings</Link>
                <Link to="/reports" className="account-menu-item" role="menuitem"><History size={16} /> Analysis history</Link>
              </div>
            )}
          </div>
          <button
            className="mobile-menu-button" type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <span className="mobile-nav-label">Explore</span>
          {productLinks.map(({ name, path, icon: Icon }) => <Link key={name} to={path} className="mobile-nav-link"><Icon size={18} /> {name}</Link>)}
          <div className="mobile-nav-divider" />
          <Link to="/pricing" className="mobile-nav-link">Pricing</Link>
          <Link to="/profile" className="mobile-nav-link">Profile</Link>
          <Link to="/settings" className="mobile-nav-link">Settings</Link>
          <Link to="/upload" className="mobile-nav-cta"><FileSearch size={17} /> New analysis</Link>
        </nav>
      )}
    </header>
  );
}
