/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Star } from 'lucide-react';
import Image from 'next/image';

interface Block {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'pricing' | 'form' | 'cta' | 'video' | 'gallery' | 'faq' | 'social-proof';
  content: any;
  settings: {
    backgroundColor: string;
    textColor: string;
    padding: number;
    borderRadius: number;
    shadow: string;
    animation: string;
  };
}

interface Funnel {
  id: string;
  title: string;
  description: string;
  slug: string;
  isPublished: boolean;
  blocks: Block[];
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: number;
  };
}

interface LeadData {
  [key: string]: any;
}

export default function FunnelViewer() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadData, setLeadData] = useState<LeadData>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchFunnel = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/funnels/${slug}?bySlug=true`);
      
      if (response.ok) {
        const data = await response.json();
        setFunnel(data.funnel);
      } else {
        setError('Funnel not found');
      }
    } catch (error) {
      console.error('Error fetching funnel:', error);
      setError('Failed to load funnel');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchFunnel();
  }, [fetchFunnel]);

  const handleFormSubmit = async (e: React.FormEvent, formBlock: Block) => {
    e.preventDefault();
    
    if (!funnel) return;

    try {
      setSubmitting(true);
      
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          funnelId: funnel.id,
          funnelSlug: funnel.slug,
          formData: leadData,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setLeadData({});
      } else {
        setError('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  const updateLeadData = (field: string, value: any) => {
    setLeadData(prev => ({ ...prev, [field]: value }));
  };

  const renderBlockContent = (block: Block) => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {block.content.headline}
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {block.content.subheadline}
            </p>
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
              {block.content.ctaText}
            </button>
          </div>
        );

      case 'features':
        return (
          <div>
            <h2 className="text-3xl font-bold text-center mb-12">{block.content.title}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {block.content.features?.map((feature: any, index: number) => (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div>
            <h2 className="text-3xl font-bold text-center mb-12">{block.content.title}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {block.content.testimonials?.map((testimonial: any, index: number) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center mb-4">
                    <Image 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{testimonial.content}</p>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">{block.content.title}</h2>
            <p className="text-center mb-8 text-gray-300">{block.content.subtitle}</p>
            
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-8 bg-green-50 rounded-lg border border-green-200"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-800 mb-2">Thank You!</h3>
                <p className="text-green-700">Your information has been submitted successfully. We&apos;ll be in touch soon!</p>
              </motion.div>
            ) : (
              <form onSubmit={(e) => handleFormSubmit(e, block)} className="space-y-4">
                {block.content.fields?.map((field: any, index: number) => (
                  <div key={index}>
                    <label className="block text-sm font-medium mb-2">
                      {field.label} {field.required && '*'}
                    </label>
                    {field.type === 'select' ? (
                      <select 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
                        value={leadData[field.label] || ''}
                        onChange={(e) => updateLeadData(field.label, e.target.value)}
                        required={field.required}
                      >
                        <option value="">Select an option</option>
                        {field.options?.map((option: string) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
                        placeholder={field.label}
                        value={leadData[field.label] || ''}
                        onChange={(e) => updateLeadData(field.label, e.target.value)}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    block.content.ctaText
                  )}
                </button>
                <p className="text-xs text-gray-400 text-center mt-4">
                  {block.content.privacyText}
                </p>
              </form>
            )}
          </div>
        );

      default:
        return <div className="p-8 text-center">Block content here</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading funnel...</p>
        </div>
      </div>
    );
  }

  if (error || !funnel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Funnel Not Found</h2>
          <p className="text-gray-600">{error || 'The funnel you\'re looking for doesn\'t exist.'}</p>
        </div>
      </div>
    );
  }

  if (!funnel.isPublished) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-600 text-2xl">⚠</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Funnel Not Published</h2>
          <p className="text-gray-600">This funnel is not yet published and cannot be viewed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: funnel.theme.fontFamily }}>
      {/* Apply theme styles */}
      <style jsx global>{`
        :root {
          --primary-color: ${funnel.theme.primaryColor};
          --secondary-color: ${funnel.theme.secondaryColor};
          --border-radius: ${funnel.theme.borderRadius}px;
        }
      `}</style>

      {/* Render blocks */}
      <div className="space-y-0">
        {funnel.blocks.map((block, index) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              backgroundColor: block.settings.backgroundColor,
              color: block.settings.textColor,
              padding: `${block.settings.padding}px`,
              borderRadius: `${block.settings.borderRadius}px`,
              boxShadow: block.settings.shadow
            }}
          >
            {renderBlockContent(block)}
          </motion.div>
        ))}
      </div>
    </div>
  );
} 