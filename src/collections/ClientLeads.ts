import { CollectionConfig } from 'payload';

export const ClientLeads: CollectionConfig = {
  slug: 'clientleads',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'source',
      type: 'text',
      required: false,
    },
    {
      name: 'funnelId',
      type: 'text',
      required: false,
    },
    {
      name: 'funnelTitle',
      type: 'text',
      required: false,
    },
    {
      name: 'funnelStep',
      type: 'number',
      required: false,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Contacted', value: 'contacted' },
        { label: 'Qualified', value: 'qualified' },
        { label: 'Converted', value: 'converted' },
        { label: 'Lost', value: 'lost' },
      ],
      defaultValue: 'new',
      required: true,
    },
  ],
}; 