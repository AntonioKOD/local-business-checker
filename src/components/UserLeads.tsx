'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Calendar, TrendingUp } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  funnelId?: string;
  funnelTitle?: string;
  funnelStep?: number;
  status: string;
  createdAt: string;
}

interface Funnel {
  id: string;
  title: string;
  slug: string;
  owner: string;
}

const UserLeads = ({ currentUser }: { currentUser: { id: string; email: string; firstName: string; lastName: string } | null }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [userFunnels, setUserFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    funnel: '',
    search: '',
  });

  const fetchUserFunnels = useCallback(async () => {
    try {
      const response = await fetch('/api/funnels');
      if (response.ok) {
        const data = await response.json();
        // Filter funnels that belong to the current user
        const userFunnels = data.funnels.filter((funnel: Funnel) => funnel.owner === currentUser?.id);
        setUserFunnels(userFunnels);
      }
    } catch (error) {
      console.error('Error fetching user funnels:', error);
    }
  }, [currentUser?.id]);

  const fetchUserLeads = useCallback(async () => {
    try {
      const response = await fetch('/api/leads');
      if (response.ok) {
        const data = await response.json();
        // Filter leads that come from the user's funnels
        const userFunnelIds = userFunnels.map(funnel => funnel.id);
        const userLeads = data.leads.filter((lead: Lead) => 
          lead.funnelId && userFunnelIds.includes(lead.funnelId)
        );
        setLeads(userLeads);
      }
    } catch (error) {
      console.error('Error fetching user leads:', error);
    } finally {
      setLoading(false);
    }
  }, [userFunnels]);

  useEffect(() => {
    if (currentUser) {
      fetchUserFunnels();
      fetchUserLeads();
    }
  }, [currentUser, fetchUserFunnels, fetchUserLeads]);

  const filteredLeads = leads.filter(lead => {
    if (filter.status && lead.status !== filter.status) return false;
    if (filter.funnel && lead.funnelId !== filter.funnel) return false;
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      return (
        lead.name.toLowerCase().includes(searchTerm) ||
        lead.email.toLowerCase().includes(searchTerm) ||
        (lead.funnelTitle && lead.funnelTitle.toLowerCase().includes(searchTerm))
      );
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-purple-100 text-purple-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-emerald-100 text-emerald-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Leads</h2>
          <p className="text-gray-600">Manage leads from your funnels</p>
        </div>
        <div className="flex items-center space-x-2">
          <div>
            <input
              type="text"
              placeholder="Search leads..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
          <select
            value={filter.funnel}
            onChange={(e) => setFilter({ ...filter, funnel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Funnels</option>
            {userFunnels.map((funnel) => (
              <option key={funnel.id} value={funnel.id}>
                {funnel.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-xl font-semibold text-gray-900">{leads.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-xl font-semibold text-gray-900">
                {leads.filter(lead => {
                  const leadDate = new Date(lead.createdAt);
                  const now = new Date();
                  return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">New Today</p>
              <p className="text-xl font-semibold text-gray-900">
                {leads.filter(lead => {
                  const leadDate = new Date(lead.createdAt);
                  const today = new Date();
                  return leadDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Active Funnels</p>
              <p className="text-xl font-semibold text-gray-900">{userFunnels.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Users className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">No leads found</p>
                      <p className="text-gray-500">
                        {filter.search || filter.status || filter.funnel 
                          ? 'Try adjusting your filters'
                          : 'Leads from your funnels will appear here'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead, index) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lead.funnelTitle || lead.source}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(lead.createdAt)}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserLeads; 