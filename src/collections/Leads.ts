import { CollectionConfig } from 'payload';

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'businessName',
    defaultColumns: ['businessName', 'status', 'leadScore', 'contactedDate'],
    group: 'Management',
  },
  access: {
    create: () => true, // Simplified for now
    read: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'businessName',
      type: 'text',
      required: true,
    },
    {
      name: 'placeId',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'New Lead', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'In Discussion', value: 'discussion' },
        { label: 'Proposal Sent', value: 'proposal' },
        { label: 'Won', value: 'won' },
        { label: 'Lost', value: 'lost' },
      ],
      defaultValue: 'new',
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'leadScore',
      type: 'number',
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'contactedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'owner',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'users' as any,
      required: true,
    },
    {
      name: 'notes',
      type: 'richText',
    },
    {
      name: 'businessData',
      type: 'json',
      label: 'Full Business Data Snapshot',
    },
    {
      name: 'isWatched',
      type: 'checkbox',
      label: 'Watch Lead',
      defaultValue: false,
      admin: {
        description: 'Enable automated monitoring for this lead.',
        position: 'sidebar',
      }
    },
    {
      name: 'lastScanned',
      type: 'date',
      label: 'Last Scanned by Sentinel',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'The last time the Lead Sentinel automatically scanned this lead.'
      }
    }
  ],
}; 