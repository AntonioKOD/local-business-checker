'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, Search, Globe, Target } from 'lucide-react';

interface AnalyticsData {
  totalSearches: number;
  searchesThisMonth: number;
  businessesFound: number;
  websitesAnalyzed: number;
  accessibleWebsites: number;
  searchHistory: Array<{
    date: string;
    searches: number;
    businessesFound: number;
  }>;
  topLocations: Array<{
    location: string;
    searches: number;
    businesses: number;
  }>;
  topQueries: Array<{
    query: string;
    searches: number;
    avgBusinesses: number;
  }>;
  websiteHealth: {
    accessible: number;
    inaccessible: number;
    noWebsite: number;
  };
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  onRefresh?: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, onRefresh }) => {
  // Provide default values to prevent undefined errors
  const safeData = {
    totalSearches: data?.totalSearches || 0,
    searchesThisMonth: data?.searchesThisMonth || 0,
    businessesFound: data?.businessesFound || 0,
    websitesAnalyzed: data?.websitesAnalyzed || 0,
    accessibleWebsites: data?.accessibleWebsites || 0,
    searchHistory: data?.searchHistory || [],
    topLocations: data?.topLocations || [],
    topQueries: data?.topQueries || [],
    websiteHealth: data?.websiteHealth || {
      accessible: 0,
      inaccessible: 0,
      noWebsite: 0,
    },
  };

  const websiteHealthPercentage = {
    accessible: safeData.websitesAnalyzed > 0 ? Math.round((safeData.websiteHealth.accessible / safeData.websitesAnalyzed) * 100) : 0,
    inaccessible: safeData.websitesAnalyzed > 0 ? Math.round((safeData.websiteHealth.inaccessible / safeData.websitesAnalyzed) * 100) : 0,
    noWebsite: safeData.businessesFound > 0 ? Math.round((safeData.websiteHealth.noWebsite / safeData.businessesFound) * 100) : 0,
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Analytics Dashboard</h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            PREMIUM
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Searches</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{safeData.totalSearches.toLocaleString()}</div>
          <p className="text-xs text-blue-600 mt-1">
            {safeData.searchesThisMonth} this month
          </p>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Businesses Found</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{safeData.businessesFound.toLocaleString()}</div>
          <p className="text-xs text-green-600 mt-1">
            Avg {safeData.totalSearches > 0 ? Math.round(safeData.businessesFound / safeData.totalSearches) : 0} per search
          </p>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Websites Analyzed</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{safeData.websitesAnalyzed.toLocaleString()}</div>
          <p className="text-xs text-purple-600 mt-1">
            {websiteHealthPercentage.accessible}% accessible
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Opportunities</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {(safeData.websiteHealth.inaccessible + safeData.websiteHealth.noWebsite).toLocaleString()}
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Potential leads
          </p>
        </div>
      </div>

      {/* Website Health Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Website Health Distribution</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Accessible Websites</span>
                <span className="text-green-600 font-medium">{websiteHealthPercentage.accessible}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${websiteHealthPercentage.accessible}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Website Issues</span>
                <span className="text-yellow-600 font-medium">{websiteHealthPercentage.inaccessible}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${websiteHealthPercentage.inaccessible}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">No Website</span>
                <span className="text-red-600 font-medium">{websiteHealthPercentage.noWebsite}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${websiteHealthPercentage.noWebsite}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-4">Top Search Locations</h4>
          <div className="space-y-3">
            {safeData.topLocations.slice(0, 5).map((location, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900">{location.location}</span>
                  <p className="text-xs text-gray-500">{location.businesses} businesses found</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-blue-600">{location.searches}</span>
                  <p className="text-xs text-gray-500">searches</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Queries */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">Popular Search Queries</h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeData.topQueries.slice(0, 6).map((query, index) => (
            <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900 capitalize">{query.query}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {query.searches} searches
                </span>
              </div>
              <p className="text-xs text-gray-600">
                Avg {query.avgBusinesses} businesses per search
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Search Trend */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Search Activity (Last 30 Days)</h4>
        <div className="flex items-end justify-between h-32 gap-1">
          {safeData.searchHistory.slice(-30).map((day, index) => {
            const maxSearches = safeData.searchHistory.length > 0 ? Math.max(...safeData.searchHistory.map(d => d.searches)) : 1;
            const height = (day.searches / maxSearches) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-blue-500 rounded-t w-full hover:bg-blue-600 transition-colors cursor-pointer"
                  style={{ height: `${height}%` }}
                  title={`${day.date}: ${day.searches} searches, ${day.businessesFound} businesses`}
                ></div>
                <span className="text-xs text-gray-500 mt-1 writing-mode-vertical transform rotate-90">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-6 flex justify-center gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Export Analytics Report
        </button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium">
          Schedule Report
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 