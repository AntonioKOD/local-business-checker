'use client';

import React, { useState, useEffect } from 'react';
import './global.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import ModernNavbar from '@/components/ModernNavbar';
import AuthModal from '@/components/AuthModal';
import PaymentModal from '@/components/PaymentModal';

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; firstName: string; lastName: string; subscriptionStatus?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/verify-token', {
          credentials: 'include', // Include cookies
        });
        
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

    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      localStorage.removeItem('auth-token');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleAuthSuccess = (user: { id: string; email: string; firstName: string; lastName: string }, token: string) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    // Store token in localStorage as backup
    localStorage.setItem('auth-token', token);
  };

  const handlePaymentSuccess = (user: { id: string; email: string; firstName: string; lastName: string }) => {
    setCurrentUser(user);
    setShowPaymentModal(false);
  };

  const handleSignUpClick = () => {
    setShowAuthModal(false);
    setShowPaymentModal(true);
  };

  if (authLoading) {
    return (
      <html lang="en">
        <head>
          <link rel="icon" href="/Client_Compass.png" />
          <link rel="apple-touch-icon" href="/Client_Compass.png" />
          <link rel="icon" type="image/png" href="/Client_Compass.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#2563eb" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
          <GoogleAnalytics gaId="G-E2T6B7DTY4" />
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/Client_Compass.png" />
        <link rel="apple-touch-icon" href="/Client_Compass.png" />
        <link rel="icon" type="image/png" href="/Client_Compass.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="min-h-screen bg-gray-50 text-secondary">
          <ModernNavbar
            currentUser={currentUser}
            onLoginClick={() => setShowAuthModal(true)}
            onUpgradeClick={() => setShowPaymentModal(true)}
            onLogout={handleLogout}
            onCreateFunnel={() => window.location.href = '/funnels'}
          />
          <main>
            {children}
          </main>
        </div>

        {/* Global Modals */}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onAuthSuccess={handleAuthSuccess}
            onSignUpClick={handleSignUpClick}
          />
        )}
        {showPaymentModal && (
          <PaymentModal
            onClose={() => setShowPaymentModal(false)}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        <GoogleAnalytics gaId="G-E2T6B7DTY4" />
      </body>
    </html>
  );
}
