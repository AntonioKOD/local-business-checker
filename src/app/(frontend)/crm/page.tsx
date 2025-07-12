'use client';

import React, { useState, useEffect } from 'react';
import CRMDashboard from '@/components/CRMDashboard';

export default function CRMPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; firstName: string; lastName: string; subscriptionStatus?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/verify-token');
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data.user);
        } else {
          // Redirect to home if not authenticated
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/';
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

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

  // If not authenticated, show loading (will redirect)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <CRMDashboard currentUser={currentUser} />
      </div>
    </div>
  );
} 