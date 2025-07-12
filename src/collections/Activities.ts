/* eslint-disable @typescript-eslint/no-explicit-any */
import { CollectionConfig } from 'payload';

export const Activities: CollectionConfig = {
  slug: 'activities',
  admin: {
    useAsTitle: 'subject',
    group: 'CRM',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        description: 'Brief description of the activity',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Email', value: 'email' },
        { label: 'Phone Call', value: 'phone-call' },
        { label: 'Meeting', value: 'meeting' },
        { label: 'Demo', value: 'demo' },
        { label: 'Proposal', value: 'proposal' },
        { label: 'Follow-up', value: 'follow-up' },
        { label: 'Note', value: 'note' },
        { label: 'Task', value: 'task' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Type of activity',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed description of the activity',
      },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients' as any,
      admin: {
        description: 'Associated company/client',
      },
    },
    {
      name: 'contact',
      type: 'relationship',
      relationTo: 'contacts' as any,
      admin: {
        description: 'Associated contact (optional)',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        description: 'Date of the activity',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'completed',
      admin: {
        description: 'Status of the activity',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Priority level',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users' as any,
      admin: {
        description: 'Person assigned to this activity',
      },
    },
    {
      name: 'outcome',
      type: 'select',
      options: [
        { label: 'Positive', value: 'positive' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Negative', value: 'negative' },
        { label: 'No Response', value: 'no-response' },
      ],
      admin: {
        description: 'Outcome of the activity',
      },
    },
    {
      name: 'nextAction',
      type: 'text',
      admin: {
        description: 'Next action to take',
      },
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        // Update lastContact on associated client/contact
        if (operation === 'create' && doc.client) {
          const payload = req.payload;
          await payload.update({
            collection: 'clients' as any,
            id: doc.client,
            data: {
              lastContact: doc.date,
            },
          });
        }
        
        if (operation === 'create' && doc.contact) {
          const payload = req.payload;
          await payload.update({
            collection: 'contacts' as any,
            id: doc.contact,
            data: {
              lastContact: doc.date,
            },
          });
        }
      },
    ],
  },
}; 