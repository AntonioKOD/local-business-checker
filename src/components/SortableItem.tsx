'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Define Lead interface locally since payload types are not available
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
  owner?: {
    id: string;
    [key: string]: unknown;
  };
}

interface SortableItemProps {
  id: string;
  lead: Lead;
  onSelect: (lead: Lead) => void;
}

export function SortableItem({ id, lead, onSelect }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  const leadScoreColor = lead.leadScore > 75 ? 'bg-green-100 text-green-800' : lead.leadScore > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(lead)}
      className="bg-white rounded-md shadow-sm p-3 border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-grow">
          <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
          <p className="text-xs text-gray-500">{lead.company || lead.email}</p>
        </div>
        <div {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical size={16} />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${leadScoreColor}`}>
            Lead Score: {lead.leadScore}
        </span>
        <span className="text-xs text-gray-500 capitalize">
          {lead.priority}
        </span>
      </div>
    </div>
  );
} 