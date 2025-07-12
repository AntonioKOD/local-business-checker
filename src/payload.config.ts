import path from 'path'
import { fileURLToPath } from 'url'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { slateEditor } from '@payloadcms/richtext-slate'

import { Users } from './collections/Users'
import { Searches } from './collections/Searches'
import { Notifications } from './collections/Notifications'
import { Funnels } from './collections/Funnels'
import { ClientLeads } from './collections/ClientLeads'
import { Clients } from './collections/Clients';
import { Contacts } from './collections/Contacts';
import { Activities } from './collections/Activities';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  editor: slateEditor({}),
  collections: [Users, Searches, ClientLeads, Notifications, Funnels, Clients, Contacts, Activities],
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || process.env.MONGODB_URL || 'mongodb://localhost:27017/client-compass',
  }),
  sharp,
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  cors: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ],
  csrf: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ],
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
})
