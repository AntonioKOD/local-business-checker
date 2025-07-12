/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
      name: 'client',
      type: 'relationship',
      relationTo: 'clients' as any,
      required: true,
      admin: {
        description: 'Associated company/client',
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
      name: 'owner',
      type: 'relationship',
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
        if (data.status && data.status === 'active') {
          data.lastContact = new Date().toISOString();
        }
        return data;
      },
    ],
  },
}; 