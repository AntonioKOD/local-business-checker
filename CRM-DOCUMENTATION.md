# Client Compass CRM System Documentation

## Overview

The Client Compass CRM system provides a comprehensive solution for managing clients, contacts, activities, and leads. It includes full HubSpot integration for importing and syncing data.

## Features

### 🏢 **Client Management**
- **Company Profiles**: Store detailed company information including industry, size, revenue, and contact details
- **Status Tracking**: Track client lifecycle from prospect to customer
- **Address Management**: Complete address information with street, city, state, zip, and country
- **Tags & Categorization**: Organize clients with custom tags (VIP, Enterprise, Startup, etc.)
- **Notes & Comments**: Internal notes for each client relationship

### 👥 **Contact Management**
- **Individual Contacts**: Manage contacts within companies
- **Role Assignment**: Assign roles (Decision Maker, Influencer, Technical Contact, etc.)
- **Primary Contact**: Mark primary contacts for each company
- **Contact Preferences**: Store preferred contact methods and best times to reach
- **Relationship Tracking**: Link contacts to their companies

### 📊 **Activity Tracking**
- **Activity Types**: Email, Phone Call, Meeting, Demo, Proposal, Follow-up, Note, Task
- **Priority Levels**: Low, Medium, High, Urgent
- **Outcome Tracking**: Positive, Neutral, Negative, No Response
- **Next Actions**: Schedule follow-up activities
- **Attachments**: Support for file attachments
- **Duration Tracking**: Track activity duration in minutes

### 📈 **Lead Management**
- **Lead Scoring**: Advanced lead scoring and qualification
- **Source Tracking**: Track lead sources (Website, Referral, Cold Outreach, etc.)
- **Funnel Integration**: Connect leads to specific funnels
- **Status Management**: New, Contacted, Qualified, Converted, Lost

### 🔄 **HubSpot Integration**
- **Contact Import**: Import contacts from HubSpot with full mapping
- **Company Import**: Import companies with industry and size data
- **Data Mapping**: Automatic mapping of HubSpot fields to CRM fields
- **Duplicate Prevention**: Skip already imported records
- **Error Handling**: Comprehensive error reporting for failed imports

## API Endpoints

### CRM Endpoints

#### Clients
```
GET /api/crm/clients - List all clients
POST /api/crm/clients - Create new client
GET /api/crm/clients/[id] - Get specific client
PUT /api/crm/clients/[id] - Update client
DELETE /api/crm/clients/[id] - Delete client
```

#### Contacts
```
GET /api/crm/contacts - List all contacts
POST /api/crm/contacts - Create new contact
GET /api/crm/contacts/[id] - Get specific contact
PUT /api/crm/contacts/[id] - Update contact
DELETE /api/crm/contacts/[id] - Delete contact
```

#### Activities
```
GET /api/crm/activities - List all activities
POST /api/crm/activities - Create new activity
GET /api/crm/activities/[id] - Get specific activity
PUT /api/crm/activities/[id] - Update activity
DELETE /api/crm/activities/[id] - Delete activity
```

### HubSpot Integration

#### Import from HubSpot
```
POST /api/hubspot/import
{
  "hubspotApiKey": "your-api-key",
  "importType": "all|contacts|companies",
  "filters": {
    "lifecycle_stage": "lead",
    "industry": "technology"
  }
}
```

## Database Schema

### Clients Collection
```typescript
{
  id: string;
  companyName: string;
  industry: 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'real-estate' | 'consulting' | 'marketing' | 'other';
  website?: string;
  phone?: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country: string;
  };
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  annualRevenue: 'under-1m' | '1m-10m' | '10m-50m' | '50m-100m' | '100m-plus';
  status: 'prospect' | 'lead' | 'opportunity' | 'customer' | 'inactive';
  source: 'website' | 'referral' | 'cold-outreach' | 'trade-show' | 'social-media' | 'hubspot-import' | 'other';
  notes?: string;
  tags: string[];
  owner?: string; // User ID
  hubspotId?: string;
  lastContact?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Contacts Collection
```typescript
{
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
  client: string; // Client ID
  isPrimary: boolean;
  role: 'decision-maker' | 'influencer' | 'user' | 'technical' | 'billing' | 'other';
  status: 'active' | 'inactive' | 'unsubscribed';
  source: 'website' | 'referral' | 'cold-outreach' | 'trade-show' | 'social-media' | 'hubspot-import' | 'other';
  notes?: string;
  tags: string[];
  owner?: string; // User ID
  hubspotId?: string;
  lastContact?: string;
  nextFollowUp?: string;
  preferences: {
    preferredContactMethod: 'email' | 'phone' | 'linkedin' | 'in-person';
    timezone?: string;
    bestTimeToContact?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Activities Collection
```typescript
{
  id: string;
  subject: string;
  type: 'email' | 'phone-call' | 'meeting' | 'demo' | 'proposal' | 'follow-up' | 'note' | 'task' | 'other';
  description?: string;
  client?: string; // Client ID
  contact?: string; // Contact ID
  lead?: string; // Lead ID
  date: string;
  duration?: number; // minutes
  status: 'completed' | 'scheduled' | 'in-progress' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string; // User ID
  outcome?: 'positive' | 'neutral' | 'negative' | 'no-response';
  nextAction?: string;
  nextActionDate?: string;
  tags: string[];
  attachments: Array<{
    filename: string;
    url: string;
    type: string;
  }>;
  hubspotActivityId?: string;
  createdAt: string;
  updatedAt: string;
}
```

## HubSpot Integration Details

### Supported Import Types

#### Contacts Import
- **Fields Mapped**:
  - `firstname` + `lastname` → `fullName`
  - `email` → `email`
  - `phone` → `phone`
  - `jobtitle` → `title`
  - `company` → Creates/links to client
  - `industry` → Mapped to industry enum
  - `website` → Client website
  - `address`, `city`, `state`, `zip`, `country` → Client address
  - `company_size` → Mapped to companySize
  - `annual_revenue` → Mapped to annualRevenue
  - `lifecycle_stage` → Mapped to status

#### Companies Import
- **Fields Mapped**:
  - `name` → `companyName`
  - `industry` → Mapped to industry enum
  - `website` → `website`
  - `phone` → `phone`
  - `address`, `city`, `state`, `zip`, `country` → Address object
  - `numberofemployees` → Mapped to companySize
  - `annualrevenue` → Mapped to annualRevenue
  - `lifecycle_stage` → Mapped to status

### Data Mapping Functions

#### Industry Mapping
```typescript
function mapIndustry(hubspotIndustry?: string): string {
  const industryMap = {
    'technology': 'technology',
    'healthcare': 'healthcare',
    'finance': 'finance',
    'education': 'education',
    'retail': 'retail',
    'manufacturing': 'manufacturing',
    'real estate': 'real-estate',
    'consulting': 'consulting',
    'marketing': 'marketing',
  };
  return industryMap[hubspotIndustry?.toLowerCase()] || 'other';
}
```

#### Company Size Mapping
```typescript
function mapCompanySize(hubspotSize?: string): string {
  const size = parseInt(hubspotSize);
  if (size <= 10) return '1-10';
  if (size <= 50) return '11-50';
  if (size <= 200) return '51-200';
  if (size <= 500) return '201-500';
  return '500+';
}
```

#### Revenue Mapping
```typescript
function mapRevenue(hubspotRevenue?: string): string {
  const revenue = parseInt(hubspotRevenue);
  if (revenue < 1000000) return 'under-1m';
  if (revenue < 10000000) return '1m-10m';
  if (revenue < 50000000) return '10m-50m';
  if (revenue < 100000000) return '50m-100m';
  return '100m-plus';
}
```

#### Lifecycle Stage Mapping
```typescript
function mapLifecycleStage(hubspotStage?: string): string {
  const stageMap = {
    'lead': 'lead',
    'opportunity': 'opportunity',
    'customer': 'customer',
    'evangelist': 'customer',
    'subscriber': 'prospect',
    'other': 'prospect',
  };
  return stageMap[hubspotStage?.toLowerCase()] || 'prospect';
}
```

## Usage Examples

### Import from HubSpot
```javascript
// Import all contacts and companies
const response = await fetch('/api/hubspot/import', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    hubspotApiKey: 'your-hubspot-api-key',
    importType: 'all',
  }),
});

const result = await response.json();
console.log(`Imported ${result.result.imported} items`);
```

### Create a New Client
```javascript
const response = await fetch('/api/crm/clients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    companyName: 'Acme Corp',
    industry: 'technology',
    website: 'https://acme.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'United States',
    },
    companySize: '51-200',
    annualRevenue: '10m-50m',
    status: 'prospect',
    source: 'website',
    tags: ['startup', 'high-priority'],
  }),
});
```

### Create a New Contact
```javascript
const response = await fetch('/api/crm/contacts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john.doe@acme.com',
    phone: '+1-555-0124',
    title: 'CEO',
    client: 'client-id-here',
    isPrimary: true,
    role: 'decision-maker',
    status: 'active',
    source: 'website',
    preferences: {
      preferredContactMethod: 'email',
      timezone: 'PST',
      bestTimeToContact: '9 AM - 5 PM',
    },
  }),
});
```

### Create a New Activity
```javascript
const response = await fetch('/api/crm/activities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    subject: 'Initial Sales Call',
    type: 'phone-call',
    description: 'Discussed product features and pricing',
    client: 'client-id-here',
    contact: 'contact-id-here',
    date: new Date().toISOString(),
    duration: 30,
    status: 'completed',
    priority: 'high',
    outcome: 'positive',
    nextAction: 'Send proposal',
    nextActionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['sales'],
  }),
});
```

## Security Considerations

1. **API Key Storage**: HubSpot API keys should be stored securely
2. **Access Control**: Implement proper user authentication and authorization
3. **Data Validation**: All input data should be validated before processing
4. **Error Handling**: Comprehensive error handling to prevent data corruption
5. **Rate Limiting**: Implement rate limiting for API endpoints

## Performance Optimization

1. **Pagination**: All list endpoints support pagination
2. **Filtering**: Support for filtering by various criteria
3. **Caching**: Consider implementing caching for frequently accessed data
4. **Batch Operations**: Support for batch imports and updates
5. **Indexing**: Proper database indexing for optimal query performance

## Future Enhancements

1. **Real-time Sync**: Two-way sync with HubSpot
2. **Advanced Analytics**: Detailed reporting and analytics
3. **Workflow Automation**: Automated follow-up sequences
4. **Email Integration**: Direct email integration
5. **Mobile App**: Native mobile application
6. **API Webhooks**: Webhook support for real-time updates
7. **Multi-tenant**: Support for multiple organizations
8. **Advanced Search**: Full-text search capabilities
9. **Data Export**: Export data to various formats
10. **Integration APIs**: Connect with other CRM systems

## Support

For technical support or questions about the CRM system, please refer to the main application documentation or contact the development team. 