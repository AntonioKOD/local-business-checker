'use client';

import React, { useState, useEffect } from 'react';
import CRMDashboard from '@/components/CRMDashboard';

export default function CRMPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Wait for the main layout to finish its authentication check
  useEffect(() => {
    const waitForAuth = async () => {
      try {
        // Wait for the main layout to finish its auth check
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we can get the user from the main layout
        const response = await fetch('/api/auth/verify-token', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          setAuthError('Authentication required');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthError('Network error - please try again');
      } finally {
        setAuthLoading(false);
      }
    };

    waitForAuth();
  }, []);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 text-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show error message instead of redirecting
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 text-secondary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Authentication Required</h2>
            <p className="text-gray-700 mb-4">
              {authError || 'You need to be logged in to access the CRM dashboard.'}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-accent hover:bg-accent/80 text-secondary px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <CRMDashboard />
      </div>
    </div>
  );
} 