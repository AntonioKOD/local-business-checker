'use client';

import React, { useState } from 'react';
import { X, Building, Phone, Globe, Star, Users, Briefcase, TrendingUp, Save, Eye } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  businessType?: string;
  currentChallenges?: Array<{ challenge: string }>;
  budget?: string;
  timeline?: string;
  source?: string;
  leadScore: number;
  priority: 'high' | 'medium' | 'low';
  funnelStep?: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal-sent' | 'negotiating' | 'closed-won' | 'closed-lost' | 'unqualified';
  notes?: string;
  submittedAt: string;
  isWatched?: boolean;
  owner?: {
    id: string;
    [key: string]: unknown;
  };
}

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: (updatedLead: Lead) => void;
}

const LeadDetailModal: React.FC<LeadDetailModalProps> = ({ lead, onClose, onUpdate }) => {
  const [notes, setNotes] = useState(lead.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleWatch = async () => {
    // Optimistic update
    const updatedLead = { ...lead, isWatched: !lead.isWatched };
    onUpdate(updatedLead);

    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isWatched: !lead.isWatched }),
      });

      if (!response.ok) {
        // Revert on failure
        onUpdate(lead);
        throw new Error('Failed to update watch status.');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notes.');
      }

      const updatedLead = await response.json();
      onUpdate(updatedLead); // Update the state in the parent component
      // Maybe show a success message briefly
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <header className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{lead.name}</h2>
              <p className="text-sm text-gray-500">{lead.company || 'No company'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Lead Details</h3>
              <div className="flex items-center text-sm"><Building className="w-4 h-4 mr-3 text-gray-500" /><span>{lead.name}</span></div>
              <div className="flex items-center text-sm"><Phone className="w-4 h-4 mr-3 text-gray-500" /><a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone || 'N/A'}</a></div>
              <div className="flex items-center text-sm"><Globe className="w-4 h-4 mr-3 text-gray-500" /><a href={`mailto:${lead.email}`} className="hover:underline truncate">{lead.email}</a></div>
              <div className="flex items-center text-sm">
                <Star className="w-4 h-4 mr-3 text-gray-500" />
                <span>Business Type: {lead.businessType || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-4">
               <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Lead Info</h3>
               <div className="flex items-center text-sm"><TrendingUp className="w-4 h-4 mr-3 text-gray-500" /><span className="font-medium">Lead Score: {lead.leadScore}</span></div>
               <div className="flex items-center text-sm"><Users className="w-4 h-4 mr-3 text-gray-500" /><span className="capitalize">Priority: {lead.priority}</span></div>
               <div className="flex items-center text-sm"><Users className="w-4 h-4 mr-3 text-gray-500" /><span className="capitalize">Status: {lead.status}</span></div>
               <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-sm">
                    <Eye className="w-4 h-4 mr-3 text-gray-500" />
                    <span className="font-medium">Watch Lead</span>
                  </div>
                  <button
                    onClick={handleToggleWatch}
                    className={`${
                      lead.isWatched ? 'bg-blue-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        lead.isWatched ? 'translate-x-5' : 'translate-x-0'
                      } inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
            </div>
          </div>

           {/* Notes Section */}
           <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-40 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Add your notes here..."
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LeadDetailModal; 