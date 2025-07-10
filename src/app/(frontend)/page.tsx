'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, MapPin, Globe, CheckCircle, XCircle, AlertCircle, Crown, LogOut, BarChart3, TrendingUp, Zap, Lightbulb, Briefcase, Bell } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import AuthModal from '@/components/AuthModal';
import WebsiteReportModal from '@/components/WebsiteReportModal';
import LeadFunnel from '@/components/LeadFunnel';
import NotificationsPanel from '@/components/NotificationsPanel';

// Enhanced interfaces to match backend
interface WebsiteStatus {
  accessible: boolean;
  status_code: number;
  error?: string;
  load_time?: number;
  ssl_certificate?: boolean;
  mobile_friendly?: boolean;
  last_checked?: string;
}

interface WebsiteQuality {
  overall_score: number;
  seo_score: number;
  performance_score: number;
  design_score: number;
  content_score: number;
  technical_score: number;
  issues: string[];
  recommendations: string[];
  last_analyzed?: string;
}

interface BusinessInsights {
  estimated_age: string;
  business_size: 'small' | 'medium' | 'large';
  digital_presence: 'strong' | 'moderate' | 'weak' | 'none';
  opportunity_score: number;
  recommended_services: string[];
  last_updated?: string;
}

interface Business {
  name: string;
  address: string;
  rating: number;
  review_count: number;
  phone: string;
  website: string;
  website_status: WebsiteStatus;
  place_id: string;
  location: {
    lat: number;
    lng: number;
  };
  lead_score?: number;
  website_quality?: WebsiteQuality;
  business_insights?: BusinessInsights;
}

interface MarketAnalysis {
  market_saturation: 'low' | 'medium' | 'high';
  website_adoption_rate: number;
  average_rating: number;
  competition_level: 'low' | 'medium' | 'high';
  opportunity_score: number;
  top_competitors: Business[];
  market_gaps: string[];
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
    average_rating: number;
    high_opportunity_count: number;
    market_analysis?: MarketAnalysis | null;
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
  const [activeTab, setActiveTab] = useState<'search' | 'analytics' | 'funnel'>('search');
  const [authLoading, setAuthLoading] = useState(true);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Premium search settings (only for logged-in users)
  const [maxResults, setMaxResults] = useState(10);
  const [filterNoWebsite, setFilterNoWebsite] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(10); // Default 10 miles
  const [minRating, setMinRating] = useState(0);
  const [minLeadScore, setMinLeadScore] = useState(0);
  
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
  const [addingLead, setAddingLead] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
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
  }, [authLoading]);

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
  }, [checkAuthStatus]);

  // Fetch analytics data when analytics tab is active
  useEffect(() => {
    if (activeTab === 'analytics' && currentUser && !analyticsData) {
      fetchAnalyticsData();
    }
  }, [activeTab, currentUser, analyticsData, fetchAnalyticsData]);

  // Fetch unread notification count
  useEffect(() => {
    if (currentUser) {
      const fetchCount = async () => {
        try {
          // This re-uses the notifications endpoint, which is slightly inefficient
          // In a real app, you might create a dedicated count endpoint.
          const response = await fetch(`/api/notifications?userId=${currentUser.id}&unread=true`);
          if(response.ok) {
            const data = await response.json();
            setUnreadCount(data.length);
          }
        } catch (error) {
          console.error("Failed to fetch notification count", error);
        }
      };
      fetchCount();
    }
  }, [currentUser]);

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
      const response = await fetch('/api/search-free', {
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
          radiusKm: radiusMiles * 1.60934, // Convert miles to kilometers
          minRating: currentUser ? minRating : 0,
          minLeadScore: currentUser ? minLeadScore : 0,
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

  const handleAddLead = async (business: Business) => {
    if (!currentUser) {
      setError("Please log in to add leads.");
      setShowAuthModal(true);
      return;
    }

    setAddingLead(business.place_id);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business, userId: currentUser.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add lead.');
      }

      // Optionally, give some feedback to the user
      alert(`${business.name} has been added to your lead funnel!`);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while adding lead.");
    } finally {
      setAddingLead(null);
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
              "price": "7.00",
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
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Briefcase className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">BusinessChecker</h1>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setActiveTab('search')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'search' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Search className="w-4 h-4 inline-block mr-1.5" />
                    Search
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline-block mr-1.5" />
                    Analytics
                  </button>
                  <button
                    onClick={() => setActiveTab('funnel')}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'funnel' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 inline-block mr-1.5" />
                    Lead Funnel
                  </button>
                  <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                    <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 rounded-full hover:bg-gray-100">
                      <Bell className="w-5 h-5 text-gray-600"/>
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                      )}
                    </button>
                    <span className="text-sm text-gray-600 hidden sm:inline">{currentUser.firstName} {currentUser.lastName}</span>
                    <button onClick={handleLogout} className="text-gray-500 hover:text-red-600" title="Logout">
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
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

      {showNotifications && currentUser && (
        <NotificationsPanel 
          userId={currentUser.id}
          onClose={() => setShowNotifications(false)}
        />
      )}

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
              <button
                onClick={() => setActiveTab('funnel')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'funnel'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Lead Funnel
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
                      Get <span className="font-bold text-blue-600">2 free searches</span> to explore our platform. 
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
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 space-y-6">
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-lg font-bold text-gray-900">Premium Search Options</h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-6">
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
                        <label htmlFor="radiusMiles" className="block text-sm font-semibold text-gray-700 mb-2">
                          Search Radius
                        </label>
                        <select
                          id="radiusMiles"
                          value={radiusMiles}
                          onChange={(e) => setRadiusMiles(parseInt(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black bg-white"
                        >
                          <option value={1}>1 mile</option>
                          <option value={5}>5 miles</option>
                          <option value={10}>10 miles</option>
                          <option value={25}>25 miles</option>
                          <option value={50}>50 miles</option>
                        </select>
                      </div>

                      <div className="group">
                        <label htmlFor="minRating" className="block text-sm font-semibold text-gray-700 mb-2">
                          Minimum Rating
                        </label>
                        <select
                          id="minRating"
                          value={minRating}
                          onChange={(e) => setMinRating(parseFloat(e.target.value))}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black bg-white"
                        >
                          <option value={0}>Any</option>
                          <option value={3}>3.0+</option>
                          <option value={3.5}>3.5+</option>
                          <option value={4}>4.0+</option>
                          <option value={4.5}>4.5+</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Filter by Website Status
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
                            Only businesses without websites
                          </label>
                        </div>
                      </div>

                      <div className="group">
                        <label htmlFor="minLeadScore" className="block text-sm font-semibold text-gray-700 mb-2">
                          Minimum Lead Score
                        </label>
                        <input
                          type="range"
                          id="minLeadScore"
                          min="0"
                          max="100"
                          value={minLeadScore}
                          onChange={(e) => setMinLeadScore(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                         <div className="text-center text-sm text-gray-600 mt-1">
                          {minLeadScore} / 100
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
                          Unlock All Results - $7/month
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
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
                    <div className="bg-gradient-to-br from-red-50 to-orange-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <XCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-red-700 mb-1">{results.statistics.no_website_count}</div>
                      <div className="text-sm font-medium text-red-600">No Website</div>
                    </div>
                    {/* New Stat: High Opportunity Leads */}
                    {currentUser && (
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-3xl font-bold text-yellow-700 mb-1">{results.statistics.high_opportunity_count}</div>
                        <div className="text-sm font-medium text-yellow-600">High Opportunity</div>
                      </div>
                    )}
                  </div>

                  {/* New Section: Market Analysis for Premium Users */}
                  {currentUser && results.statistics.market_analysis && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border-2 border-indigo-100 shadow-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                          Market Analysis
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="text-center bg-white/50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-indigo-700">{results.statistics.market_analysis.opportunity_score}%</div>
                          <div className="text-sm font-medium text-indigo-600">Market Opportunity</div>
                        </div>
                        <div className="text-center bg-white/50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-purple-700">{results.statistics.market_analysis.website_adoption_rate}%</div>
                          <div className="text-sm font-medium text-purple-600">Website Adoption</div>
                        </div>
                        <div className="text-center bg-white/50 rounded-xl p-4">
                          <div className="text-2xl font-bold text-pink-700">{results.statistics.market_analysis.average_rating.toFixed(1)}/5</div>
                          <div className="text-sm font-medium text-pink-600">Average Rating</div>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        {results.statistics.market_analysis.market_gaps.map((gap, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span>{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                        
                        {/* Lead Score for Premium Users */}
                        {currentUser && business.lead_score !== undefined && (
                          <div className="my-4">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-500" />
                                Lead Score
                              </span>
                              <span className="text-sm font-bold text-blue-600">{business.lead_score.toFixed(0)} / 100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2.5 rounded-full" 
                                style={{ width: `${business.lead_score}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

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

                        {/* Premium Features & Actions */}
                        {currentUser && results.payment_info.upgrade_price === 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <button
                              onClick={() => setReportUrl(business.website)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                            >
                              <Zap className="w-4 h-4 mr-1.5" />
                              Deep Dive
                            </button>
                             <button
                              onClick={() => handleAddLead(business)}
                              disabled={addingLead === business.place_id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                            >
                              <TrendingUp className="w-4 h-4 mr-1.5" />
                              {addingLead === business.place_id ? 'Adding...' : 'Add to Funnel'}
                            </button>
                          </div>
                        )}

                        {/* Premium Business Insights */}
                        {currentUser && business.business_insights && (
                          <div className="mt-6 pt-6 border-t border-gray-200/80">
                            <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-indigo-500" />
                              Premium Insights
                            </h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div className="bg-gray-100/70 p-3 rounded-lg">
                                <p className="font-semibold text-gray-600">Digital Presence</p>
                                <p className="font-bold text-gray-900 capitalize">{business.business_insights.digital_presence}</p>
                              </div>
                              <div className="bg-gray-100/70 p-3 rounded-lg">
                                <p className="font-semibold text-gray-600">Opportunity Score</p>
                                <p className="font-bold text-green-600">{business.business_insights.opportunity_score}/100</p>
                              </div>
                              <div className="bg-gray-100/70 p-3 rounded-lg">
                                <p className="font-semibold text-gray-600">Business Size</p>
                                <p className="font-bold text-gray-900 capitalize">{business.business_insights.business_size}</p>
                              </div>
                            </div>
                             <div className="mt-4">
                                <h6 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                                  Recommended Services
                                </h6>
                                <div className="flex flex-wrap gap-2">
                                  {business.business_insights.recommended_services.map(service => (
                                    <span key={service} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'funnel' && currentUser && (
          <LeadFunnel />
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

      {/* Website Report Modal */}
      {reportUrl && (
        <WebsiteReportModal
          url={reportUrl}
          userId={currentUser?.id || null}
          onClose={() => setReportUrl(null)}
        />
      )}
      </div>
    </>
  );
}
