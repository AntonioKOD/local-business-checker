import { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'Manage BusinessChecker users and their subscriptions',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'subscriptionStatus',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Past Due', value: 'past_due' },
      ],
      defaultValue: 'active',
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Stripe Customer ID for billing',
      },
    },
    {
      name: 'subscriptionId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Stripe Subscription ID',
      },
    },
    {
      name: 'subscriptionStartDate',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When the subscription started',
      },
    },
    {
      name: 'subscriptionEndDate',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'When the current billing period ends',
      },
    },
    {
      name: 'totalSearches',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Total number of searches performed',
      },
    },
  ],
}; 