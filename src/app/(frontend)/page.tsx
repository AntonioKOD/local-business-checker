/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Globe, CheckCircle, XCircle, AlertCircle, Crown, Zap, Lightbulb, Briefcase, Plus, Download, TrendingUp } from 'lucide-react';
import WebsiteReportModal from '@/components/WebsiteReportModal';

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
  rating: number | string;
  total_ratings?: number | string;
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
  emails?: string[];
  social_media?: {
    facebook?: string[];
    instagram?: string[];
    linkedin?: string[];
    twitter?: string[];
    youtube?: string[];
    yelp?: string[];
  };
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

export default function ClientCompass() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; firstName: string; lastName: string; subscriptionStatus?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  // Premium search settings (only for logged-in users)
  const [maxResults, setMaxResults] = useState(10);
  const [filterNoWebsite, setFilterNoWebsite] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(10); // Default 10 miles
  const [minRating, setMinRating] = useState(0);

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

  // Check authentication status on page load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

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
          minLeadScore: 0,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.requiresSubscription) {
          setError(errorData.message);
          // Redirect to home page to trigger payment modal
          window.location.href = '/';
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

  // CSV Export functionality
  const exportToCSV = async () => {
    if (!results?.businesses || results.businesses.length === 0) {
      alert('No search results to export');
      return;
    }

    try {
      const response = await fetch('/api/export-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchResults: results,
          fileName: `business-search-results-${new Date().toISOString().split('T')[0]}`
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `business-search-results-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export results. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setResults(null);
      localStorage.removeItem('auth-token');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getWebsiteStatusIcon = (status: Business['website_status']) => {
    if (!status) {
      return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
    if (status.accessible) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (status.status_code === 0) {
      return <XCircle className="w-5 h-5 text-red-600" />;
    } else {
      return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getWebsiteStatusText = (status: Business['website_status']) => {
    if (!status) {
      return 'Status unknown';
    }
    if (status.accessible) {
      return 'Website accessible';
    } else if (status.status_code === 0) {
      return 'No website found';
    } else {
      return `Website error (${status.status_code})`;
    }
  };

  const handleAddLead = async (business: Business) => {
    if (!currentUser) return;
    
    setAddingLead(business.place_id);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          businessName: business.name,
          businessAddress: business.address,
          businessPhone: business.phone,
          businessWebsite: business.website,
          businessRating: business.rating,
          leadScore: business.lead_score || 0,
          websiteStatus: business.website_status,
          businessInsights: business.business_insights,
        }),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Client Compass",
            "url": "http://localhost:3000",
            "description": "Discover local businesses and get comprehensive website analysis.",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "20.00",
              "priceCurrency": "USD"
            }
          })
        }}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="space-y-8">
          {/* Search Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group">
                  <label htmlFor="query" className="block text-sm font-semibold text-gray-700 mb-3">
                    What type of business are you looking for?
                  </label>
                  <div>
                    <input
                      type="text"
                      id="query"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="restaurants, dentists, plumbers, hotels..."
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black placeholder-gray-400 bg-white/90"
                      required
                    />
                  </div>
                </div>
                <div className="group">
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-3">
                    Where should we search?
                  </label>
                  <div>
                    <input
                      type="text"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="New York, NY or 10001"
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black placeholder-gray-400 bg-white/90"
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
                        Search radius (miles)
                      </label>
                      <select
                        id="radiusMiles"
                        value={radiusMiles}
                        onChange={(e) => setRadiusMiles(parseInt(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black bg-white"
                      >
                        <option value={5}>5 miles</option>
                        <option value={10}>10 miles</option>
                        <option value={25}>25 miles</option>
                        <option value={50}>50 miles</option>
                        <option value={100}>100 miles</option>
                      </select>
                    </div>
                    
                    <div className="group">
                      <label htmlFor="minRating" className="block text-sm font-semibold text-gray-700 mb-2">
                        Minimum rating
                      </label>
                      <select
                        id="minRating"
                        value={minRating}
                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-black bg-white"
                      >
                        <option value={0}>Any rating</option>
                        <option value={3.0}>3.0+ stars</option>
                        <option value={3.5}>3.5+ stars</option>
                        <option value={4.0}>4.0+ stars</option>
                        <option value={4.5}>4.5+ stars</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filterNoWebsite}
                        onChange={(e) => setFilterNoWebsite(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Only show businesses without websites</span>
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transform hover:scale-105 disabled:hover:scale-100 transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Search Local Businesses</span>
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Results Section */}
          {results && (
            <div className="space-y-6">
              {/* Search Statistics */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-3xl font-bold text-blue-600">{results.statistics.total_businesses}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Businesses</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-3xl font-bold text-green-600">{results.statistics.website_percentage}%</div>
                    <div className="text-sm text-gray-600 mt-1">Have Websites</div>
                  </div>
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <div className="text-3xl font-bold text-yellow-600">{results.statistics.accessible_percentage}%</div>
                    <div className="text-sm text-gray-600 mt-1">Accessible Sites</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-3xl font-bold text-purple-600">{results.statistics.average_rating.toFixed(1)}</div>
                    <div className="text-sm text-gray-600 mt-1">Avg Rating</div>
                  </div>
                </div>

                {/* CSV Export Button */}
                <div className="mt-6 flex flex-col items-center space-y-3">
                  <button
                    onClick={exportToCSV}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Export to CSV
                  </button>
                  <p className="text-xs text-gray-500 text-center max-w-md">
                    💾 Search results are not automatically saved to reduce database costs. 
                    Export your results to keep them for future reference.
                  </p>
                </div>

                {/* Payment Info */}
                {results.payment_info && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">
                          Showing {results.payment_info.showing} of {results.payment_info.total_found} businesses found
                        </p>
                        {results.payment_info.is_free_user && results.payment_info.remaining > 0 && (
                          <p className="text-xs text-blue-600 mt-1">
                            Upgrade to see all {results.payment_info.remaining} remaining businesses
                          </p>
                        )}
                      </div>
                      {results.payment_info.is_free_user && results.payment_info.remaining > 0 && (
                        <button
                          onClick={() => window.location.href = '/'}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transform hover:scale-105 transition-all duration-200"
                        >
                          Upgrade - ${results.payment_info.upgrade_price}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Business Cards */}
              <div className="grid gap-6">
                {results.businesses.map((business, index) => (
                  <div key={business.place_id || index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{business.name}</h3>
                            <p className="text-gray-600 mb-2">{business.address}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{business.phone || 'No phone'}</span>
                              <div className="flex items-center space-x-1">
                                <span className="text-yellow-500">★</span>
                                <span>
                                  {typeof business.rating === 'number' ? business.rating.toFixed(1) : business.rating}
                                </span>
                                {business.total_ratings && (
                                  <span className="text-gray-400">
                                    ({typeof business.total_ratings === 'number' ? business.total_ratings : business.total_ratings} reviews)
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {business.lead_score && (
                            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              Lead Score: {business.lead_score}/100
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline truncate max-w-xs"
                            >
                              {business.website || 'No website'}
                            </a>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getWebsiteStatusIcon(business.website_status)}
                            <span className="text-sm text-gray-600">
                              {getWebsiteStatusText(business.website_status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Premium Features & Actions */}
                      {currentUser && results.payment_info.upgrade_price === 0 ? (
                        <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
                          <button
                            onClick={() => setReportUrl(business.website)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Deep Dive
                          </button>
                          <button
                            onClick={() => handleAddLead(business)}
                            disabled={addingLead === business.place_id}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            {addingLead === business.place_id ? 'Adding...' : 'Add to Funnel'}
                          </button>
                        </div>
                      ) : !currentUser ? (
                        <div className="flex flex-col space-y-2 lg:flex-row lg:space-y-0 lg:space-x-2">
                          <button
                            onClick={() => window.location.href = '/'}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            SEO Deep Dive - Premium
                          </button>
                          <button
                            onClick={() => window.location.href = '/'}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Add to Funnel - Premium
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Business Insights - Now Available for All Users */}
                    {business.business_insights && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-indigo-500" />
                          Business Insights
                        </h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-semibold text-gray-600">Digital Presence</p>
                            <p className="font-bold text-gray-900 capitalize">{business.business_insights.digital_presence}</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="font-semibold text-gray-600">Opportunity Score</p>
                            <p className="font-bold text-green-600">{business.business_insights.opportunity_score}/100</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
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
                            {business.business_insights.recommended_services.map((service, idx) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
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

              {/* Market Analysis - Premium Feature */}
              {results.statistics.market_analysis && currentUser ? (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    Market Analysis
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/80 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-700 mb-2">Market Saturation</h4>
                      <p className="text-2xl font-bold text-purple-900 capitalize">{results.statistics.market_analysis.market_saturation}</p>
                    </div>
                    <div className="bg-white/80 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-700 mb-2">Website Adoption</h4>
                      <p className="text-2xl font-bold text-purple-900">{results.statistics.market_analysis.website_adoption_rate}%</p>
                    </div>
                    <div className="bg-white/80 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-700 mb-2">Competition Level</h4>
                      <p className="text-2xl font-bold text-purple-900 capitalize">{results.statistics.market_analysis.competition_level}</p>
                    </div>
                  </div>
                  {results.statistics.market_analysis.market_gaps.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-purple-700 mb-3">Market Opportunities</h4>
                      <div className="space-y-2">
                        {results.statistics.market_analysis.market_gaps.map((gap, index) => (
                          <div key={index} className="bg-white/80 p-3 rounded-lg text-sm">
                            <span className="text-purple-800">{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : !currentUser ? (
                <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-8 shadow-lg relative overflow-hidden">
                  <h3 className="text-2xl font-bold text-purple-800 mb-6 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                    Market Analysis
                  </h3>
                  <div className="blur-sm">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-white/80 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-700 mb-2">Market Saturation</h4>
                        <p className="text-2xl font-bold text-purple-900 capitalize">Medium</p>
                      </div>
                      <div className="bg-white/80 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-700 mb-2">Website Adoption</h4>
                        <p className="text-2xl font-bold text-purple-900">45%</p>
                      </div>
                      <div className="bg-white/80 p-4 rounded-lg">
                        <h4 className="font-semibold text-purple-700 mb-2">Competition Level</h4>
                        <p className="text-2xl font-bold text-purple-900 capitalize">Low</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <h4 className="font-semibold text-purple-700 mb-3">Market Opportunities</h4>
                      <div className="space-y-2">
                        <div className="bg-white/80 p-3 rounded-lg text-sm">
                          <span className="text-purple-800">Low website adoption - high opportunity for web development</span>
                        </div>
                        <div className="bg-white/800 p-3 rounded-lg text-sm">
                          <span className="text-purple-800">Below-average ratings - reputation management opportunities</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                    <button
                      onClick={() => window.location.href = '/'}
                      className="bg-white text-purple-700 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <Crown className="w-5 h-5" />
                      Upgrade for Market Analysis
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>

      {/* Website Report Modal */}
      {reportUrl && (
        <WebsiteReportModal
          url={reportUrl}
          userId={currentUser?.id || null}
          onClose={() => setReportUrl(null)}
        />
      )}
    </div>
  );
}
