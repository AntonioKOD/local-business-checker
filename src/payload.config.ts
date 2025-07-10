import path from 'path'
import { fileURLToPath } from 'url'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { payloadCloud } from '@payloadcms/plugin-cloud'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { slateEditor } from '@payloadcms/richtext-slate'


import { Users } from './collections/Users'
import { Searches } from './collections/Searches'
import { Leads } from './collections/Leads'
import { Notifications } from './collections/Notifications'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  editor: slateEditor({}),
  collections: [Users, Searches, Leads, Notifications],
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.DATABASE_URI as string,
  }),
  sharp,
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
  plugins: [payloadCloud()],
})
