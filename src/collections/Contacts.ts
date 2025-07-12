import { CollectionConfig } from 'payload';

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  admin: {
    useAsTitle: 'fullName',
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
      name: 'fullName',
      type: 'text',
      required: true,
      admin: {
        description: 'Full name of the contact',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      admin: {
        description: 'Primary email address',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Phone number',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Job title or position',
      },
    },
    {
      name: 'department',
      type: 'text',
      admin: {
        description: 'Department within the company',
      },
    },
    {
      name: 'client',
      type: 'relationship',
      relationTo: 'clients',
      required: true,
      admin: {
        description: 'Associated company/client',
      },
    },
    {
      name: 'isPrimary',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is this the primary contact for the company?',
      },
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Decision Maker', value: 'decision-maker' },
        { label: 'Influencer', value: 'influencer' },
        { label: 'User', value: 'user' },
        { label: 'Technical Contact', value: 'technical' },
        { label: 'Billing Contact', value: 'billing' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        description: 'Role in the buying process',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Unsubscribed', value: 'unsubscribed' },
      ],
      defaultValue: 'active',
      admin: {
        description: 'Contact status',
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
        description: 'How this contact was acquired',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about the contact',
      },
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Key Contact', value: 'key-contact' },
        { label: 'VIP', value: 'vip' },
        { label: 'Champion', value: 'champion' },
        { label: 'Gatekeeper', value: 'gatekeeper' },
        { label: 'Technical', value: 'technical' },
        { label: 'Executive', value: 'executive' },
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
        description: 'HubSpot contact ID (if imported from HubSpot)',
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
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'preferredContactMethod',
          type: 'select',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'In Person', value: 'in-person' },
          ],
          defaultValue: 'email',
        },
        {
          name: 'timezone',
          type: 'text',
          admin: {
            description: 'Contact timezone (e.g., EST, PST)',
          },
        },
        {
          name: 'bestTimeToContact',
          type: 'text',
          admin: {
            description: 'Best time to reach this contact',
          },
        },
      ],
      admin: {
        description: 'Contact preferences and details',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Update lastContact when status changes
        if (data.status && data.status === 'active') {
          data.lastContact = new Date().toISOString();
        }
        return data;
      },
    ],
  },
}; 