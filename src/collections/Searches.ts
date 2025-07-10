import { CollectionConfig } from 'payload';

export const Searches: CollectionConfig = {
  slug: 'searches',
  admin: {
    useAsTitle: 'query',
    description: 'Track all business searches and analytics',
    defaultColumns: ['query', 'location', 'user', 'searchDate', 'businessesFound'],
  },
  fields: [
    {
      name: 'query',
      type: 'text',
      required: true,
      admin: {
        description: 'The search term used',
      },
    },
    {
      name: 'location',
      type: 'text',
      required: true,
      admin: {
        description: 'The location searched',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'users' as any,
      required: false, // Allow anonymous searches
      admin: {
        description: 'User who performed the search (null for anonymous)',
      },
    },
    {
      name: 'isAnonymous',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this was an anonymous search',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address of the searcher',
      },
    },
    {
      name: 'results',
      type: 'json',
      admin: {
        description: 'Raw search results data',
      },
    },
    {
      name: 'businessesFound',
      type: 'number',
      admin: {
        description: 'Number of businesses found',
      },
    },
    {
      name: 'websitesFound',
      type: 'number',
      admin: {
        description: 'Number of businesses with websites',
      },
    },
    {
      name: 'accessibleWebsites',
      type: 'number',
      admin: {
        description: 'Number of accessible websites',
      },
    },
    {
      name: 'searchDate',
      type: 'date',
      defaultValue: () => new Date(),
      admin: {
        description: 'When the search was performed',
      },
    },
    {
      name: 'searchDuration',
      type: 'number', // in milliseconds
      admin: {
        description: 'How long the search took (milliseconds)',
      },
    }
  ],
}; 