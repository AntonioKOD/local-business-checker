import { NextResponse } from 'next/server';
import { getPayload } from 'payload';
import payloadConfig from '@/payload.config';
import { analyzeWebsite } from '@/lib/business-checker';

const payload = await getPayload({ config: payloadConfig });

// This is a simplified version of the scanner. In production, you'd use a cron job.
// We are also simplifying the change detection logic for this example.
export async function GET() {
  // In a real app, you'd protect this endpoint
  console.log('Lead Sentinel scan initiated...');

  try {
    // 1. Fetch all watched leads
    const { docs: watchedLeads } = await payload.find({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      collection: 'leads' as any,
      where: {
        isWatched: {
          equals: true,
        },
      },
      limit: 100, // Process in batches
    });

    console.log(`Found ${watchedLeads.length} watched leads to scan.`);
    let notificationsCreated = 0;

    // 2. Scan each lead
    for (const lead of watchedLeads as Array<Record<string, unknown>>) {
      const oldData = lead.businessData as Record<string, unknown>;
      if (!oldData.website || oldData.website === 'N/A') {
        continue; // Skip if no website
      }

      // 3. Re-run analysis
      const newData = await analyzeWebsite(oldData.website as string);

              // 4. Compare and create notifications
        // Example: Check if website accessibility has changed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (newData.website_status.accessible !== (oldData.website_status as any)?.accessible) {
        notificationsCreated++;
        await payload.create({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          collection: 'notifications' as any,
          data: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            user: typeof lead.owner === 'string' ? lead.owner : (lead.owner as any)?.id,
            lead: lead.id as string,
            type: 'website_down',
            message: `${lead.businessName as string}'s website is now ${newData.website_status.accessible ? 'accessible' : 'inaccessible'}.`,
            details: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              from: (oldData.website_status as any)?.accessible,
              to: newData.website_status.accessible,
            }
          },
        });
      }

              // 5. Update lead with new data and last scanned time
        await payload.update({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          collection: 'leads' as any,
          id: lead.id as string,
        data: {
          businessData: { ...oldData, ...newData },
          lastScanned: new Date().toISOString(),
        },
      });
    }

    const message = `Lead Sentinel scan complete. Scanned ${watchedLeads.length} leads and created ${notificationsCreated} new notifications.`;
    console.log(message);
    return NextResponse.json({ message });

  } catch (error) {
    console.error('Lead Sentinel scan failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: 'Scan failed.', details: errorMessage }, { status: 500 });
  }
} 