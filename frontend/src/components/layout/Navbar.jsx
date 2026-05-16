import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <nav className="fixed w-full z-50 bg-dark-900/80 backdrop-blur-md border-b border-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary-500 hover:text-primary-400 transition-colors">
              DevPortfolio AI
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/#about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">About</Link>
              <Link to="/#skills" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Skills</Link>
              <Link to="/#projects" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Projects</Link>
              <Link to="/dashboard" className="text-primary-500 hover:bg-primary-900 hover:text-primary-100 px-4 py-2 rounded-md text-sm font-medium border border-primary-500 transition-all">AI Dashboard</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
