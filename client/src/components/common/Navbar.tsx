import Link from 'next/link';
import React, { useState, useEffect } from 'react';

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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu on resize if it enters desktop view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // The custom CSS block is included here to maintain styles and animations
  const customStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    :root {
      --primary-blue: #3B82F6;
      --secondary-green: #10B981;
    }

    .nav-link {
        position: relative;
        padding: 8px 12px;
        transition: color 0.3s ease, background-color 0.3s ease;
    }

    /* Hover Glow Effect */
    .nav-link:hover {
        color: var(--secondary-green);
        background-color: rgba(59, 130, 246, 0.05);
    }

    /* Underline Slide Animation */
    .nav-link::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -5px;
        width: 0%;
        height: 2px;
        background-color: var(--secondary-green);
        transition: width 0.3s ease-out;
    }

    .nav-link:hover::after {
        width: 100%;
    }

    /* Mobile Menu Transition (Using CSS classes for smooth animation) */
    .mobile-menu-container {
        transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
        overflow: hidden;
        max-height: 0;
        opacity: 0;
    }
    .mobile-menu-container.open {
        max-height: 500px;
        opacity: 1;
    }

    /* Button Hover Pulse */
    .btn-pulse {
        transition: all 0.3s ease;
    }
    .btn-pulse:hover {
        box-shadow: 0 0 18px rgba(16, 185, 129, 0.6); /* secondary-green glow */
        transform: translateY(-2px);
    }
  `;

  // Custom Tailwind config script for color definition
  const tailwindConfigScript = `
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    'primary-blue': '#3B82F6',
                    'secondary-green': '#10B981',
                    'bg-light': '#F9FAFB',
                    'text-dark': '#1F2937',
                },
                fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                },
            },
        },
    };
  `;


  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: tailwindConfigScript }} />
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />

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
              <a href="/login" className="px-3 py-2 text-primary-blue hover:text-secondary-green transition duration-300 font-semibold border border-transparent hover:border-primary-blue rounded-lg">
                Sign In
              </a>
              <a href="/book" className="btn-pulse px-6 py-2 rounded-xl text-white font-bold bg-green-600 hover:bg-emerald-600 transition duration-300 shadow-lg shadow-secondary-green/50">
                Book Now
              </a>
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

        {/* Mobile Menu Content */}
        <div id="mobile-menu" className={`${isOpen ? 'open' : ''} mobile-menu-container md:hidden bg-white shadow-inner`}>
          <div className="pt-2 pb-3 space-y-1 px-4 sm:px-6">
            {navLinks.map((link) => (
              <a 
                key={link.name}
                href={link.href} 
                className="block px-3 py-2 text-base font-medium text-text-dark rounded-md hover:bg-gray-50 hover:text-primary-blue transition duration-300"
              >
                {link.name}
              </a>
            ))}
          </div>
          <div className="pt-4 pb-4 border-t border-gray-100">
            <div className="px-4 space-y-2">
              <a href="/signin" className="block w-full text-center px-4 py-2 rounded-lg text-primary-blue border border-primary-blue font-semibold hover:bg-gray-50 transition duration-300">Sign In</a>
              <a href="/book" className="block w-full text-center btn-pulse px-4 py-2 rounded-lg text-white font-semibold bg-secondary-green hover:bg-emerald-600 transition duration-300 shadow-md">Book Appointment</a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;