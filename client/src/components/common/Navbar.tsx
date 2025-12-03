import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore, useIsAuthenticated } from '@/store/authStore';

// Define the navigation links
const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Clinics', href: '/clinics' },
  { name: 'Doctors', href: '/doctors' },
  { name: 'Queue Status', href: '/queue' },
  { name: 'Contact', href: '/contact' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useIsAuthenticated();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    setIsUserDropdownOpen(false);
  };

  // Close menu on resize if it enters desktop view
  useEffect(() => {
    console.log()
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  
  return (
    <>
      <nav className="bg-gray-900 shadow-xl  sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Logo/Branding Section */}
            <div className="shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-extrabold text-primary-blue flex items-center space-x-2 transition duration-300 transform hover:scale-[1.02]">
                {/* Icon: Modern Pulse */}
                <svg className="w-8 h-8 text-secondary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8l2.122-2.122A4 4 0 0010.122 4h3.756a4 4 0 014 4v4a4 4 0 00-4 4H9.878a4 4 0 01-4-4V8z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18v3m0-8v2"></path>
                </svg>
                <span className="tracking-tight">Smart Queue</span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex md:items-center md:space-x-4 lg:space-x-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="nav-link text-text-dark font-medium rounded-md"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Auth/Action Buttons (Desktop) */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={toggleUserDropdown}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition duration-300"
                  >
                    <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <svg className={`w-4 h-4 text-gray-600 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isUserDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>
                      <Link href="/appointments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Appointments
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <a href="/login" className="px-3 py-2 text-primary-blue hover:text-secondary-green transition duration-300 font-semibold border border-transparent hover:border-primary-blue rounded-lg">
                    Sign In
                  </a>
                  <a href="/book" className="btn-pulse px-6 py-2 rounded-xl text-white font-bold bg-green-600 hover:bg-emerald-600 transition duration-300 shadow-lg shadow-secondary-green/50">
                    Book Now
                  </a>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button 
                id="mobile-menu-button" 
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-text-dark hover:text-primary-blue hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-blue transition duration-300" 
                aria-controls="mobile-menu" 
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger Icon */}
                <svg 
                    id="menu-icon-open" 
                    className={isOpen ? "hidden h-6 w-6" : "block h-6 w-6"}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* Close Icon */}
                <svg 
                    id="menu-icon-close" 
                    className={isOpen ? "block h-6 w-6" : "hidden h-6 w-6"}
                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className={`fixed inset-0 z-50 md:hidden ${isOpen ? 'block' : 'hidden'}`}>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleMenu}></div>
          
          {/* Sidebar */}
          <div className={`fixed right-0 top-0 h-full w-80 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button onClick={toggleMenu} className="p-2 rounded-md hover:bg-gray-800 text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* User Info */}
            {isAuthenticated && (
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary-green rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.name}</p>
                    <p className="text-sm text-gray-300">{user?.email}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Links */}
            <div className="py-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  className="block px-4 py-3 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-secondary-green transition duration-300"
                  onClick={toggleMenu}
                >
                  {link.name}
                </a>
              ))}
            </div>
            
            {/* User Actions */}
            {isAuthenticated ? (
              <div className="border-t border-gray-700 py-4">
                <Link href="/profile" className="block px-4 py-3 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-secondary-green" onClick={toggleMenu}>
                  Profile
                </Link>
                <Link href="/appointments" className="block px-4 py-3 text-base font-medium text-gray-300 hover:bg-gray-800 hover:text-secondary-green" onClick={toggleMenu}>
                  Appointments
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin" className="block px-4 py-3 text-base font-medium text-yellow-400 hover:bg-gray-800" onClick={toggleMenu}>
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); toggleMenu(); }}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-red-400 hover:bg-gray-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-700 py-4 px-4 space-y-3">
                <a href="/login" className="block w-full text-center px-4 py-2 rounded-lg text-primary-blue border border-primary-blue font-semibold hover:bg-gray-800 transition duration-300" onClick={toggleMenu}>
                  Sign In
                </a>
                <a href="/book" className="block w-full text-center px-4 py-2 rounded-lg text-white font-semibold bg-secondary-green hover:bg-emerald-600 transition duration-300 shadow-md" onClick={toggleMenu}>
                  Book Appointment
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;