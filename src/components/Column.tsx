'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
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

interface ColumnProps {
  id: string;
  title: string;
  items: Lead[];
  children: React.ReactNode;
}

export function Column({ id, title, items, children }: ColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-gray-100/50 rounded-lg p-3 flex flex-col min-h-[200px]"
    >
      <h3 className="font-bold text-gray-800 mb-3 px-1 flex justify-between items-center">
        <span>{title}</span>
        <span className="text-sm font-medium bg-gray-200 text-gray-600 rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </h3>
      <div className="flex-grow space-y-3">
        {children}
      </div>
    </div>
  );
} 