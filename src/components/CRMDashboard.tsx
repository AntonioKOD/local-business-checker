/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Plus,
  Download,
  Upload,
  Activity,
  Target,
} from 'lucide-react';
import CRMModal from './CRMModal';

interface Client {
  id: string;
  companyName: string;
  industry: string;
  status: string;
  lastContact: string;
  website?: string;
  phone?: string;
  notes?: string;
}

interface Contact {
  id: string;
  fullName: string;
  email: string;
  title?: string;
  status: string;
  lastContact: string;
  role: string;
  client: {
    id: string;
    companyName: string;
  };
}

interface Activity {
  id: string;
  subject: string;
  type: string;
  date: string;
  status: string;
  priority: string;
  client: {
    id: string;
    companyName: string;
  };
}

interface CRMStats {
  totalClients: number;
  totalContacts: number;
  totalActivities: number;
  totalLeads: number;
  activeClients: number;
  newThisMonth: number;
  totalRevenue: string;
  conversionRate: number;
}

const CRMDashboard = ({ currentUser }: { currentUser: { id: string; email: string; firstName: string; lastName: string } | null }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [stats, setStats] = useState<CRMStats>({
    totalClients: 0,
    totalContacts: 0,
    totalActivities: 0,
    totalLeads: 0,
    activeClients: 0,
    newThisMonth: 0,
    totalRevenue: '$0',
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'contacts' | 'activities' | 'leads' | 'import'>('overview');
  const [filter, setFilter] = useState({
    status: '',
    industry: '',
    search: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'client' | 'contact'>('client');
  const [modalLoading, setModalLoading] = useState(false);

  const calculateStats = useCallback((leads: any[]) => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const newThisMonth = clients.filter(client => {
      const clientDate = new Date(client.lastContact);
      return clientDate.getMonth() === thisMonth && clientDate.getFullYear() === thisYear;
    }).length;

    const activeClients = clients.filter(client => client.status !== 'inactive').length;
    const customers = clients.filter(client => client.status === 'customer').length;
    const conversionRate = clients.length > 0 ? (customers / clients.length) * 100 : 0;

    setStats({
      totalClients: clients.length,
      totalContacts: contacts.length,
      totalActivities: activities.length,
      totalLeads: leads.length,
      activeClients,
      newThisMonth,
      totalRevenue: '$0', // Would calculate from deals/opportunities
      conversionRate: Math.round(conversionRate),
    });
  }, [clients, contacts, activities]);

  const fetchCRMData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching CRM data for user:', currentUser?.id);
      
      // Fetch all CRM data
      const [clientsRes, contactsRes, activitiesRes, leadsRes] = await Promise.all([
        fetch('/api/crm/clients'),
        fetch('/api/crm/contacts'),
        fetch('/api/crm/activities'),
        fetch(`/api/crm/leads?userId=${currentUser?.id}`),
      ]);

      console.log('CRM API responses:', {
        clients: clientsRes.status,
        contacts: contactsRes.status,
        activities: activitiesRes.status,
        leads: leadsRes.status,
      });

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData.clients || []);
      } else {
        console.error('Failed to fetch clients:', clientsRes.status);
      }

      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        setContacts(contactsData.contacts || []);
      } else {
        console.error('Failed to fetch contacts:', contactsRes.status);
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData.activities || []);
      } else {
        console.error('Failed to fetch activities:', activitiesRes.status);
      }

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setLeads(leadsData.leads || []);
        calculateStats(leadsData.leads || []);
      } else {
        console.error('Failed to fetch leads:', leadsRes.status);
      }

    } catch (error) {
      console.error('Error fetching CRM data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, calculateStats]);

  useEffect(() => {
    if (currentUser?.id) {
      fetchCRMData();
    } else {
      console.log('No current user, skipping CRM data fetch');
      setLoading(false);
    }
  }, [currentUser, fetchCRMData]);

  const handleHubSpotImport = async (apiKey: string, importType: string) => {
    try {
      const response = await fetch('/api/hubspot/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hubspotApiKey: apiKey,
          importType,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Import completed! Imported ${result.result.imported} items.`);
        fetchCRMData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Import failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please try again.');
    }
  };

  const handleAddRecord = (type: 'client' | 'contact') => {
    setModalType(type);
    setShowModal(true);
  };

  const handleSaveRecord = async (data: any) => {
    setModalLoading(true);
    try {
      const endpoint = modalType === 'client' ? '/api/crm/clients' : '/api/crm/contacts';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          owner: currentUser?.id,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        fetchCRMData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Failed to create ${modalType}: ${error.error}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(`Failed to create ${modalType}. Please try again.`);
    } finally {
      setModalLoading(false);
    }
  };

  const handleConvertLead = async (lead: any) => {
    try {
      const response = await fetch('/api/crm/convert-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadId: lead.id,
          userId: currentUser?.id,
        }),
      });

      if (response.ok) {
        alert('Lead converted successfully!');
        fetchCRMData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Failed to convert lead: ${error.error}`);
      }
    } catch (error) {
      console.error('Convert error:', error);
      alert('Failed to convert lead. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'opportunity': return 'bg-purple-100 text-purple-800';
      case 'customer': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'unsubscribed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h2 className="text-2xl font-bold text-gray-900">CRM Dashboard</h2>
          <p className="text-gray-600">Manage your clients, contacts, and activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('import')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import from HubSpot</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'clients', label: 'Clients', icon: Building2 },
          { id: 'contacts', label: 'Contacts', icon: Users },
          { id: 'activities', label: 'Activities', icon: Activity },
          { id: 'leads', label: 'Leads', icon: Target },
          { id: 'import', label: 'Import', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalClients}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalContacts}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Activities</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalActivities}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <Target className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.conversionRate}%</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.subject}</p>
                      <p className="text-sm text-gray-600">{activity.client.companyName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(activity.priority)}`}>
                      {activity.priority}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Clients</h3>
              <div className="flex items-center space-x-2">
                <div>
                  <input
                    type="text"
                    placeholder="Search clients..."
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
                  <option value="prospect">Prospect</option>
                  <option value="lead">Lead</option>
                  <option value="opportunity">Opportunity</option>
                  <option value="customer">Customer</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button 
                  onClick={() => handleAddRecord('client')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Client</span>
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients
                  .filter(client => {
                    const matchesSearch = !filter.search || 
                      client.companyName.toLowerCase().includes(filter.search.toLowerCase()) ||
                      client.industry.toLowerCase().includes(filter.search.toLowerCase());
                    const matchesStatus = !filter.status || client.status === filter.status;
                    return matchesSearch && matchesStatus;
                  })
                  .map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.companyName}</div>
                        {client.website && (
                          <div className="text-sm text-gray-500">{client.website}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.industry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.lastContact ? new Date(client.lastContact).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
              <div className="flex items-center space-x-2">
                <div>
                  <input
                    type="text"
                    placeholder="Search contacts..."
                    value={filter.search}
                    onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button 
                  onClick={() => handleAddRecord('contact')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Contact</span>
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts
                  .filter(contact => {
                    const matchesSearch = !filter.search || 
                      contact.fullName.toLowerCase().includes(filter.search.toLowerCase()) ||
                      contact.email.toLowerCase().includes(filter.search.toLowerCase()) ||
                      contact.client.companyName.toLowerCase().includes(filter.search.toLowerCase());
                    return matchesSearch;
                  })
                  .map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{contact.fullName}</div>
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.client.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.lastContact ? new Date(contact.lastContact).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{activity.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.client.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {activity.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(activity.priority)}`}>
                        {activity.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'leads' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Leads</h3>
                <p className="text-sm text-gray-600">Convert leads from your funnels into clients</p>
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
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lead Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funnel Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Captured
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads
                  .filter(lead => {
                    const matchesSearch = !filter.search || 
                      lead.name?.toLowerCase().includes(filter.search.toLowerCase()) ||
                      lead.email?.toLowerCase().includes(filter.search.toLowerCase()) ||
                      lead.funnelTitle?.toLowerCase().includes(filter.search.toLowerCase()) ||
                      (lead.funnel?.title && lead.funnel.title.toLowerCase().includes(filter.search.toLowerCase()));
                    const matchesStatus = !filter.status || lead.status === filter.status;
                    return matchesSearch && matchesStatus;
                  })
                  .map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        {lead.phone && (
                          <div className="text-xs text-gray-400">{lead.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {lead.funnelTitle || lead.funnel?.title || 'Unknown Funnel'}
                        </div>
                        {lead.funnel && (
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              lead.funnel.isPublished 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {lead.funnel.isPublished ? 'Published' : 'Draft'}
                            </span>
                            {lead.funnel.slug && (
                              <a 
                                href={`/funnel/${lead.funnel.slug}`}
                                target="_blank"
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                View Funnel
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div>{new Date(lead.createdAt).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(lead.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleConvertLead(lead)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Convert to Client
                        </button>
                        {lead.funnelId && (
                          <a 
                            href={`/funnel-builder?id=${lead.funnelId}`}
                            className="text-gray-600 hover:text-gray-800 text-sm"
                          >
                            Edit Funnel
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {leads.filter(lead => {
              const matchesSearch = !filter.search || 
                lead.name?.toLowerCase().includes(filter.search.toLowerCase()) ||
                lead.email?.toLowerCase().includes(filter.search.toLowerCase()) ||
                lead.funnelTitle?.toLowerCase().includes(filter.search.toLowerCase()) ||
                (lead.funnel?.title && lead.funnel.title.toLowerCase().includes(filter.search.toLowerCase()));
              const matchesStatus = !filter.status || lead.status === filter.status;
              return matchesSearch && matchesStatus;
            }).length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Target className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-600">
                  {filter.search || filter.status 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Leads from your funnels will appear here once visitors start submitting forms.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Import from HubSpot</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HubSpot API Key
              </label>
              <input
                type="password"
                id="hubspotApiKey"
                placeholder="Enter your HubSpot API key"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Type
              </label>
              <select
                id="importType"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All (Contacts & Companies)</option>
                <option value="contacts">Contacts Only</option>
                <option value="companies">Companies Only</option>
              </select>
            </div>
            <button
              onClick={() => {
                const apiKey = (document.getElementById('hubspotApiKey') as HTMLInputElement).value;
                const importType = (document.getElementById('importType') as HTMLSelectElement).value;
                if (apiKey) {
                  handleHubSpotImport(apiKey, importType);
                } else {
                  alert('Please enter your HubSpot API key');
                }
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Start Import</span>
            </button>
          </div>
        </div>
      )}

      {/* CRM Modal */}
      {showModal && (
        <CRMModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          type={modalType}
          onSave={handleSaveRecord}
          loading={modalLoading}
        />
      )}
    </div>
  );
};

export default CRMDashboard; 