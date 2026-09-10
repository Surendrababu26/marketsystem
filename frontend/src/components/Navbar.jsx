import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const userRoleDisplay = role ? role.toUpperCase() : '';

  return (
    <header className="navbar-header">
      <nav className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📦</span>
          <span className="brand-text">RFQ Marketplace</span>
        </Link>

        {isAuthenticated && (
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        )}

        <div className={`navbar-menu ${mobileMenuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <ul className="navbar-links">
                {role === 'buyer' && (
                  <>
                    <li>
                      <Link
                        to="/buyer/dashboard"
                        className={isActive('/buyer/dashboard') ? 'active' : ''}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/buyer/create-rfq"
                        className={isActive('/buyer/create-rfq') ? 'active' : ''}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Create RFQ
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/buyer/rfqs"
                        className={isActive('/buyer/rfqs') ? 'active' : ''}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My RFQs
                      </Link>
                    </li>
                  </>
                )}

                {role === 'supplier' && (
                  <>
                    <li>
                      <Link
                        to="/supplier/dashboard"
                        className={isActive('/supplier/dashboard') ? 'active' : ''}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/supplier/rfqs"
                        className={isActive('/supplier/rfqs') ? 'active' : ''}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Browse RFQs
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/supplier/quotations"
                        className={isActive('/supplier/quotations') ? 'active' : ''}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Quotations
                      </Link>
                    </li>
                  </>
                )}
              </ul>

              <div className="navbar-user-info">
                <span className="user-email">{user?.email || user?.username || user?.full_name}</span>
                <span className={`role-badge badge-${role}`}>{userRoleDisplay}</span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
