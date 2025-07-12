/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Briefcase, Eye, Edit, Trash2, Copy,  Calendar, Globe, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Funnel {
  id: string;
  title: string;
  description: string;
  slug: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  blocks?: any[];
  theme?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: number;
  };
  _count?: {
    leads?: number;
  };
}

export default function FunnelsPage() {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; firstName: string; lastName: string; subscriptionStatus?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingFunnel, setUpdatingFunnel] = useState<string | null>(null);

  const fetchFunnels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/funnels?owner=' + currentUser?.id);
      if (response.ok) {
        const data = await response.json();
        setFunnels(data.funnels || []);
      } else {
        setError('Failed to fetch funnels');
      }
    } catch (error) {
      console.error('Error fetching funnels:', error);
      setError('Failed to fetch funnels');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

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

  // Fetch funnels when user is authenticated
  useEffect(() => {
    if (currentUser) {
      fetchFunnels();
    }
  }, [currentUser, fetchFunnels]);

  const handleDeleteFunnel = async (funnelId: string) => {
    if (!confirm('Are you sure you want to delete this funnel? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/funnels/${funnelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFunnels(prev => prev.filter(funnel => funnel.id !== funnelId));
      } else {
        setError('Failed to delete funnel');
      }
    } catch (error) {
      console.error('Error deleting funnel:', error);
      setError('Failed to delete funnel');
    }
  };

  const handleDuplicateFunnel = async (funnel: Funnel) => {
    try {
      const duplicateData = {
        title: `${funnel.title} (Copy)`,
        description: funnel.description,
        blocks: funnel.blocks,
        theme: funnel.theme,
        isPublished: false,
      };

      const response = await fetch('/api/funnels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateData),
      });

      if (response.ok) {
        const data = await response.json();
        setFunnels(prev => [data.funnel, ...prev]);
      } else {
        setError('Failed to duplicate funnel');
      }
    } catch (error) {
      console.error('Error duplicating funnel:', error);
      setError('Failed to duplicate funnel');
    }
  };

  const handleTogglePublish = async (funnel: Funnel) => {
    try {
      setUpdatingFunnel(funnel.id);
      
      const response = await fetch(`/api/funnels/${funnel.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isPublished: !funnel.isPublished,
        }),
      });

      if (response.ok) {
        setFunnels(prev => prev.map(f => 
          f.id === funnel.id ? { ...f, isPublished: !f.isPublished } : f
        ));
      } else {
        setError('Failed to update funnel');
      }
    } catch (error) {
      console.error('Error updating funnel:', error);
      setError('Failed to update funnel');
    } finally {
      setUpdatingFunnel(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBlockCount = (blocks: any[] = []) => {
    return blocks.length;
  };

  const getFunnelStats = (funnel: Funnel) => {
    const blockCount = getBlockCount(funnel.blocks);
    const hasForm = funnel.blocks?.some((block: any) => block.type === 'form');
    
    return {
      blockCount,
      hasForm,
      leadCount: funnel._count?.leads || 0,
    };
  };

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
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Funnels</h1>
                <p className="text-gray-600">
                  Create and manage high-converting lead capture funnels
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <Link
                  href="/funnel-builder"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Funnel
                </Link>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <p className="text-gray-600">Loading funnels...</p>
              </div>
            </div>
          )}

          {/* Funnels Grid */}
          {!loading && (
            <div className="space-y-6">
              {funnels.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Funnels Yet</h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Create your first lead funnel to start capturing leads and growing your business.
                  </p>
                  <Link
                    href="/funnel-builder"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Funnel
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {funnels.map((funnel) => {
                    const stats = getFunnelStats(funnel);
                    return (
                      <div key={funnel.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                        <div className="p-6">
                          {/* Status Badge */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                funnel.isPublished 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {funnel.isPublished ? (
                                  <span className="flex items-center">
                                    <Globe className="w-3 h-3 mr-1" />
                                    Published
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Draft
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleTogglePublish(funnel)}
                                disabled={updatingFunnel === funnel.id}
                                className={`p-2 rounded-lg transition-colors ${
                                  funnel.isPublished 
                                    ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                }`}
                                title={funnel.isPublished ? 'Unpublish' : 'Publish'}
                              >
                                {updatingFunnel === funnel.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : funnel.isPublished ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Globe className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDuplicateFunnel(funnel)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Duplicate"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteFunnel(funnel.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Funnel Info */}
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                              {funnel.title}
                            </h3>
                            {funnel.description && (
                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                {funnel.description}
                              </p>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                            <div className="bg-gray-50 rounded-lg p-2">
                              <div className="text-lg font-semibold text-gray-900">{stats.blockCount}</div>
                              <div className="text-xs text-gray-500">Blocks</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <div className="text-lg font-semibold text-gray-900">{stats.leadCount}</div>
                              <div className="text-xs text-gray-500">Leads</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-2">
                              <div className="text-lg font-semibold text-gray-900">
                                {stats.hasForm ? (
                                  <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">Form</div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(funnel.createdAt)}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link
                                href={`/funnel/${funnel.slug}`}
                                target="_blank"
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Funnel"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/funnel-builder?id=${funnel.id}`}
                                className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit Funnel"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 