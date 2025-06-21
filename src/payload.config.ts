import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'https://buildquick.io',
  admin: {
    user: 'users',
    importMap: {
      baseDir: import.meta.url,
    },
    meta: {
      titleSuffix: '- BusinessChecker Admin',
    },
  },
  editor: lexicalEditor(),
  cors: [
    'https://buildquick.io',
    'https://www.buildquick.io',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ],
  csrf: [
    'https://buildquick.io',
    'https://www.buildquick.io',
    ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
  ],
  collections: [
    {
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
    },
    {
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
          relationTo: 'users',
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
    },
  ],
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || (() => {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          '🚨 MONGODB_URL environment variable is required in production. ' +
          'Please set MONGODB_URL to your production MongoDB connection string. ' +
          'See MONGODB-SETUP.md for detailed instructions.'
        );
      }
      return 'mongodb://localhost:27017/business-checker';
    })(),
    connectOptions: {
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
    },
  }),
  typescript: {
    outputFile: 'payload-types.ts',
  },
})
