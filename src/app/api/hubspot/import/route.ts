/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server';
import { getPayload } from 'payload';
import config from '@payload-config';

interface HubSpotContact {
  id: string;
  properties: {
    firstname?: string;
    lastname?: string;
    email: string;
    phone?: string;
    jobtitle?: string;
    company?: string;
    industry?: string;
    website?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    company_size?: string;
    annual_revenue?: string;
    lifecycle_stage?: string;
    lead_status?: string;
    createdate?: string;
    lastmodifieddate?: string;
  };
}

interface HubSpotCompany {
  id: string;
  properties: {
    name: string;
    industry?: string;
    website?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    numberofemployees?: string;
    annualrevenue?: string;
    lifecycle_stage?: string;
    createdate?: string;
    lastmodifieddate?: string;
  };
}

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  details: {
    contacts: number;
    companies: number;
    leads: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hubspotApiKey, importType, filters } = body;

    if (!hubspotApiKey) {
      return NextResponse.json(
        { error: 'HubSpot API key is required' },
        { status: 400 }
      );
    }

    const payload = await getPayload({ config });
    const result: ImportResult = {
      success: true,
      imported: 0,
      errors: [],
      details: { contacts: 0, companies: 0, leads: 0 },
    };

    // Import based on type
    if (importType === 'contacts' || importType === 'all') {
      await importContacts(hubspotApiKey, payload, result);
    }

    if (importType === 'companies' || importType === 'all') {
      await importCompanies(hubspotApiKey, payload, result);
    }

    return NextResponse.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error('HubSpot import error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import from HubSpot',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function importContacts(
  apiKey: string, 
  payload: any, 
  result: ImportResult
) {
  try {
    // Fetch contacts from HubSpot
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status}`);
    }

    const data = await response.json();
    const contacts = data.results as HubSpotContact[];

    for (const contact of contacts) {
      try {
        // Check if contact already exists
        const existingContact = await payload.find({
          collection: 'contacts',
          where: {
            hubspotId: {
              equals: contact.id,
            },
          },
        });

        if (existingContact.docs.length > 0) {
          continue; // Skip if already imported
        }

        // Find or create associated company
        let clientId = null;
        if (contact.properties.company) {
          const existingClient = await payload.find({
            collection: 'clients',
            where: {
              companyName: {
                equals: contact.properties.company,
              },
            },
          });

          if (existingClient.docs.length > 0) {
            clientId = existingClient.docs[0].id;
          } else {
            // Create new client
            const newClient = await payload.create({
              collection: 'clients',
              data: {
                companyName: contact.properties.company,
                industry: mapIndustry(contact.properties.industry),
                website: contact.properties.website,
                phone: contact.properties.phone,
                address: {
                  street: contact.properties.address,
                  city: contact.properties.city,
                  state: contact.properties.state,
                  zipCode: contact.properties.zip,
                  country: contact.properties.country || 'United States',
                },
                companySize: mapCompanySize(contact.properties.company_size),
                annualRevenue: mapRevenue(contact.properties.annual_revenue),
                status: mapLifecycleStage(contact.properties.lifecycle_stage),
                source: 'hubspot-import',
                hubspotId: contact.id,
              },
            });
            clientId = newClient.id;
            result.details.companies++;
          }
        }

        // Create contact
        const contactData = {
          fullName: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
          email: contact.properties.email,
          phone: contact.properties.phone,
          title: contact.properties.jobtitle,
          client: clientId,
          isPrimary: true, // Assume primary if no other contacts exist
          role: 'decision-maker',
          status: 'active',
          source: 'hubspot-import',
          hubspotId: contact.id,
          lastContact: contact.properties.lastmodifieddate 
            ? new Date(contact.properties.lastmodifieddate).toISOString()
            : new Date().toISOString(),
        };

        await payload.create({
          collection: 'contacts',
          data: contactData,
        });

        result.imported++;
        result.details.contacts++;

      } catch (error) {
        result.errors.push(`Contact ${contact.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

  } catch (error) {
    result.errors.push(`Contacts import: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function importCompanies(
  apiKey: string, 
  payload: any, 
  result: ImportResult
) {
  try {
    // Fetch companies from HubSpot
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/companies?limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status}`);
    }

    const data = await response.json();
    const companies = data.results as HubSpotCompany[];

    for (const company of companies) {
      try {
        // Check if company already exists
        const existingCompany = await payload.find({
          collection: 'clients',
          where: {
            hubspotId: {
              equals: company.id,
            },
          },
        });

        if (existingCompany.docs.length > 0) {
          continue; // Skip if already imported
        }

        // Create company
        const companyData = {
          companyName: company.properties.name,
          industry: mapIndustry(company.properties.industry),
          website: company.properties.website,
          phone: company.properties.phone,
          address: {
            street: company.properties.address,
            city: company.properties.city,
            state: company.properties.state,
            zipCode: company.properties.zip,
            country: company.properties.country || 'United States',
          },
          companySize: mapCompanySize(company.properties.numberofemployees),
          annualRevenue: mapRevenue(company.properties.annualrevenue),
          status: mapLifecycleStage(company.properties.lifecycle_stage),
          source: 'hubspot-import',
          hubspotId: company.id,
          lastContact: company.properties.lastmodifieddate 
            ? new Date(company.properties.lastmodifieddate).toISOString()
            : new Date().toISOString(),
        };

        await payload.create({
          collection: 'clients',
          data: companyData,
        });

        result.imported++;
        result.details.companies++;

      } catch (error) {
        result.errors.push(`Company ${company.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

  } catch (error) {
    result.errors.push(`Companies import: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper functions to map HubSpot values to our schema
function mapIndustry(hubspotIndustry?: string): string {
  if (!hubspotIndustry) return 'other';
  
  const industryMap: { [key: string]: string } = {
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

  return industryMap[hubspotIndustry.toLowerCase()] || 'other';
}

function mapCompanySize(hubspotSize?: string): string {
  if (!hubspotSize) return '1-10';
  
  const size = parseInt(hubspotSize);
  if (size <= 10) return '1-10';
  if (size <= 50) return '11-50';
  if (size <= 200) return '51-200';
  if (size <= 500) return '201-500';
  return '500+';
}

function mapRevenue(hubspotRevenue?: string): string {
  if (!hubspotRevenue) return 'under-1m';
  
  const revenue = parseInt(hubspotRevenue);
  if (revenue < 1000000) return 'under-1m';
  if (revenue < 10000000) return '1m-10m';
  if (revenue < 50000000) return '10m-50m';
  if (revenue < 100000000) return '50m-100m';
  return '100m-plus';
}

function mapLifecycleStage(hubspotStage?: string): string {
  if (!hubspotStage) return 'prospect';
  
  const stageMap: { [key: string]: string } = {
    'lead': 'lead',
    'opportunity': 'opportunity',
    'customer': 'customer',
    'evangelist': 'customer',
    'subscriber': 'prospect',
    'other': 'prospect',
  };

  return stageMap[hubspotStage.toLowerCase()] || 'prospect';
} 