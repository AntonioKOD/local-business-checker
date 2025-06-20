'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Circle, Store, Star, ExternalLink, AlertCircle, CheckCircle, XCircle, Clock, Download, Phone, Globe, DollarSign, Calendar } from 'lucide-react';
import { Business, SearchResults } from '@/lib/business-checker';
import PaymentModal from '@/components/PaymentModal';

export default function Home() {
  const [formData, setFormData] = useState({
    query: '',
    location: '',
    radius: 15000
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);

  // Check for payment status on component mount
  useEffect(() => {
    const paymentStatus = localStorage.getItem('businessCheckerPaid');
    if (paymentStatus === 'true') {
      setHasPaid(true);
    }
  }, []);

  const performSearch = async (searchData: typeof formData, userHasPaid = false) => {
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...searchData, hasPaid: userHasPaid })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred while searching');
    }

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.query.trim() || !formData.location.trim()) {
      setError('Please fill in both business type and location fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await performSearch(formData, hasPaid);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const filterBusinesses = (businesses: Business[], filter: string) => {
    switch (filter) {
      case 'with-website':
        return businesses.filter(b => b.website && b.website !== 'N/A');
      case 'no-website':
        return businesses.filter(b => !b.website || b.website === 'N/A');
      case 'accessible':
        return businesses.filter(b => b.website_status?.accessible);
      case 'not-accessible':
        return businesses.filter(b => b.website && !b.website_status?.accessible);
      default:
        return businesses;
    }
  };

  const getStatusIcon = (business: Business) => {
    if (!business.website || business.website === 'N/A') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (business.website_status?.accessible) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (business.website_status?.status === 'timeout') {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const getStatusText = (business: Business) => {
    if (!business.website || business.website === 'N/A') {
      return 'No Website Found';
    }
    if (business.website_status?.accessible) {
      return 'Website Accessible';
    }
    if (business.website_status?.status === 'timeout') {
      return 'Timeout';
    }
    return 'Not Accessible';
  };

  const filteredBusinesses = results ? filterBusinesses(results.businesses, currentFilter) : [];

  const handlePaymentSuccess = async () => {
    // Store payment status in localStorage
    localStorage.setItem('businessCheckerPaid', 'true');
    setHasPaid(true);
    
    // Re-run the search with full access if we have search data
    if (formData.query && formData.location) {
      setLoading(true);
      try {
        const data = await performSearch(formData, true);
        setResults(data);
      } catch (error) {
        console.error('Error refreshing search after payment:', error);
      } finally {
        setLoading(false);
      }
    }
    
    setShowPaymentModal(false);
  };

  const downloadCSV = () => {
    if (!results || !hasPaid) return;

    const headers = [
      'Business Name',
      'Address',
      'Phone',
      'Website',
      'Website Status',
      'Website Title',
      'Rating',
      'Total Ratings',
      'Price Level',
      'Business Types',
      'Operating Hours',
      'Google Place ID',
      'Website Accessible',
      'HTTP Status Code',
      'Final URL',
      'Error Message'
    ];

    const csvData = results.businesses.map(business => [
      business.name,
      business.address,
      business.phone || 'N/A',
      business.website || 'N/A',
      business.website_status?.status || 'N/A',
      business.website_status?.title || 'N/A',
      business.rating,
      business.total_ratings || 'N/A',
      business.price_level,
      business.types.join('; '),
      business.hours?.join('; ') || 'N/A',
      business.place_id,
      business.website_status?.accessible ? 'Yes' : 'No',
      business.website_status?.status_code || 'N/A',
      business.website_status?.final_url || 'N/A',
      business.website_status?.error || 'N/A'
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `business-search-${formData.query}-${formData.location}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-10 py-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <Search className="w-10 h-10 text-yellow-400" />
            Local Business Website Checker
          </h1>
          <p className="text-xl text-white/90 font-light">
            Find local businesses on Google and check if they have accessible websites
          </p>
        </header>

        {/* Search Form */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <Store className="w-4 h-4 text-blue-600" />
                  Business Type
                </label>
                <input
                  type="text"
                  name="query"
                  value={formData.query}
                  onChange={handleInputChange}
                  placeholder="e.g., restaurants, dentists, hair salons"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-black"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., San Francisco, CA"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-black"
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2">
                  <Circle className="w-4 h-4 text-blue-600" />
                  Search Radius
                </label>
                <select
                  name="radius"
                  value={formData.radius}
                  onChange={handleInputChange}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors bg-white text-black"
                >
                  <option value={2000}>2 km</option>
                  <option value={5000}>5 km</option>
                  <option value={10000}>10 km</option>
                  <option value={15000}>15 km</option>
                  <option value={25000}>25 km</option>
                  <option value={50000}>50 km</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing Businesses...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Businesses
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-3 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8">
            {/* Statistics */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-6">Search Statistics</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{results.statistics.total_businesses}</div>
                  <div className="text-sm opacity-90">Total Businesses</div>
                </div>
                <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{results.statistics.businesses_with_websites}</div>
                  <div className="text-sm opacity-90">Have Websites</div>
                </div>
                <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{results.statistics.accessible_websites}</div>
                  <div className="text-sm opacity-90">Accessible Sites</div>
                </div>
                <div className="text-center bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="text-3xl font-bold">{results.statistics.website_percentage}%</div>
                  <div className="text-sm opacity-90">Website Coverage</div>
                </div>
              </div>
            </div>

            {/* Upgrade Notice */}
            {!hasPaid && results.payment_info.remaining > 0 && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">Upgrade to see all {results.payment_info.total_found} businesses</h3>
                                        <p className="opacity-90">
                       You&apos;re seeing {results.payment_info.showing} of {results.payment_info.total_found} results. 
                       Upgrade for ${results.payment_info.upgrade_price} to see all businesses and download CSV.
                     </p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}

            {/* Business Results Header with Download */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Business Results</h2>
              <div className="flex gap-4 items-center">
                {hasPaid && (
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV
                  </button>
                )}
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'with-website', label: 'With Website' },
                    { key: 'no-website', label: 'No Website' },
                    { key: 'accessible', label: 'Accessible' },
                    { key: 'not-accessible', label: 'Not Accessible' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setCurrentFilter(filter.key)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentFilter === filter.key
                          ? 'bg-white text-blue-600'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Business Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  {/* Business Header */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1 mr-2">{business.name}</h3>
                    {business.rating !== 'N/A' && (
                      <div className="flex items-center gap-1 text-yellow-500 flex-shrink-0">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{business.rating}</span>
                        {business.total_ratings !== 'N/A' && (
                          <span className="text-xs text-gray-500">({business.total_ratings})</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Business Details */}
                  <div className="space-y-3 text-sm mb-4">
                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className="text-black">{business.address}</span>
                    </div>

                    {/* Phone */}
                    {business.phone && business.phone !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span className="text-black">{business.phone}</span>
                      </div>
                    )}

                    {/* Price Level */}
                    {business.price_level !== 'N/A' && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-black">
                          {'$'.repeat(Number(business.price_level) || 1)} Price Level
                        </span>
                      </div>
                    )}

                    {/* Business Types */}
                    {business.types && business.types.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Store className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1">
                          {business.types.slice(0, 3).map((type, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {type.replace(/_/g, ' ').toLowerCase()}
                            </span>
                          ))}
                          {business.types.length > 3 && (
                            <span className="text-xs text-gray-500">+{business.types.length - 3} more</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Operating Hours */}
                    {business.hours && business.hours.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
                        <div className="text-black">
                          <div className="text-xs text-gray-600 mb-1">Hours:</div>
                          <div className="space-y-0.5">
                            {business.hours.slice(0, 2).map((hour, idx) => (
                              <div key={idx} className="text-xs">{hour}</div>
                            ))}
                            {business.hours.length > 2 && (
                              <div className="text-xs text-gray-500">+{business.hours.length - 2} more days</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Website Status and Link */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(business)}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-black">{getStatusText(business)}</span>
                          {business.website_status?.title && (
                            <span className="text-xs text-gray-500 truncate max-w-[150px]">
                              {business.website_status.title}
                            </span>
                          )}
                        </div>
                      </div>

                      {business.website && business.website !== 'N/A' && (
                        <a
                          href={business.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Globe className="w-3 h-3" />
                          Visit
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Additional Website Info for paid users */}
                    {hasPaid && business.website_status && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          {business.website_status.status_code && (
                            <div>Status: {business.website_status.status_code}</div>
                          )}
                          {business.website_status.final_url && business.website_status.final_url !== business.website && (
                            <div className="col-span-2 truncate">
                              Final URL: {business.website_status.final_url}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No businesses found</h3>
                <p className="text-white/80">Try adjusting your search criteria or filter.</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-white/80 mt-16 py-8">
          <p>&copy; 2024 Local Business Website Checker. Built with Next.js and Google Places API.</p>
          <p>
            Developed by{' '}
            <a
              href="https://codewithtoni.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 underline"
            >
              CodeWithToni.com
            </a>
          </p>
        </footer>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          onClose={() => setShowPaymentModal(false)}
          price={2}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
