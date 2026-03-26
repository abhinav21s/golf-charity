/**
 * Navbar Component
 * Main navigation with responsive design
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold gradient-text">
              Golf Charity
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/charities" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
              Charities
            </Link>
            <Link to="/draws" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
              Draws
            </Link>
            <Link to="/pricing" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
              Pricing
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/scores" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
                  Scores
                </Link>
                <Link to="/winnings" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
                  My Winnings
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-slate-700 hover:text-primary-600 font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                    <User className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {user?.first_name}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-600 hover:text-danger-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="btn btn-secondary">
                    Login
                  </button>
                </Link>
                <Link to="/register">
                  <button className="btn btn-primary">
                    Get Started
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-700"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-4">
              <Link
                to="/charities"
                className="text-slate-700 hover:text-primary-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Charities
              </Link>
              <Link
                to="/draws"
                className="text-slate-700 hover:text-primary-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Draws
              </Link>
              <Link
                to="/pricing"
                className="text-slate-700 hover:text-primary-600 font-medium"
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-slate-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/scores"
                    className="text-slate-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Scores
                  </Link>
                  <Link
                    to="/winnings"
                    className="text-slate-700 hover:text-primary-600 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    My Winnings
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-slate-700 hover:text-primary-600 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">
                        {user?.first_name} {user?.last_name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="btn btn-danger w-full"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-200">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <button className="btn btn-secondary w-full">
                      Login
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <button className="btn btn-primary w-full">
                      Get Started
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
