'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Globe, CheckCircle, XCircle, AlertCircle, Crown, LogOut, BarChart3 } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AuthModal from '@/components/AuthModal';

interface Business {
  name: string;
  address: string;
  rating: number;
  review_count: number;
  phone: string;
  website: string;
  website_status: {
    accessible: boolean;
    status_code: number;
    error?: string;
    load_time?: number;
  };
  place_id: string;
  location: {
    lat: number;
    lng: number;
  };
}

interface SearchResults {
  businesses: Business[];
  statistics: {
    total_businesses: number;
    businesses_with_websites: number;
    accessible_websites: number;
    no_website_count: number;
    website_percentage: number;
    accessible_percentage: number;
  };
  payment_info: {
    is_free_user: boolean;
    total_found: number;
    showing: number;
    remaining: number;
    upgrade_price: number;
    searches_remaining?: number | null;
  };
}

export default function BusinessChecker() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; firstName: string; lastName: string; subscriptionStatus?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'analytics'>('search');
  const [authLoading, setAuthLoading] = useState(true);
  
  // Premium search settings (only for logged-in users)
  const [maxResults, setMaxResults] = useState(10);
  const [filterNoWebsite, setFilterNoWebsite] = useState(false);
  
  // Analytics data
  const [analyticsData, setAnalyticsData] = useState<{
    totalSearches: number;
    searchesThisMonth: number;
    businessesFound: number;
    websitesAnalyzed: number;
    accessibleWebsites: number;
    searchHistory: Array<{ date: string; searches: number; businessesFound: number; }>;
    topLocations: Array<{ location: string; searches: number; businesses: number; }>;
    topQueries: Array<{ query: string; searches: number; avgBusinesses: number; }>;
    websiteHealth: { accessible: number; inaccessible: number; noWebsite: number; };
  } | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [lastSearchTime, setLastSearchTime] = useState(0);
  const SEARCH_DEBOUNCE_MS = 2000; // Minimum 2 seconds between searches

  const checkAuthStatus = async () => {
    if (!authLoading) return; // Only check if we're currently in loading state
    
    try {
      const response = await fetch('/api/auth/verify-token');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchAnalyticsData = useCallback(async () => {
    if (!currentUser || analyticsLoading) return; // Prevent multiple simultaneous calls
    
    setAnalyticsLoading(true);
    try {
      const response = await fetch(`/api/analytics?userId=${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error('Failed to fetch analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [currentUser, analyticsLoading]); // Added analyticsLoading to prevent concurrent calls

  // Check authentication status on page load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Fetch analytics data when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics' && currentUser && !analyticsData) {
      fetchAnalyticsData();
    }
  }, [activeTab, currentUser, analyticsData]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleAuthSuccess = (user: { id: string; email: string; firstName: string; lastName: string }, token: string) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    // Store token in localStorage as backup
    localStorage.setItem('auth-token', token);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !location.trim()) return;

    // Debounce search requests to prevent spam
    const now = Date.now();
    if (now - lastSearchTime < SEARCH_DEBOUNCE_MS) {
      setError(`Please wait ${Math.ceil((SEARCH_DEBOUNCE_MS - (now - lastSearchTime)) / 1000)} seconds before searching again.`);
      return;
    }

    setLoading(true);
    setError(null);
    setLastSearchTime(now);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          location: location.trim(),
          userId: currentUser?.id || null,
          maxResults: currentUser ? maxResults : 10,
          filterNoWebsite: currentUser ? filterNoWebsite : false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.requiresSubscription) {
          setError(errorData.message);
          setShowPaymentModal(true);
          return;
        }
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (user: { id: string; email: string; firstName: string; lastName: string }) => {
    // User is already passed from PaymentModal with token set
    setCurrentUser(user);
    setShowPaymentModal(false);
    
    // Refresh the search if there was one
    if (results && query && location) {
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  const refreshAnalytics = () => {
    setAnalyticsData(null);
    fetchAnalyticsData();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('auth-token');
      setCurrentUser(null);
      setResults(null);
      setActiveTab('search');
      setAnalyticsData(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getWebsiteStatusIcon = (status: Business['website_status']) => {
    if (!status) return <AlertCircle className="w-4 h-4 text-gray-400" />;
    
    if (status.accessible) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getWebsiteStatusText = (status: Business['website_status']) => {
    if (!status) return 'Unknown';
    
    if (status.accessible) {
      return `Accessible (${status.load_time?.toFixed(2)}s)`;
    } else {
      return `Error: ${status.error || `HTTP ${status.status_code}`}`;
    }
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "BusinessChecker",
            "url": "https://buildquick.io",
            "description": "Discover local businesses and get comprehensive website analysis. Find businesses without websites, check website accessibility, and get detailed analytics.",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "20.00",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "RecurringPaymentFrequency",
                "frequency": "monthly"
              }
            },
            "featureList": [
              "Local business search",
              "Website analysis",
              "Accessibility checking",
              "Lead generation",
              "Business analytics",
              "Competitor analysis"
            ],
            "provider": {
              "@type": "Organization",
              "name": "BusinessChecker",
              "url": "https://buildquick.io"
            }
          })
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                BusinessChecker
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-2 rounded-full border border-yellow-200">
                    <Crown className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {currentUser.firstName} {currentUser.lastName}
                    </span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                      Premium
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-all duration-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Upgrade to Premium
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium User Navigation */}
        {currentUser && (
          <div className="mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('search')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'search'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Business Search
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Analytics Dashboard
              </button>
            </nav>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'analytics' && currentUser ? (
          analyticsLoading ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your analytics data...</p>
            </div>
          ) : analyticsData ? (
            <AnalyticsDashboard data={analyticsData} onRefresh={refreshAnalytics} />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data Yet</h3>
              <p className="text-gray-600 mb-4">
                Start searching for businesses to see your analytics dashboard with insights and trends.
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Start Searching
              </button>
            </div>
                     )
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12 relative">
              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute top-32 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-48 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
              </div>

              <div className="relative">
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Local Business
                  </span>
                  <br />
                  <span className="text-gray-900">Website Checker</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  Discover local businesses and analyze their online presence in seconds. 
                  <span className="text-blue-600 font-semibold">Get actionable insights</span> to grow your business.
                </p>
                
                {!currentUser && (
                  <div className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 mb-8 shadow-lg max-w-2xl mx-auto">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900">Free Trial Available</h3>
                        <p className="text-sm text-gray-600">No credit card required</p>
                      </div>
                    </div>
                    <p className="text-gray-800 text-lg">
                      Get <span className="font-bold text-blue-600">5 free searches</span> to explore our platform. 
                      Upgrade for unlimited searches and premium analytics!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Search Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20">
              <form onSubmit={handleSearch} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label htmlFor="query" className="block text-sm font-semibold text-gray-700 mb-3">
                      What type of business are you looking for?
                    </label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        id="query"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="restaurants, dentists, plumbers, hotels..."
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black placeholder-gray-400 bg-white/90"
                        required
                      />
                    </div>
                  </div>
                  <div className="group">
                    <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-3">
                      Where should we search?
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="New York, NY or 10001"
                        className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black placeholder-gray-400 bg-white/90"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Premium Search Options - Only visible for logged-in users */}
                {currentUser && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Crown className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-bold text-gray-900">Premium Search Options</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="group">
                        <label htmlFor="maxResults" className="block text-sm font-semibold text-gray-700 mb-2">
                          Number of businesses to fetch
                        </label>
                        <select
                          id="maxResults"
                          value={maxResults}
                          onChange={(e) => setMaxResults(parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black bg-white"
                        >
                          <option value={10}>10 businesses</option>
                          <option value={20}>20 businesses</option>
                          <option value={30}>30 businesses</option>
                          <option value={50}>50 businesses</option>
                          <option value={100}>100 businesses</option>
                        </select>
                      </div>
                      
                      <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Filter Options
                        </label>
                        <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-xl bg-white">
                          <input
                            type="checkbox"
                            id="filterNoWebsite"
                            checked={filterNoWebsite}
                            onChange={(e) => setFilterNoWebsite(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <label htmlFor="filterNoWebsite" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Show only businesses without websites
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-md"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Searching businesses...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Search className="w-5 h-5" />
                      <span>Search Businesses</span>
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-6 mb-6 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Search Results */}
            {results && (
              <div className="space-y-8">
                {/* Statistics */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Search Results
                    </h2>
                  </div>
                  
                  {/* Usage Info for Free Users */}
                  {results.payment_info.is_free_user && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-8 shadow-lg">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                            <Crown className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-amber-900 font-bold text-lg">
                              Free Trial: Showing {results.payment_info.showing} of {results.payment_info.total_found} results found
                            </p>
                            {results.payment_info.searches_remaining !== undefined && (
                              <p className="text-amber-700 text-sm mt-1">
                                {results.payment_info.searches_remaining} free searches remaining
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                        >
                          Unlock All Results - $20/month
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-blue-700 mb-1">{results.statistics.total_businesses}</div>
                      <div className="text-sm font-medium text-blue-600">Total Businesses</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-green-700 mb-1">{results.statistics.businesses_with_websites}</div>
                      <div className="text-sm font-medium text-green-600">With Websites</div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-emerald-700 mb-1">{results.statistics.accessible_websites}</div>
                      <div className="text-sm font-medium text-emerald-600">Accessible</div>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-orange-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <XCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-red-700 mb-1">{results.statistics.no_website_count}</div>
                      <div className="text-sm font-medium text-red-600">No Website</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200 shadow-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <Globe className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-purple-700">
                          {results.statistics.website_percentage}%
                        </div>
                      </div>
                      <div className="text-sm font-medium text-purple-600">Have websites</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {results.statistics.accessible_percentage}%
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-600">Websites are accessible</div>
                    </div>
                  </div>
                </div>

                {/* Business List */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Business Details
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {results.businesses.map((business) => (
                      <div key={business.place_id} className="bg-gradient-to-r from-white to-gray-50 border-2 border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-blue-200">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 mb-2">{business.name}</h4>
                            <p className="text-gray-600 flex items-center">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                              {business.address}
                            </p>
                          </div>
                          <div className="mt-4 md:mt-0 md:text-right">
                            <div className="flex items-center justify-start md:justify-end space-x-2 mb-1">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <div key={i} className={`w-4 h-4 ${i < business.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    ⭐
                                  </div>
                                ))}
                              </div>
                              <span className="text-sm font-medium text-gray-700">{business.rating}/5</span>
                            </div>
                            <div className="text-sm text-gray-500">({business.review_count} reviews)</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm">📞</span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700">Phone</p>
                                <p className="text-gray-900">{business.phone || 'Not available'}</p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Globe className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">Website</p>
                                {business.website !== 'N/A' ? (
                                  <a 
                                    href={business.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-600 hover:text-blue-800 hover:underline break-all text-sm"
                                  >
                                    {business.website}
                                  </a>
                                ) : (
                                  <p className="text-gray-500 text-sm">No website found</p>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-start lg:justify-end">
                            <div className="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-200">
                              <div className="flex items-center space-x-3">
                                {getWebsiteStatusIcon(business.website_status)}
                                <div>
                                  <p className="text-sm font-medium text-gray-700">Website Status</p>
                                  <p className="text-sm text-gray-600">
                                    {getWebsiteStatusText(business.website_status)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}
      </div>
    </>
  );
}
