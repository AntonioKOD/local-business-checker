import { CollectionConfig } from 'payload/types';

export const Funnels: CollectionConfig = {
  slug: 'funnels',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'owner', 'slug', 'isPublished', 'createdAt'],
    group: 'Marketing',
  },
  access: {
    read: ({ req: { user } }) => {
      // Allow public read access for published funnels
      return true;
    },
    create: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return Boolean(user); // Only authenticated users can create funnels
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return {
        owner: { equals: user?.id },
      };
    },
    delete: ({ req: { user } }) => {
      if (user?.role === 'admin') return true;
      return {
        owner: { equals: user?.id },
      };
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Funnel Title',
      admin: {
        description: 'The title of your lead funnel landing page',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'URL Slug',
      admin: {
        description: 'The URL slug for your funnel (e.g., "my-lead-funnel")',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'Brief description of this funnel',
      },
    },
    {
      name: 'blocks',
      type: 'array',
      label: 'Funnel Blocks',
      fields: [
        {
          name: 'id',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Hero', value: 'hero' },
            { label: 'Features', value: 'features' },
            { label: 'Testimonials', value: 'testimonials' },
            { label: 'Pricing', value: 'pricing' },
            { label: 'Form', value: 'form' },
            { label: 'CTA', value: 'cta' },
            { label: 'Video', value: 'video' },
            { label: 'Gallery', value: 'gallery' },
            { label: 'FAQ', value: 'faq' },
            { label: 'Social Proof', value: 'social-proof' },
          ],
        },
        {
          name: 'content',
          type: 'json',
          label: 'Block Content',
        },
        {
          name: 'settings',
          type: 'group',
          label: 'Block Settings',
          fields: [
            {
              name: 'backgroundColor',
              type: 'text',
              label: 'Background Color',
              defaultValue: '#FFFFFF',
            },
            {
              name: 'textColor',
              type: 'text',
              label: 'Text Color',
              defaultValue: '#1F2937',
            },
            {
              name: 'padding',
              type: 'number',
              label: 'Padding (px)',
              defaultValue: 40,
            },
            {
              name: 'borderRadius',
              type: 'number',
              label: 'Border Radius (px)',
              defaultValue: 8,
            },
            {
              name: 'shadow',
              type: 'text',
              label: 'Box Shadow',
              defaultValue: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
            {
              name: 'animation',
              type: 'select',
              label: 'Animation',
              options: [
                { label: 'None', value: 'none' },
                { label: 'Fade In', value: 'fadeIn' },
                { label: 'Fade In Up', value: 'fadeInUp' },
                { label: 'Slide In Up', value: 'slideInUp' },
                { label: 'Slide In Right', value: 'slideInRight' },
                { label: 'Zoom In', value: 'zoomIn' },
              ],
              defaultValue: 'fadeIn',
            },
          ],
        },
      ],
    },
    {
      name: 'theme',
      type: 'group',
      label: 'Theme Settings',
      fields: [
        {
          name: 'primaryColor',
          type: 'text',
          label: 'Primary Color',
          defaultValue: '#3B82F6',
        },
        {
          name: 'secondaryColor',
          type: 'text',
          label: 'Secondary Color',
          defaultValue: '#1F2937',
        },
        {
          name: 'fontFamily',
          type: 'select',
          label: 'Font Family',
          options: [
            { label: 'Inter', value: 'Inter' },
            { label: 'Poppins', value: 'Poppins' },
            { label: 'Roboto', value: 'Roboto' },
            { label: 'Open Sans', value: 'Open Sans' },
          ],
          defaultValue: 'Inter',
        },
        {
          name: 'borderRadius',
          type: 'number',
          label: 'Border Radius',
          defaultValue: 8,
        },
      ],
    },
    {
      name: 'tiptapContent',
      type: 'json',
      label: 'Tiptap Content',
      admin: {
        description: 'The rich text content of your funnel landing page',
        readOnly: true, // This will be managed by the Tiptap editor
      },
    },
    {
      name: 'leadFormFields',
      type: 'array',
      label: 'Lead Form Fields',
      fields: [
        {
          name: 'fieldName',
          type: 'text',
          required: true,
          label: 'Field Name',
        },
        {
          name: 'fieldType',
          type: 'select',
          required: true,
          label: 'Field Type',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' },
            { label: 'Company', value: 'company' },
            { label: 'Select', value: 'select' },
            { label: 'Textarea', value: 'textarea' },
          ],
        },
        {
          name: 'fieldLabel',
          type: 'text',
          required: true,
          label: 'Field Label',
        },
        {
          name: 'isRequired',
          type: 'checkbox',
          label: 'Required Field',
          defaultValue: false,
        },
        {
          name: 'options',
          type: 'array',
              label: 'Options (for select fields)',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'value',
                  type: 'text',
                  required: true,
                },
              ],
              admin: {
                condition: (data, siblingData) => siblingData?.fieldType === 'select',
              },
        },
      ],
      defaultValue: [
        {
          fieldName: 'name',
          fieldType: 'text',
          fieldLabel: 'Full Name',
          isRequired: true,
        },
        {
          fieldName: 'email',
          fieldType: 'email',
          fieldLabel: 'Email Address',
          isRequired: true,
        },
      ],
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      label: 'Published',
      defaultValue: false,
      admin: {
        description: 'Make this funnel publicly accessible',
      },
    },
    {
      name: 'customCSS',
      type: 'textarea',
      label: 'Custom CSS',
      admin: {
        description: 'Custom CSS to style your funnel',
      },
    },
    {
      name: 'analytics',
      type: 'group',
      label: 'Analytics',
      fields: [
        {
          name: 'views',
          type: 'number',
          label: 'Page Views',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'leads',
          type: 'number',
          label: 'Leads Captured',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'conversionRate',
          type: 'number',
          label: 'Conversion Rate (%)',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: false, // Make owner optional since funnels can be created without authentication
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      label: 'Created At',
      admin: {
        readOnly: true,
      },
      defaultValue: () => new Date(),
    },
    {
      name: 'updatedAt',
      type: 'date',
      label: 'Updated At',
      admin: {
        readOnly: true,
      },
      defaultValue: () => new Date(),
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Auto-assign owner if not set
        if (!data.owner && req.user) {
          data.owner = req.user.id;
        }
        
        // Update the updatedAt field
        data.updatedAt = new Date();
        
        return data;
      },
    ],
  },
}; 