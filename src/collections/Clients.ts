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
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'street',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'state',
          type: 'text',
        },
        {
          name: 'zipCode',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'United States',
        },
      ],
    },
    {
      name: 'companySize',
      type: 'select',
      options: [
        { label: '1-10 employees', value: '1-10' },
        { label: '11-50 employees', value: '11-50' },
        { label: '51-200 employees', value: '51-200' },
        { label: '201-500 employees', value: '201-500' },
        { label: '500+ employees', value: '500+' },
      ],
      admin: {
        description: 'Number of employees',
      },
    },
    {
      name: 'annualRevenue',
      type: 'select',
      options: [
        { label: 'Under $1M', value: 'under-1m' },
        { label: '$1M - $10M', value: '1m-10m' },
        { label: '$10M - $50M', value: '10m-50m' },
        { label: '$50M - $100M', value: '50m-100m' },
        { label: '$100M+', value: '100m-plus' },
      ],
      admin: {
        description: 'Annual revenue range',
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
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'High Priority', value: 'high-priority' },
        { label: 'VIP', value: 'vip' },
        { label: 'Enterprise', value: 'enterprise' },
        { label: 'Startup', value: 'startup' },
        { label: 'International', value: 'international' },
        { label: 'Local', value: 'local' },
      ],
      admin: {
        description: 'Tags for categorization',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Assigned account manager',
      },
    },
    {
      name: 'hubspotId',
      type: 'text',
      admin: {
        description: 'HubSpot company ID (if imported from HubSpot)',
        readOnly: true,
      },
    },
    {
      name: 'lastContact',
      type: 'date',
      admin: {
        description: 'Date of last contact',
      },
    },
    {
      name: 'nextFollowUp',
      type: 'date',
      admin: {
        description: 'Scheduled follow-up date',
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