'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  BarChart3, 
  TrendingUp, 
  LogOut, 
  User, 
  Crown, 
  Menu, 
  X,
  Briefcase,
  Sparkles,
  Zap,
  Users
} from 'lucide-react';

interface ModernNavbarProps {
  currentUser?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    subscriptionStatus?: string;
  } | null;
  onLoginClick?: () => void;
  onUpgradeClick?: () => void;
  onLogout?: () => void;
  onCreateFunnel?: () => void;
}

export default function ModernNavbar({
  currentUser,
  onLoginClick,
  onUpgradeClick,
  onLogout,
  onCreateFunnel
}: ModernNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    {
      id: 'search',
      label: 'Search',
      icon: Search,
      description: 'Find local businesses',
      href: '/'
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Users,
      description: 'Manage clients & contacts',
      href: '/crm'
    },
    {
      id: 'funnels',
      label: 'Funnels',
      icon: Briefcase,
      description: 'Manage lead funnels',
      href: '/funnels'
    }
  ];

  const getActiveTab = () => {
    if (pathname === '/') return 'search';
    if (pathname === '/crm') return 'crm';
    if (pathname === '/funnels') return 'funnels';
    return 'search';
  };

  const activeTab = getActiveTab();

  return (
    <>
      {/* Glassmorphism Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/10 backdrop-blur-xl shadow-2xl border-b border-white/20' 
          : 'bg-white/5 backdrop-blur-md'
      }`}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50"></div>
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group relative z-10">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/90 to-indigo-600/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-300 group-hover:scale-110 border border-white/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse shadow-lg"></div>
                <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-pulse shadow-lg"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent drop-shadow-lg">
                  Client Compass
                </h1>
                <p className="text-xs text-white/70 hidden sm:block font-medium">Navigate to Success</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`group relative px-6 py-3 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-white/20 backdrop-blur-sm text-white shadow-xl border border-white/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 transition-transform duration-300 ${
                        isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    
                    {/* Glow effect on hover */}
                    <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' 
                        : 'group-hover:bg-gradient-to-r from-blue-500/10 to-purple-500/10'
                    }`}></div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-2 bg-black/80 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap border border-white/20">
                      {item.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/80"></div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  {/* User Profile */}
                  <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/90 to-indigo-600/90 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-sm font-semibold text-white">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-xs text-white/70">{currentUser.email}</p>
                    </div>
                  </div>

                  {/* Premium Badge */}
                  {currentUser.subscriptionStatus === 'active' && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-400/90 to-orange-500/90 backdrop-blur-sm rounded-full border border-yellow-300/30 shadow-lg">
                      <Crown className="w-4 h-4 text-white" />
                      <span className="text-sm font-bold text-white">Premium</span>
                    </div>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={onLogout}
                    className="p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl backdrop-blur-sm border border-transparent hover:border-white/20 transition-all duration-300"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  {/* Login Button */}
                  <button
                    onClick={onLoginClick}
                    className="px-6 py-3 text-white/90 hover:text-white border border-white/30 hover:border-white/50 rounded-2xl font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
                  >
                    Login
                  </button>

                  {/* Upgrade Button */}
                  <button
                    onClick={onUpgradeClick}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500/90 to-indigo-600/90 hover:from-blue-600/90 hover:to-indigo-700/90 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 backdrop-blur-sm border border-white/20"
                  >
                    <Zap className="w-5 h-5" />
                    <span>Upgrade</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-2xl backdrop-blur-sm border border-transparent hover:border-white/20 transition-all duration-300"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/10 backdrop-blur-xl border-t border-white/20 shadow-2xl">
            <div className="px-4 py-6 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">{item.label}</span>
                      <span className="text-sm opacity-75">{item.description}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-20"></div>
    </>
  );
} 