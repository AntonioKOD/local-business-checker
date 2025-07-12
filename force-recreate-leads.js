const { MongoClient } = require('mongodb');

async function forceRecreateLeads() {
  const uri = process.env.DATABASE_URI || 'mongodb://localhost:27017/client-compass';
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    console.log('Database name:', db.databaseName);
    
    const collections = await db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if leads collection exists
    const leadsCollection = collections.find(c => c.name === 'leads');
    if (leadsCollection) {
      console.log('Found leads collection, dropping it...');
      await db.collection('leads').drop();
      console.log('✅ leads collection dropped successfully');
    } else {
      console.log('leads collection does not exist, will be created by PayloadCMS');
    }
    
    // Also check for any other collections that might have placeId references
    const suspiciousCollections = collections.filter(c => 
      c.name.includes('lead') || c.name.includes('search') || c.name.includes('user')
    );
    
    if (suspiciousCollections.length > 0) {
      console.log('Found potentially related collections:');
      suspiciousCollections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    }
    
    console.log('✅ Database cleanup completed!');
    console.log('Now restart your server and try creating a lead again.');
    console.log('PayloadCMS will recreate the leads collection with the correct schema.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
forceRecreateLeads().catch(console.error); 