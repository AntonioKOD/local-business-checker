'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
// Define Lead interface locally since payload types are not available
interface Lead {
  id: string;
  businessName: string;
  status: string;
  leadScore?: number;
  businessData?: Record<string, unknown>;
  contactedDate?: string;
  notes?: string;
  isWatched?: boolean;
  lastScanned?: string;
}
import { SortableItem } from './SortableItem';
import { Column } from './Column';
import LeadDetailModal from './LeadDetailModal';
import { Search, SlidersHorizontal } from 'lucide-react';

// Define the columns for the Kanban board
const initialColumns = {
  'new': { id: 'new', title: 'New Leads', items: [] },
  'contacted': { id: 'contacted', title: 'Contacted', items: [] },
  'discussion': { id: 'discussion', title: 'In Discussion', items: [] },
  'proposal': { id: 'proposal', title: 'Proposal Sent', items: [] },
  'won': { id: 'won', title: 'Won', items: [] },
  'lost': { id: 'lost', title: 'Lost', items: [] },
};

type ColumnData = {
  id: string;
  title: string;
  items: Lead[];
};

const LeadFunnel = () => {
  const [columns, setColumns] = useState<Record<string, ColumnData>>(initialColumns);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // State for filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [minLeadScore, setMinLeadScore] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        // NOTE: This assumes you have an API endpoint to fetch leads.
        // We will need to create this.
        const response = await fetch('/api/leads');
        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }
        const leads: Lead[] = await response.json();

        // Distribute leads into columns based on their status
        const newColumns = { ...initialColumns };
        Object.values(newColumns).forEach(c => c.items = []); // Reset items

        leads.forEach(lead => {
          if (newColumns[lead.status as keyof typeof newColumns]) {
            newColumns[lead.status as keyof typeof newColumns].items.push(lead);
          }
        });

        setColumns(newColumns);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeContainer = active.data.current?.sortable.containerId;
    const overContainer = over.data.current?.sortable.containerId || overId;

    if (activeContainer === overContainer) {
      // Moving within the same column
      setColumns(prev => {
        const activeItems = prev[activeContainer].items;
        const activeIndex = activeItems.findIndex(item => item.id === activeId);
        const overIndex = activeItems.findIndex(item => item.id === overId);
        
        if (activeIndex !== -1 && overIndex !== -1) {
            const newItems = arrayMove(activeItems, activeIndex, overIndex);
            return {
                ...prev,
                [activeContainer]: {
                    ...prev[activeContainer],
                    items: newItems,
                }
            };
        }
        return prev;
      });
    } else {
      // Moving to a different column
      setColumns(prev => {
        const activeItems = prev[activeContainer].items;
        const overItems = prev[overContainer].items;
        const activeIndex = activeItems.findIndex(item => item.id === activeId);
        
        const overIndex = overItems.findIndex(item => item.id === overId);
        // Fallback to end of list if overId is not an item
        const newIndexInOver = overIndex !== -1 ? overIndex : overItems.length;

        const [removed] = activeItems.splice(activeIndex, 1);
        overItems.splice(newIndexInOver, 0, removed);
        
        // Update the status of the moved lead
        const updatedLead = { ...removed, status: overContainer };
        overItems[newIndexInOver] = updatedLead;

        // API call to update lead status
        updateLeadStatus(updatedLead.id, overContainer);

        return {
          ...prev,
          [activeContainer]: {
            ...prev[activeContainer],
            items: [...activeItems],
          },
          [overContainer]: {
            ...prev[overContainer],
            items: [...overItems],
          },
        };
      });
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Failed to update lead status:", error);
      // Here you might want to add error handling, like reverting the UI change
    }
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    // Replace the lead in the correct column
    setColumns(prev => {
      const newColumns = { ...prev };
      const column = newColumns[updatedLead.status];
      if (column) {
        const itemIndex = column.items.findIndex(item => item.id === updatedLead.id);
        if (itemIndex !== -1) {
          column.items[itemIndex] = updatedLead;
        }
      }
      return newColumns;
    });

    // Also update the selectedLead to ensure the modal shows fresh data
    setSelectedLead(updatedLead);
  };

  const filteredColumns = React.useMemo(() => {
    const newColumns = JSON.parse(JSON.stringify(columns));

    for (const columnId in newColumns) {
      newColumns[columnId].items = newColumns[columnId].items.filter((lead: Lead) => {
        const searchMatch = lead.businessName.toLowerCase().includes(searchTerm.toLowerCase());
        const leadScoreMatch = (lead.leadScore || 0) >= minLeadScore;
        return searchMatch && leadScoreMatch;
      });
    }

    return newColumns;
  }, [columns, searchTerm, minLeadScore]);

  if (loading) return <div className="text-center p-8">Loading leads...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
       <h1 className="text-3xl font-bold text-gray-800 mb-6">Lead Funnel</h1>

      {/* Filter and Search Controls */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search by Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g. 'Coffee Shop'"
              />
            </div>
          </div>
          <div>
            <label htmlFor="leadScore" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Lead Score: <span className="font-bold">{minLeadScore}</span>
            </label>
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="h-5 w-5 text-gray-400" />
              <input
                type="range"
                id="leadScore"
                min="0"
                max="100"
                value={minLeadScore}
                onChange={(e) => setMinLeadScore(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {Object.values(columns).map((column) => (
            <Column key={column.id} id={column.id} title={column.title} items={filteredColumns[column.id].items}>
                <SortableContext items={column.items.map(i => i.id)} strategy={rectSortingStrategy}>
                    {filteredColumns[column.id].items.map(lead => (
                      <SortableItem 
                        key={lead.id} 
                        id={lead.id} 
                        lead={lead} 
                        onSelect={() => setSelectedLead(lead)}
                      />
                    ))}
                </SortableContext>
            </Column>
          ))}
        </div>
      </DndContext>
      {selectedLead && (
        <LeadDetailModal 
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  );
};

export default LeadFunnel; 