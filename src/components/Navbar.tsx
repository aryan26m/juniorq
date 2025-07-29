'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav className="bg-dark-sidebar shadow-sm border-b border-dark-lighter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              JuniorQ
            </Link>
            <span className="ml-2 text-sm text-gray-400">| KNIT Sultanpur</span>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            <Link 
              href="/about" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              About
            </Link>
            <Link 
              href="/blog" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Blog
            </Link>
            <Link 
              href="/contact" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:from-accent hover:to-primary transition-all duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-md text-sm font-medium hover:from-accent hover:to-primary transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
