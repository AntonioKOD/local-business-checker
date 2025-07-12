'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

const TestFunnelPage = () => {
  const params = useParams();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    console.log('Params:', params);
    console.log('Slug:', params.slug);
    setDebugInfo({
      params: params,
      slug: params.slug,
      timestamp: new Date().toISOString()
    });
  }, [params]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Funnel Debug Page</h1>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
          
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Test Links:</h3>
            <div className="space-y-2">
              <a 
                href="/funnel/test-funnel" 
                className="block text-blue-600 hover:underline"
              >
                /funnel/test-funnel
              </a>
              <a 
                href="/funnel/another-test" 
                className="block text-blue-600 hover:underline"
              >
                /funnel/another-test
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFunnelPage; 