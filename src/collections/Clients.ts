/* eslint-disable @typescript-eslint/no-unused-vars */
import { CollectionConfig } from 'payload';

export const Clients: CollectionConfig = {
  slug: 'clients',
  admin: {
    useAsTitle: 'companyName',
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
      name: 'companyName',
      type: 'text',
      required: true,
      admin: {
        description: 'The name of the company or organization',
      },
    },
    {
      name: 'industry',
      type: 'select',
      options: [
        { label: 'Technology', value: 'technology' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Finance', value: 'finance' },
        { label: 'Education', value: 'education' },
        { label: 'Retail', value: 'retail' },
        { label: 'Manufacturing', value: 'manufacturing' },
        { label: 'Real Estate', value: 'real-estate' },
        { label: 'Consulting', value: 'consulting' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Primary industry of the company',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Company website URL',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Main company phone number',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Prospect', value: 'prospect' },
        { label: 'Lead', value: 'lead' },
        { label: 'Opportunity', value: 'opportunity' },
        { label: 'Customer', value: 'customer' },
        { label: 'Inactive', value: 'inactive' },
      ],
      defaultValue: 'prospect',
      admin: {
        description: 'Current relationship status',
      },
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'Referral', value: 'referral' },
        { label: 'Cold Outreach', value: 'cold-outreach' },
        { label: 'Trade Show', value: 'trade-show' },
        { label: 'Social Media', value: 'social-media' },
        { label: 'HubSpot Import', value: 'hubspot-import' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'How this client was acquired',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about the client',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'users' as any,
      admin: {
        description: 'Assigned account manager',
      },
    },
    {
      name: 'lastContact',
      type: 'date',
      admin: {
        description: 'Date of last contact',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Update lastContact when status changes
        if (data.status && data.status !== 'inactive') {
          data.lastContact = new Date().toISOString();
        }
        return data;
      },
    ],
  },
}; 