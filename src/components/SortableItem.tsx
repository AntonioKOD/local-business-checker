'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// Define Lead interface locally since payload types are not available
interface Lead {
  id: string;
  businessName: string;
  status: string;
  leadScore?: number;
  businessData?: Record<string, unknown>;
}
import { GripVertical } from 'lucide-react';

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
          <p className="font-semibold text-gray-900 text-sm">{lead.businessName}</p>
          <p className="text-xs text-gray-500">{lead.businessData?.address || 'Address not available'}</p>
        </div>
        <div {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
          <GripVertical size={16} />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${leadScoreColor}`}>
            Lead Score: {lead.leadScore}
        </span>
      </div>
    </div>
  );
} 