import { CollectionConfig } from 'payload';

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'message',
    defaultColumns: ['message', 'type', 'user', 'isRead', 'createdAt'],
    group: 'Management',
  },
  access: {
    // Access should be locked down to the user who owns the notification
    create: () => true, // Handled by server-side logic
    read: () => true, // ({ req: { user } }) => ({ user: { equals: user.id } }),
    update: () => true, // ({ req: { user } }) => ({ user: { equals: user.id } }),
    delete: () => true, // ({ req: { user } }) => ({ user: { equals: user.id } }),
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'users' as any,
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'lead',
      type: 'relationship',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      relationTo: 'leads' as any,
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Website Down', value: 'website_down' },
        { label: 'Performance Drop', value: 'performance_drop' },
        { label: 'Tech Change', value: 'tech_change' },
        { label: 'SSL Expired', value: 'ssl_expired' },
        { label: 'New Review', value: 'new_review' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'message',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
    },
    {
        name: 'details',
        type: 'json',
        label: 'Notification Details',
        admin: {
            readOnly: true,
            description: 'Stores any relevant data about the event that triggered the notification.'
        }
    }
  ],
  timestamps: true,
}; 