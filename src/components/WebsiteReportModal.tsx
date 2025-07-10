'use client';

import React, { useState, useEffect } from 'react';
import { X, Zap, Code, BarChart2, AlertTriangle, Cpu, Download } from 'lucide-react';

interface ReportData {
  technologies: {
    name: string;
    slug: string;
    versions: string[];
    categories: { name: string }[];
  }[];
  performance: {
    performance: number;
    accessibility: number;
    seo: number;
    lcp: string;
    cls: string;
  } | null;
}

interface WebsiteReportModalProps {
  url: string;
  userId: string | null;
  onClose: () => void;
}

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  let color = 'text-green-500';
  if (score < 50) color = 'text-red-500';
  else if (score < 90) color = 'text-yellow-500';

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          className="text-gray-200"
          fill="none"
          strokeWidth="3"
        />
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          className={color}
          fill="none"
          strokeWidth="3"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${color}`}>
        {score}
      </div>
    </div>
  );
};

const WebsiteReportModal: React.FC<WebsiteReportModalProps> = ({ url, userId, onClose }) => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setError('You must be logged in to view reports.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('/api/website-deep-dive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, userId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate report');
        }

        const reportData = await response.json();
        setData(reportData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url, userId]);

  const handleDownload = async () => {
    if (!data) return;
    setIsDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, data, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF.');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `report-${new URL(url).hostname}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      console.error('Download error:', error);
      // You could show a notification to the user here
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="text-blue-500" /> Website Health Report
            </h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-500 break-all">{url}</p>
        </div>

        <div className="p-6">
          {loading && (
            <div className="text-center py-12">
              <Cpu className="w-12 h-12 text-blue-500 mx-auto animate-pulse mb-4" />
              <h4 className="text-lg font-semibold text-gray-800">Analyzing Website...</h4>
              <p className="text-gray-600">This may take a moment. We&apos;re running a deep analysis.</p>
            </div>
          )}
          {error && (
             <div className="text-center py-12 bg-red-50 rounded-lg">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-red-800">Analysis Failed</h4>
              <p className="text-red-700">{error}</p>
            </div>
          )}
          {data && (
            <div className="space-y-8">
              {/* Performance Section */}
              {data.performance && (
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart2 /> Performance & SEO (via Google)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold mb-2">Performance</p>
                      <ScoreCircle score={data.performance.performance} />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold mb-2">Accessibility</p>
                      <ScoreCircle score={data.performance.accessibility} />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold mb-2">SEO</p>
                      <ScoreCircle score={data.performance.seo} />
                    </div>
                  </div>
                   <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-600">Largest Contentful Paint</p>
                      <p className="font-bold text-lg">{data.performance.lcp}</p>
                    </div>
                     <div className="bg-gray-50 rounded-lg p-3">
                      <p className="font-semibold text-gray-600">Cumulative Layout Shift</p>
                      <p className="font-bold text-lg">{data.performance.cls}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Technology Stack */}
              <div>
                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Code /> Technology Stack
                </h4>
                {data.technologies.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {data.technologies.map(tech => (
                      <div key={tech.slug} className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200">
                        {tech.name} {tech.versions.length > 0 && `(${tech.versions[0]})`}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Could not identify specific technologies.</p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {data && (
           <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white/80 backdrop-blur-md">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {isDownloading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download as PDF</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteReportModal; 