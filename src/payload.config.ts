import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  admin: {
    user: 'users',
    importMap: {
      baseDir: import.meta.url,
    },
  },
  editor: lexicalEditor(),
  collections: [
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
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
          },
        },
        {
          name: 'subscriptionId',
          type: 'text',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'subscriptionStartDate',
          type: 'date',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'subscriptionEndDate',
          type: 'date',
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'totalSearches',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      slug: 'searches',
      admin: {
        useAsTitle: 'query',
      },
      fields: [
        {
          name: 'query',
          type: 'text',
          required: true,
        },
        {
          name: 'location',
          type: 'text',
          required: true,
        },
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: false, // Allow anonymous searches
        },
        {
          name: 'isAnonymous',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          name: 'ipAddress',
          type: 'text',
        },
        {
          name: 'results',
          type: 'json',
        },
        {
          name: 'businessesFound',
          type: 'number',
        },
        {
          name: 'websitesFound',
          type: 'number',
        },
        {
          name: 'accessibleWebsites',
          type: 'number',
        },
        {
          name: 'searchDate',
          type: 'date',
          defaultValue: () => new Date(),
        },
        {
          name: 'searchDuration',
          type: 'number', // in milliseconds
        }
      ],
    },
  ],
  db: mongooseAdapter({
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/business-checker',
  }),
  typescript: {
    outputFile: 'payload-types.ts',
  },
})
