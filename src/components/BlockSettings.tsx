/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { 
  X, 

  Copy,
  Trash2,


} from 'lucide-react';

interface BlockSettingsProps {
  
  block: any;
  onUpdate: (updates: any) => void;
  onClose: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

const BlockSettings: React.FC<BlockSettingsProps> = ({ 
  block, 
  onUpdate, 
  onClose, 
  onDuplicate, 
  onDelete 
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');

  const updateBlock = (updates: any) => {
    onUpdate({ ...block, ...updates });
  };

  const updateContent = (contentUpdates: any) => {
    updateBlock({ content: { ...block.content, ...contentUpdates } });
  };

  const updateSettings = (settingsUpdates: any) => {
    updateBlock({ settings: { ...block.settings, ...settingsUpdates } });
  };

  const renderContentTab = () => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Headline</label>
              <input
                type="text"
                value={block.content.headline || ''}
                onChange={(e) => updateContent({ headline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter your headline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subheadline</label>
              <textarea
                value={block.content.subheadline || ''}
                onChange={(e) => updateContent({ subheadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Enter your subheadline"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Text</label>
              <input
                type="text"
                value={block.content.ctaText || ''}
                onChange={(e) => updateContent({ ctaText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Get Started Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Link</label>
              <input
                type="text"
                value={block.content.ctaLink || ''}
                onChange={(e) => updateContent({ ctaLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#"
              />
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Section Title</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Why Choose Us"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Features</label>
              <div className="space-y-3">
                {block.content.features?.map((feature: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={feature.icon || ''}
                        onChange={(e) => {
                          const newFeatures = [...block.content.features];
                          newFeatures[index] = { ...feature, icon: e.target.value };
                          updateContent({ features: newFeatures });
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                        placeholder="🚀"
                      />
                      <input
                        type="text"
                        value={feature.title || ''}
                        onChange={(e) => {
                          const newFeatures = [...block.content.features];
                          newFeatures[index] = { ...feature, title: e.target.value };
                          updateContent({ features: newFeatures });
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded"
                        placeholder="Feature Title"
                      />
                    </div>
                    <textarea
                      value={feature.description || ''}
                      onChange={(e) => {
                        const newFeatures = [...block.content.features];
                        newFeatures[index] = { ...feature, description: e.target.value };
                        updateContent({ features: newFeatures });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                      rows={2}
                      placeholder="Feature description"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Section Title</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="What Our Clients Say"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Testimonials</label>
              <div className="space-y-3">
                {block.content.testimonials?.map((testimonial: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={testimonial.name || ''}
                        onChange={(e) => {
                          const newTestimonials = [...block.content.testimonials];
                          newTestimonials[index] = { ...testimonial, name: e.target.value };
                          updateContent({ testimonials: newTestimonials });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded"
                        placeholder="Name"
                      />
                      <input
                        type="text"
                        value={testimonial.role || ''}
                        onChange={(e) => {
                          const newTestimonials = [...block.content.testimonials];
                          newTestimonials[index] = { ...testimonial, role: e.target.value };
                          updateContent({ testimonials: newTestimonials });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded"
                        placeholder="Role"
                      />
                    </div>
                    <textarea
                      value={testimonial.content || ''}
                      onChange={(e) => {
                        const newTestimonials = [...block.content.testimonials];
                        newTestimonials[index] = { ...testimonial, content: e.target.value };
                        updateContent({ testimonials: newTestimonials });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      rows={3}
                      placeholder="Testimonial content"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => {
                              const newTestimonials = [...block.content.testimonials];
                              newTestimonials[index] = { ...testimonial, rating: star };
                              updateContent({ testimonials: newTestimonials });
                            }}
                            className={`w-4 h-4 ${star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Form Title</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Get Your Free Strategy Session"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Join 10,000+ businesses that have transformed their results"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Button Text</label>
              <input
                type="text"
                value={block.content.ctaText || ''}
                onChange={(e) => updateContent({ ctaText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Get My Free Session"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Privacy Text</label>
              <input
                type="text"
                value={block.content.privacyText || ''}
                onChange={(e) => updateContent({ privacyText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="We respect your privacy. Unsubscribe at any time."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Form Fields</label>
              <div className="space-y-2">
                {block.content.fields?.map((field: any, index: number) => (
                  <div key={index} className="p-2 border border-gray-200 rounded">
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <select
                        value={field.type || 'text'}
                        onChange={(e) => {
                          const newFields = [...block.content.fields];
                          newFields[index] = { ...field, type: e.target.value };
                          updateContent({ fields: newFields });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="select">Select</option>
                      </select>
                      <input
                        type="text"
                        value={field.label || ''}
                        onChange={(e) => {
                          const newFields = [...block.content.fields];
                          newFields[index] = { ...field, label: e.target.value };
                          updateContent({ fields: newFields });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Field Label"
                      />
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.required || false}
                          onChange={(e) => {
                            const newFields = [...block.content.fields];
                            newFields[index] = { ...field, required: e.target.checked };
                            updateContent({ fields: newFields });
                          }}
                          className="mr-1"
                        />
                        <span className="text-xs">Required</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div className="text-gray-500">No content settings available for this block type.</div>;
    }
  };

  const renderStyleTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Background Color</label>
        <input
          type="color"
          value={block.settings.backgroundColor || '#FFFFFF'}
          onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Text Color</label>
        <input
          type="color"
          value={block.settings.textColor || '#1F2937'}
          onChange={(e) => updateSettings({ textColor: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Padding (px)</label>
        <input
          type="range"
          min="20"
          max="120"
          value={block.settings.padding || 40}
          onChange={(e) => updateSettings({ padding: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">{block.settings.padding || 40}px</div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Border Radius (px)</label>
        <input
          type="range"
          min="0"
          max="24"
          value={block.settings.borderRadius || 8}
          onChange={(e) => updateSettings({ borderRadius: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="text-sm text-gray-500 mt-1">{block.settings.borderRadius || 8}px</div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Shadow</label>
        <select
          value={block.settings.shadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
          onChange={(e) => updateSettings({ shadow: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="none">None</option>
          <option value="0 1px 3px 0 rgba(0, 0, 0, 0.1)">Small</option>
          <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Medium</option>
          <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Large</option>
          <option value="0 20px 25px -5px rgba(0, 0, 0, 0.1)">Extra Large</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Animation</label>
        <select
          value={block.settings.animation || 'fadeIn'}
          onChange={(e) => updateSettings({ animation: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="none">None</option>
          <option value="fadeIn">Fade In</option>
          <option value="fadeInUp">Fade In Up</option>
          <option value="slideInUp">Slide In Up</option>
          <option value="slideInRight">Slide In Right</option>
          <option value="zoomIn">Zoom In</option>
        </select>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Block ID</label>
        <input
          type="text"
          value={block.id}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          readOnly
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Block Type</label>
        <input
          type="text"
          value={block.type}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          readOnly
        />
      </div>
      <div className="pt-4 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={onDuplicate}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Block Settings</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'content' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab('style')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'style' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Style
          </button>
          <button
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'advanced' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'content' && renderContentTab()}
          {activeTab === 'style' && renderStyleTab()}
          {activeTab === 'advanced' && renderAdvancedTab()}
        </div>
      </div>
    </div>
  );
};

export default BlockSettings; 