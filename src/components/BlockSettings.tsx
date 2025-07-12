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
                placeholder="#contact"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Background Image URL</label>
              <input
                type="text"
                value={block.content.backgroundImage || ''}
                onChange={(e) => updateContent({ backgroundImage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="/api/placeholder/1200/600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Video URL</label>
              <input
                type="text"
                value={block.content.videoUrl || ''}
                onChange={(e) => updateContent({ videoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={block.content.showVideo || false}
                onChange={(e) => updateContent({ showVideo: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Show Video</label>
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
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Everything you need to succeed"
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
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      rows={2}
                      placeholder="Feature description"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={feature.link || ''}
                        onChange={(e) => {
                          const newFeatures = [...block.content.features];
                          newFeatures[index] = { ...feature, link: e.target.value };
                          updateContent({ features: newFeatures });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link URL"
                      />
                      <input
                        type="text"
                        value={feature.linkText || ''}
                        onChange={(e) => {
                          const newFeatures = [...block.content.features];
                          newFeatures[index] = { ...feature, linkText: e.target.value };
                          updateContent({ features: newFeatures });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link Text"
                      />
                    </div>
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
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Real results from real customers"
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
                    <input
                      type="text"
                      value={testimonial.company || ''}
                      onChange={(e) => {
                        const newTestimonials = [...block.content.testimonials];
                        newTestimonials[index] = { ...testimonial, company: e.target.value };
                        updateContent({ testimonials: newTestimonials });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      placeholder="Company"
                    />
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
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={testimonial.link || ''}
                        onChange={(e) => {
                          const newTestimonials = [...block.content.testimonials];
                          newTestimonials[index] = { ...testimonial, link: e.target.value };
                          updateContent({ testimonials: newTestimonials });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link URL"
                      />
                      <input
                        type="text"
                        value={testimonial.linkText || ''}
                        onChange={(e) => {
                          const newTestimonials = [...block.content.testimonials];
                          newTestimonials[index] = { ...testimonial, linkText: e.target.value };
                          updateContent({ testimonials: newTestimonials });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link Text"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
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
              <label className="block text-sm font-medium mb-2">Success Message</label>
              <input
                type="text"
                value={block.content.successMessage || ''}
                onChange={(e) => updateContent({ successMessage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Thank you! We'll be in touch soon."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Redirect URL</label>
              <input
                type="text"
                value={block.content.redirectUrl || ''}
                onChange={(e) => updateContent({ redirectUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="/thank-you"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Form Fields</label>
              <div className="space-y-2">
                {block.content.fields?.map((field: any, index: number) => (
                  <div key={index} className="p-2 border border-gray-200 rounded">
                    <div className="grid grid-cols-2 gap-2 mb-2">
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
                        <option value="textarea">Textarea</option>
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
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => {
                          const newFields = [...block.content.fields];
                          newFields[index] = { ...field, placeholder: e.target.value };
                          updateContent({ fields: newFields });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Placeholder"
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
                    {field.type === 'select' && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Options (comma-separated)</label>
                        <input
                          type="text"
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => {
                            const newFields = [...block.content.fields];
                            newFields[index] = { ...field, options: e.target.value.split(',').map(s => s.trim()) };
                            updateContent({ fields: newFields });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Main Text</label>
              <input
                type="text"
                value={block.content.text || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Ready to take the next step?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Join thousands of successful businesses"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Primary Button Text</label>
              <input
                type="text"
                value={block.content.buttonText || ''}
                onChange={(e) => updateContent({ buttonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Sign Up Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Primary Button Link</label>
              <input
                type="text"
                value={block.content.buttonLink || ''}
                onChange={(e) => updateContent({ buttonLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#signup"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Secondary Button Text</label>
              <input
                type="text"
                value={block.content.secondaryButtonText || ''}
                onChange={(e) => updateContent({ secondaryButtonText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Learn More"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Secondary Button Link</label>
              <input
                type="text"
                value={block.content.secondaryButtonLink || ''}
                onChange={(e) => updateContent({ secondaryButtonLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#about"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Background Image URL</label>
              <input
                type="text"
                value={block.content.backgroundImage || ''}
                onChange={(e) => updateContent({ backgroundImage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="/api/placeholder/800/400"
              />
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Watch Our Story"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="See how we help businesses grow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Video URL</label>
              <input
                type="text"
                value={block.content.videoUrl || ''}
                onChange={(e) => updateContent({ videoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Video Title</label>
              <input
                type="text"
                value={block.content.videoTitle || ''}
                onChange={(e) => updateContent({ videoTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Our Success Story"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={block.content.description || ''}
                onChange={(e) => updateContent({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Learn about our journey and how we can help you achieve similar results."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Text</label>
              <input
                type="text"
                value={block.content.ctaText || ''}
                onChange={(e) => updateContent({ ctaText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Get Started"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Link</label>
              <input
                type="text"
                value={block.content.ctaLink || ''}
                onChange={(e) => updateContent({ ctaLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#contact"
              />
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Our Work"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="See what we've accomplished"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Gallery Items</label>
              <div className="space-y-3">
                {block.content.images?.map((image: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      value={image.src || ''}
                      onChange={(e) => {
                        const newImages = [...block.content.images];
                        newImages[index] = { ...image, src: e.target.value };
                        updateContent({ images: newImages });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      placeholder="Image URL"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={image.title || ''}
                        onChange={(e) => {
                          const newImages = [...block.content.images];
                          newImages[index] = { ...image, title: e.target.value };
                          updateContent({ images: newImages });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Title"
                      />
                      <input
                        type="text"
                        value={image.alt || ''}
                        onChange={(e) => {
                          const newImages = [...block.content.images];
                          newImages[index] = { ...image, alt: e.target.value };
                          updateContent({ images: newImages });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Alt Text"
                      />
                    </div>
                    <textarea
                      value={image.description || ''}
                      onChange={(e) => {
                        const newImages = [...block.content.images];
                        newImages[index] = { ...image, description: e.target.value };
                        updateContent({ images: newImages });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      rows={2}
                      placeholder="Description"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={image.link || ''}
                        onChange={(e) => {
                          const newImages = [...block.content.images];
                          newImages[index] = { ...image, link: e.target.value };
                          updateContent({ images: newImages });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link URL"
                      />
                      <input
                        type="text"
                        value={image.linkText || ''}
                        onChange={(e) => {
                          const newImages = [...block.content.images];
                          newImages[index] = { ...image, linkText: e.target.value };
                          updateContent({ images: newImages });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link Text"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Text</label>
              <input
                type="text"
                value={block.content.ctaText || ''}
                onChange={(e) => updateContent({ ctaText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="View All Projects"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">CTA Link</label>
              <input
                type="text"
                value={block.content.ctaLink || ''}
                onChange={(e) => updateContent({ ctaLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="#portfolio"
              />
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Frequently Asked Questions"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Everything you need to know"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">FAQ Items</label>
              <div className="space-y-3">
                {block.content.faqs?.map((faq: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      value={faq.question || ''}
                      onChange={(e) => {
                        const newFaqs = [...block.content.faqs];
                        newFaqs[index] = { ...faq, question: e.target.value };
                        updateContent({ faqs: newFaqs });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      placeholder="Question"
                    />
                    <textarea
                      value={faq.answer || ''}
                      onChange={(e) => {
                        const newFaqs = [...block.content.faqs];
                        newFaqs[index] = { ...faq, answer: e.target.value };
                        updateContent({ faqs: newFaqs });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      rows={3}
                      placeholder="Answer"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={faq.link || ''}
                        onChange={(e) => {
                          const newFaqs = [...block.content.faqs];
                          newFaqs[index] = { ...faq, link: e.target.value };
                          updateContent({ faqs: newFaqs });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link URL"
                      />
                      <input
                        type="text"
                        value={faq.linkText || ''}
                        onChange={(e) => {
                          const newFaqs = [...block.content.faqs];
                          newFaqs[index] = { ...faq, linkText: e.target.value };
                          updateContent({ faqs: newFaqs });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link Text"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'social-proof':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Trusted by Industry Leaders"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Join thousands of satisfied customers"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Logos</label>
              <div className="space-y-3">
                {block.content.logos?.map((logo: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      value={logo.src || ''}
                      onChange={(e) => {
                        const newLogos = [...block.content.logos];
                        newLogos[index] = { ...logo, src: e.target.value };
                        updateContent({ logos: newLogos });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      placeholder="Logo URL"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={logo.name || ''}
                        onChange={(e) => {
                          const newLogos = [...block.content.logos];
                          newLogos[index] = { ...logo, name: e.target.value };
                          updateContent({ logos: newLogos });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Company Name"
                      />
                      <input
                        type="text"
                        value={logo.alt || ''}
                        onChange={(e) => {
                          const newLogos = [...block.content.logos];
                          newLogos[index] = { ...logo, alt: e.target.value };
                          updateContent({ logos: newLogos });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Alt Text"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={logo.link || ''}
                        onChange={(e) => {
                          const newLogos = [...block.content.logos];
                          newLogos[index] = { ...logo, link: e.target.value };
                          updateContent({ logos: newLogos });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link URL"
                      />
                      <input
                        type="text"
                        value={logo.linkText || ''}
                        onChange={(e) => {
                          const newLogos = [...block.content.logos];
                          newLogos[index] = { ...logo, linkText: e.target.value };
                          updateContent({ logos: newLogos });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link Text"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Statistics</label>
              <div className="space-y-3">
                {block.content.stats?.map((stat: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={stat.number || ''}
                        onChange={(e) => {
                          const newStats = [...block.content.stats];
                          newStats[index] = { ...stat, number: e.target.value };
                          updateContent({ stats: newStats });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Number"
                      />
                      <input
                        type="text"
                        value={stat.label || ''}
                        onChange={(e) => {
                          const newStats = [...block.content.stats];
                          newStats[index] = { ...stat, label: e.target.value };
                          updateContent({ stats: newStats });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Label"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={block.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Choose Your Plan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subtitle</label>
              <input
                type="text"
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Flexible pricing for every business"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pricing Plans</label>
              <div className="space-y-3">
                {block.content.plans?.map((plan: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={plan.name || ''}
                        onChange={(e) => {
                          const newPlans = [...block.content.plans];
                          newPlans[index] = { ...plan, name: e.target.value };
                          updateContent({ plans: newPlans });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded"
                        placeholder="Plan Name"
                      />
                      <input
                        type="text"
                        value={plan.price || ''}
                        onChange={(e) => {
                          const newPlans = [...block.content.plans];
                          newPlans[index] = { ...plan, price: e.target.value };
                          updateContent({ plans: newPlans });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded"
                        placeholder="$9/mo"
                      />
                    </div>
                    <input
                      type="text"
                      value={plan.originalPrice || ''}
                      onChange={(e) => {
                        const newPlans = [...block.content.plans];
                        newPlans[index] = { ...plan, originalPrice: e.target.value };
                        updateContent({ plans: newPlans });
                      }}
                      className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                      placeholder="Original Price (optional)"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        value={plan.cta || ''}
                        onChange={(e) => {
                          const newPlans = [...block.content.plans];
                          newPlans[index] = { ...plan, cta: e.target.value };
                          updateContent({ plans: newPlans });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="CTA Text"
                      />
                      <input
                        type="text"
                        value={plan.link || ''}
                        onChange={(e) => {
                          const newPlans = [...block.content.plans];
                          newPlans[index] = { ...plan, link: e.target.value };
                          updateContent({ plans: newPlans });
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Link URL"
                      />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={plan.popular || false}
                        onChange={(e) => {
                          const newPlans = [...block.content.plans];
                          newPlans[index] = { ...plan, popular: e.target.checked };
                          updateContent({ plans: newPlans });
                        }}
                        className="w-4 h-4"
                      />
                      <label className="text-sm">Most Popular</label>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Features (one per line)</label>
                      <textarea
                        value={plan.features?.join('\n') || ''}
                        onChange={(e) => {
                          const newPlans = [...block.content.plans];
                          newPlans[index] = { ...plan, features: e.target.value.split('\n').filter(f => f.trim()) };
                          updateContent({ plans: newPlans });
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        rows={3}
                        placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Disclaimer</label>
              <input
                type="text"
                value={block.content.disclaimer || ''}
                onChange={(e) => updateContent({ disclaimer: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="All plans include a 30-day money-back guarantee"
              />
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