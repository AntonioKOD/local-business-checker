/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 

  Eye, 
  Settings, 
  
  Star,
 

  Save,
  EyeOff,
  Smartphone,
  Monitor,
  Tablet,
  GripVertical,
  PlusCircle
} from 'lucide-react';
import BlockSettings from './BlockSettings';

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

interface FunnelBuilderProps {
  funnelId?: string;
  initialData?: {
    title: string;
    description: string;
    blocks: Block[];
    theme: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
      borderRadius: number;
    };
  };
}

const blockTypeMeta = [
  { type: 'hero', label: 'Hero', icon: '🦸‍♂️' },
  { type: 'features', label: 'Features', icon: '✨' },
  { type: 'testimonials', label: 'Testimonials', icon: '💬' },
  { type: 'pricing', label: 'Pricing', icon: '💰' },
  { type: 'form', label: 'Form', icon: '📝' },
  { type: 'cta', label: 'Call to Action', icon: '👉' },
  { type: 'video', label: 'Video', icon: '🎥' },
  { type: 'gallery', label: 'Gallery', icon: '🖼️' },
  { type: 'faq', label: 'FAQ', icon: '❓' },
  { type: 'social-proof', label: 'Social Proof', icon: '🌟' },
];

// Sortable Block Component
const SortableBlock = ({ block, index, isSelected, onSelect, onDelete, onUpdate, previewMode, renderBlockContent }: {
  block: Block;
  index: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (updates: any) => void;
  previewMode: boolean;
  renderBlockContent: (block: Block) => React.ReactNode;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <div
        className={`relative border-2 transition-all duration-200 ${
          isSelected 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-transparent hover:border-gray-300'
        } ${isDragging ? 'rotate-2 shadow-xl' : ''}`}
        style={{
          backgroundColor: block.settings.backgroundColor,
          color: block.settings.textColor,
          padding: `${block.settings.padding}px`,
          borderRadius: `${block.settings.borderRadius}px`,
          boxShadow: block.settings.shadow
        }}
      >
        {/* Drag Handle */}
        {!previewMode && (
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1 bg-white rounded shadow-sm hover:bg-gray-50 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="w-4 h-4 text-gray-500" />
          </div>
        )}

        {/* Block Controls */}
        {!previewMode && (
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onSelect(block.id)}
              className="p-1 bg-white rounded shadow-sm hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => onDelete(block.id)}
              className="p-1 bg-red-500 text-white rounded shadow-sm hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Block Content */}
        {renderBlockContent(block)}
      </div>
    </div>
  );
};

const FunnelBuilder: React.FC<FunnelBuilderProps> = ({ funnelId, initialData }) => {
  const router = useRouter();
  const [blocks, setBlocks] = useState<Block[]>(initialData?.blocks || []);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showBlockSettings, setShowBlockSettings] = useState(false);
  const [theme, setTheme] = useState(initialData?.theme || {
    primaryColor: '#3B82F6',
    secondaryColor: '#1F2937',
    fontFamily: 'Inter',
    borderRadius: 8
  });
  const [funnelData, setFunnelData] = useState({
    title: initialData?.title || 'New Funnel',
    description: initialData?.description || 'High-converting sales funnel'
  });

  // Inline editing state
  const [inlineEdit, setInlineEdit] = useState<{ blockId: string; field: string; index?: number } | null>(null);
  const inlineEditRef = useRef<HTMLInputElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const blockTemplates = useMemo(() => ({
    hero: {
      content: {
        headline: 'Transform Your Business',
        subheadline: 'Discover the secret to 10x your conversions with our proven funnel system',
        ctaText: 'Get Started Now',
        ctaLink: '#contact',
        image: '/api/placeholder/600/400',
        backgroundImage: '/api/placeholder/1200/600',
        videoUrl: '',
        showVideo: false
      },
      settings: {
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        padding: 80,
        borderRadius: 12,
        shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        animation: 'fadeInUp'
      }
    },
    features: {
      content: {
        title: 'Why Choose Us',
        subtitle: 'Everything you need to succeed',
        features: [
          { 
            icon: '🚀', 
            title: 'Lightning Fast', 
            description: 'Optimized for speed and performance',
            link: '#',
            linkText: 'Learn More'
          },
          { 
            icon: '🎯', 
            title: 'High Converting', 
            description: 'Proven to increase conversions by 300%',
            link: '#',
            linkText: 'See Results'
          },
          { 
            icon: '💎', 
            title: 'Premium Quality', 
            description: 'Built with the latest technologies',
            link: '#',
            linkText: 'Explore'
          }
        ]
      },
      settings: {
        backgroundColor: '#F8FAFC',
        textColor: '#1F2937',
        padding: 60,
        borderRadius: 12,
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        animation: 'slideInUp'
      }
    },
    testimonials: {
      content: {
        title: 'What Our Clients Say',
        subtitle: 'Real results from real customers',
        testimonials: [
          {
            name: 'Sarah Johnson',
            role: 'CEO, TechStart',
            content: 'This funnel increased our conversions by 400% in just 30 days!',
            rating: 5,
            avatar: '/api/placeholder/60/60',
            company: 'TechStart',
            link: '#',
            linkText: 'Read Full Story'
          },
          {
            name: 'Mike Chen',
            role: 'Marketing Director',
            content: 'The best investment we\'ve made this year. ROI was immediate.',
            rating: 5,
            avatar: '/api/placeholder/60/60',
            company: 'GrowthCorp',
            link: '#',
            linkText: 'View Case Study'
          }
        ]
      },
      settings: {
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        padding: 60,
        borderRadius: 12,
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        animation: 'fadeIn'
      }
    },
    form: {
      content: {
        title: 'Get Your Free Strategy Session',
        subtitle: 'Join 10,000+ businesses that have transformed their results',
        fields: [
          { type: 'text', label: 'Full Name', required: true, placeholder: 'Enter your full name' },
          { type: 'email', label: 'Email Address', required: true, placeholder: 'Enter your email' },
          { type: 'phone', label: 'Phone Number', required: false, placeholder: 'Enter your phone' },
          { type: 'select', label: 'Company Size', options: ['1-10', '11-50', '51-200', '200+'], required: true },
          { type: 'textarea', label: 'Tell us about your goals', required: false, placeholder: 'What are you looking to achieve?' }
        ],
        ctaText: 'Get My Free Session',
        privacyText: 'We respect your privacy. Unsubscribe at any time.',
        successMessage: 'Thank you! We\'ll be in touch soon.',
        redirectUrl: '/thank-you'
      },
      settings: {
        backgroundColor: '#1F2937',
        textColor: '#FFFFFF',
        padding: 60,
        borderRadius: 12,
        shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        animation: 'slideInRight'
      }
    },
    cta: {
      content: {
        text: 'Ready to take the next step?',
        subtitle: 'Join thousands of successful businesses',
        buttonText: 'Sign Up Now',
        buttonLink: '#signup',
        secondaryButtonText: 'Learn More',
        secondaryButtonLink: '#about',
        backgroundImage: '/api/placeholder/800/400'
      },
      settings: {
        backgroundColor: '#2563EB',
        textColor: '#FFFFFF',
        padding: 48,
        borderRadius: 12,
        shadow: '0 10px 15px -3px rgba(37,99,235,0.2)',
        animation: 'bounceIn'
      }
    },
    video: {
      content: {
        title: 'Watch Our Story',
        subtitle: 'See how we help businesses grow',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        videoTitle: 'Our Success Story',
        description: 'Learn about our journey and how we can help you achieve similar results.',
        ctaText: 'Get Started',
        ctaLink: '#contact'
      },
      settings: {
        backgroundColor: '#000000',
        textColor: '#FFFFFF',
        padding: 48,
        borderRadius: 12,
        shadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
        animation: 'fadeIn'
      }
    },
    gallery: {
      content: {
        title: 'Our Work',
        subtitle: 'See what we\'ve accomplished',
        images: [
          { 
            src: '/api/placeholder/300/200', 
            alt: 'Project 1',
            title: 'E-commerce Redesign',
            description: 'Increased conversions by 250%',
            link: '#project1'
          },
          { 
            src: '/api/placeholder/300/200', 
            alt: 'Project 2',
            title: 'SaaS Landing Page',
            description: 'Boosted signups by 400%',
            link: '#project2'
          },
          { 
            src: '/api/placeholder/300/200', 
            alt: 'Project 3',
            title: 'Mobile App Launch',
            description: 'Achieved 10k downloads in first week',
            link: '#project3'
          }
        ],
        ctaText: 'View All Projects',
        ctaLink: '#portfolio'
      },
      settings: {
        backgroundColor: '#F3F4F6',
        textColor: '#1F2937',
        padding: 48,
        borderRadius: 12,
        shadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        animation: 'fadeIn'
      }
    },
    faq: {
      content: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know',
        faqs: [
          { 
            question: 'How does it work?', 
            answer: 'Our system is simple and effective. Just sign up and get started.',
            link: '#learn-more',
            linkText: 'Learn More'
          },
          { 
            question: 'Is there a free trial?', 
            answer: 'Yes, you can try all features for free for 7 days.',
            link: '#trial',
            linkText: 'Start Free Trial'
          },
          {
            question: 'What kind of support do you offer?',
            answer: 'We provide 24/7 customer support via email, chat, and phone.',
            link: '#support',
            linkText: 'Contact Support'
          }
        ]
      },
      settings: {
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        padding: 48,
        borderRadius: 12,
        shadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        animation: 'fadeIn'
      }
    },
    'social-proof': {
      content: {
        title: 'Trusted by Industry Leaders',
        subtitle: 'Join thousands of satisfied customers',
        logos: [
          { 
            src: '/api/placeholder/100/40', 
            alt: 'Company 1',
            name: 'TechCorp',
            link: '#'
          },
          { 
            src: '/api/placeholder/100/40', 
            alt: 'Company 2',
            name: 'InnovateInc',
            link: '#'
          },
          { 
            src: '/api/placeholder/100/40', 
            alt: 'Company 3',
            name: 'GrowthLabs',
            link: '#'
          }
        ],
        stats: [
          { number: '10,000+', label: 'Happy Customers' },
          { number: '500%', label: 'Average ROI' },
          { number: '24/7', label: 'Support Available' }
        ]
      },
      settings: {
        backgroundColor: '#F9FAFB',
        textColor: '#1F2937',
        padding: 32,
        borderRadius: 12,
        shadow: '0 2px 4px -1px rgba(0,0,0,0.05)',
        animation: 'fadeIn'
      }
    },
    pricing: {
      content: {
        title: 'Choose Your Plan',
        subtitle: 'Flexible pricing for every business',
        plans: [
          { 
            name: 'Basic', 
            price: '$9/mo', 
            originalPrice: '$19/mo',
            features: ['Feature 1', 'Feature 2', 'Basic Support'],
            cta: 'Start Basic',
            link: '#basic-plan',
            popular: false
          },
          { 
            name: 'Pro', 
            price: '$29/mo', 
            originalPrice: '$49/mo',
            features: ['Everything in Basic', 'Pro Feature', 'Priority Support'],
            cta: 'Go Pro',
            link: '#pro-plan',
            popular: true
          }
        ],
        disclaimer: 'All plans include a 30-day money-back guarantee'
      },
      settings: {
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        padding: 48,
        borderRadius: 12,
        shadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        animation: 'fadeIn'
      }
    },
  }), []);

  const addBlock = useCallback((type: string) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: type as any,
      content: blockTemplates[type as keyof typeof blockTemplates]?.content || {},
      settings: blockTemplates[type as keyof typeof blockTemplates]?.settings || {
        backgroundColor: '#FFFFFF',
        textColor: '#1F2937',
        padding: 40,
        borderRadius: 8,
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        animation: 'fadeIn'
      }
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlock(newBlock.id);
  }, [blockTemplates]);

  const updateBlock = useCallback((updates: Partial<Block>) => {
    if (!selectedBlock) return;
    setBlocks(prev => prev.map(block => 
      block.id === selectedBlock ? { ...block, ...updates } : block
    ));
  }, [selectedBlock]);

  const deleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    if (selectedBlock === blockId) {
      setSelectedBlock(null);
      setShowBlockSettings(false);
    }
  }, [selectedBlock]);

  const duplicateBlock = useCallback((blockId: string) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (blockToDuplicate) {
      const newBlock: Block = {
        ...blockToDuplicate,
        id: `block-${Date.now()}`,
      };
      setBlocks(prev => [...prev, newBlock]);
    }
  }, [blocks]);

  const handleBlockSelect = useCallback((blockId: string) => {
    setSelectedBlock(blockId);
    setShowBlockSettings(true);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  type InlineEditValue = string | { [key: string]: any };
  const handleInlineEdit = (blockId: string, field: string, value: InlineEditValue, index?: number) => {
    setBlocks(prev => prev.map(block => {
      if (block.id !== blockId) return block;
      if (typeof index === 'number' && Array.isArray(block.content[field])) {
        // Editing an item in an array (features, testimonials)
        const arr = [...block.content[field]];
        if (typeof value === 'object' && value !== null) {
          arr[index] = { ...arr[index], ...value };
        } else {
          // If value is a string, assign to a default property (e.g., 'value')
          arr[index] = { ...arr[index], value };
        }
        return { ...block, content: { ...block.content, [field]: arr } };
      } else {
        return { ...block, content: { ...block.content, [field]: value } };
      }
    }));
    setInlineEdit(null);
  };

  const renderBlockContent = (block: Block) => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="text-center">
            {/* Headline Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'headline' ? (
              <input
                ref={inlineEditRef}
                type="text"
                className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center w-full outline-none"
                value={block.content.headline}
                onChange={e => handleInlineEdit(block.id, 'headline', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h1
                className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'headline' })}
              >
                {block.content.headline}
              </h1>
            )}

            {/* Subheadline Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subheadline' ? (
              <textarea
                ref={inlineEditRef as any}
                className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto w-full outline-none"
                value={block.content.subheadline}
                onChange={e => handleInlineEdit(block.id, 'subheadline', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subheadline' })}
              >
                {block.content.subheadline}
              </p>
            )}

            {/* CTA Text Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'ctaText' ? (
              <input
                ref={inlineEditRef}
                type="text"
                className="bg-accent text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent/80 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 text-center w-full outline-none"
                value={block.content.ctaText}
                onChange={e => handleInlineEdit(block.id, 'ctaText', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <button
                className="bg-accent text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent/80 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'ctaText' })}
                type="button"
              >
                {block.content.ctaText}
              </button>
            )}
          </div>
        );

      case 'features':
        return (
          <div>
            {/* Section Title Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'title' ? (
              <input
                type="text"
                className="text-3xl font-bold text-center mb-12 w-full outline-none"
                value={block.content.title}
                onChange={e => handleInlineEdit(block.id, 'title', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-3xl font-bold text-center mb-12 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'title' })}
              >
                {block.content.title}
              </h2>
            )}
            {/* Subtitle Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subtitle' ? (
              <input
                type="text"
                className="text-center mb-8 w-full outline-none"
                value={block.content.subtitle}
                onChange={e => handleInlineEdit(block.id, 'subtitle', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-center mb-8 text-gray-700 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subtitle' })}
              >
                {block.content.subtitle}
              </p>
            )}
            <div className="grid md:grid-cols-3 gap-8">
              {block.content.features?.map((feature: any, index: number) => (
                <div key={index} className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  {/* Feature Icon (static for now) */}
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  {/* Feature Title Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'features-title' && inlineEdit.index === index ? (
                    <input
                      type="text"
                      className="text-xl font-semibold mb-2 w-full outline-none"
                      value={feature.title}
                      onChange={e => handleInlineEdit(block.id, 'features', { title: e.target.value }, index)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <h3
                      className="text-xl font-semibold mb-2 cursor-pointer"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'features-title', index })}
                    >
                      {feature.title}
                    </h3>
                  )}
                  {/* Feature Description Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'features-description' && inlineEdit.index === index ? (
                    <textarea
                      className="text-gray-600 w-full outline-none"
                      value={feature.description}
                      onChange={e => handleInlineEdit(block.id, 'features', { description: e.target.value }, index)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-gray-600 cursor-pointer"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'features-description', index })}
                    >
                      {feature.description}
                    </p>
                  )}
                  {/* Feature Link Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'features-link' && inlineEdit.index === index ? (
                    <input
                      type="text"
                      className="text-sm text-blue-600 underline cursor-pointer"
                      value={feature.link}
                      onChange={e => handleInlineEdit(block.id, 'features', { link: e.target.value }, index)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <a
                      href={feature.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline hover:text-blue-800 cursor-pointer"
                      onClick={e => { e.stopPropagation(); setInlineEdit({ blockId: block.id, field: 'features-link', index }); }}
                    >
                      {feature.linkText}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div>
            {/* Section Title Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'title' ? (
              <input
                type="text"
                className="text-3xl font-bold text-center mb-12 w-full outline-none"
                value={block.content.title}
                onChange={e => handleInlineEdit(block.id, 'title', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-3xl font-bold text-center mb-12 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'title' })}
              >
                {block.content.title}
              </h2>
            )}
            {/* Subtitle Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subtitle' ? (
              <input
                type="text"
                className="text-center mb-8 w-full outline-none"
                value={block.content.subtitle}
                onChange={e => handleInlineEdit(block.id, 'subtitle', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-center mb-8 text-gray-700 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subtitle' })}
              >
                {block.content.subtitle}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-8">
              {block.content.testimonials?.map((testimonial: any, index: number) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                  {/* Name Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'testimonials-name' && inlineEdit.index === index ? (
                    <input
                      type="text"
                      className="font-semibold w-full outline-none"
                      value={testimonial.name}
                      onChange={e => handleInlineEdit(block.id, 'testimonials', { name: e.target.value }, index)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <h4
                      className="font-semibold cursor-pointer"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'testimonials-name', index })}
                    >
                      {testimonial.name}
                    </h4>
                  )}
                  {/* Role Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'testimonials-role' && inlineEdit.index === index ? (
                    <input
                      type="text"
                      className="text-sm text-gray-600 w-full outline-none"
                      value={testimonial.role}
                      onChange={e => handleInlineEdit(block.id, 'testimonials', { role: e.target.value }, index)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-sm text-gray-600 cursor-pointer"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'testimonials-role', index })}
                    >
                      {testimonial.role}
                    </p>
                  )}
                  {/* Company Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'testimonials-company' && inlineEdit.index === index ? (
                    <input
                      type="text"
                      className="text-sm text-gray-500 w-full outline-none"
                      value={testimonial.company}
                      onChange={e => handleInlineEdit(block.id, 'testimonials', { company: e.target.value }, index)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-sm text-gray-500 cursor-pointer"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'testimonials-company', index })}
                    >
                      {testimonial.company}
                    </p>
                  )}
                  {/* Content Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'testimonials-content' && inlineEdit.index === index ? (
                    <textarea
                      className="text-gray-700 w-full outline-none mb-3"
                      value={testimonial.content}
                      onChange={e => handleInlineEdit(block.id, 'testimonials', { content: e.target.value }, index)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-gray-700 mb-3 cursor-pointer"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'testimonials-content', index })}
                    >
                      {testimonial.content}
                    </p>
                  )}
                  {/* Link Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'testimonials-link' && inlineEdit.index === index ? (
                    <input
                      type="text"
                      className="text-sm text-blue-600 underline w-full outline-none"
                      value={testimonial.link}
                      onChange={e => handleInlineEdit(block.id, 'testimonials', { link: e.target.value }, index)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <a
                      href={testimonial.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline hover:text-blue-800 cursor-pointer"
                      onClick={e => { e.stopPropagation(); setInlineEdit({ blockId: block.id, field: 'testimonials-link', index }); }}
                    >
                      {testimonial.linkText}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'form':
        return (
          <div className="max-w-md mx-auto">
            {/* Title Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'title' ? (
              <input
                type="text"
                className="text-3xl font-bold text-center mb-4 w-full outline-none"
                value={block.content.title}
                onChange={e => handleInlineEdit(block.id, 'title', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-3xl font-bold text-center mb-4 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'title' })}
              >
                {block.content.title}
              </h2>
            )}
            {/* Subtitle Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subtitle' ? (
              <input
                type="text"
                className="text-center mb-8 w-full outline-none"
                value={block.content.subtitle}
                onChange={e => handleInlineEdit(block.id, 'subtitle', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-center mb-8 text-gray-700 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subtitle' })}
              >
                {block.content.subtitle}
              </p>
            )}
            <form className="space-y-4">
              {block.content.fields?.map((field: any, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'select' ? (
                    <select className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900">
                      {field.options?.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
                      placeholder={field.placeholder}
                      required={field.required}
                      rows={4}
                    />
                  ) : (
                    <input
                      type={field.type}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              {/* CTA Text Inline Edit */}
              {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'ctaText' ? (
                <input
                  type="text"
                  className="w-full bg-accent text-white py-3 rounded-lg font-semibold text-center outline-none"
                  value={block.content.ctaText}
                  onChange={e => handleInlineEdit(block.id, 'ctaText', e.target.value)}
                  onBlur={() => setInlineEdit(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/80 transition-colors"
                  onClick={() => setInlineEdit({ blockId: block.id, field: 'ctaText' })}
                >
                  {block.content.ctaText}
                </button>
              )}
              {/* Privacy Text Inline Edit */}
              {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'privacyText' ? (
                <input
                  type="text"
                  className="text-xs text-gray-400 text-center mt-4 w-full outline-none"
                  value={block.content.privacyText}
                  onChange={e => handleInlineEdit(block.id, 'privacyText', e.target.value)}
                  onBlur={() => setInlineEdit(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                  autoFocus
                />
              ) : (
                <p
                  className="text-xs text-gray-400 text-center mt-4 cursor-pointer"
                  onClick={() => setInlineEdit({ blockId: block.id, field: 'privacyText' })}
                >
                  {block.content.privacyText}
                </p>
              )}
            </form>
          </div>
        );

      case 'pricing':
        return (
          <div>
            {/* Title Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'title' ? (
              <input
                type="text"
                className="text-3xl font-bold text-center mb-4 w-full outline-none"
                value={block.content.title}
                onChange={e => handleInlineEdit(block.id, 'title', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-3xl font-bold text-center mb-4 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'title' })}
              >
                {block.content.title}
              </h2>
            )}
            {/* Subtitle Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subtitle' ? (
              <input
                type="text"
                className="text-center mb-8 w-full outline-none"
                value={block.content.subtitle}
                onChange={e => handleInlineEdit(block.id, 'subtitle', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-center mb-8 text-gray-700 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subtitle' })}
              >
                {block.content.subtitle}
              </p>
            )}
            <div className="grid grid-cols-2 gap-6">
              {block.content.plans?.map((plan: any, idx: number) => (
                <div key={idx} className={`bg-white rounded-lg shadow p-6 text-center ${plan.popular ? 'ring-2 ring-accent' : ''}`}>
                  {plan.popular && (
                    <div className="bg-accent text-white text-xs px-3 py-1 rounded-full mb-4 inline-block">
                      Most Popular
                    </div>
                  )}
                  {/* Plan Name Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'pricing-plan-name' && inlineEdit.index === idx ? (
                    <input
                      type="text"
                      className="text-xl font-semibold mb-2 w-full outline-none"
                      value={plan.name}
                      onChange={e => handleInlineEdit(block.id, 'pricing', { name: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="text-xl font-semibold mb-2 cursor-pointer"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'pricing-plan-name', index: idx })}
                    >
                      {plan.name}
                    </div>
                  )}
                  {/* Plan Price Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'pricing-plan-price' && inlineEdit.index === idx ? (
                    <input
                      type="text"
                      className="text-3xl font-bold mb-4 w-full outline-none"
                      value={plan.price}
                      onChange={e => handleInlineEdit(block.id, 'pricing', { price: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="text-3xl font-bold mb-4 cursor-pointer"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'pricing-plan-price', index: idx })}
                    >
                      {plan.price}
                    </div>
                  )}
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-500 line-through mb-4">{plan.originalPrice}</div>
                  )}
                  <ul className="mb-4 space-y-1">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="text-gray-700">• {f}</li>
                    ))}
                  </ul>
                  {/* Plan CTA Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'pricing-plan-cta' && inlineEdit.index === idx ? (
                    <input
                      type="text"
                      className="w-full bg-accent text-white py-2 rounded-lg font-semibold text-center outline-none"
                      value={plan.cta}
                      onChange={e => handleInlineEdit(block.id, 'pricing', { cta: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      className="w-full bg-accent text-white py-2 rounded-lg font-semibold hover:bg-accent/80 transition"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'pricing-plan-cta', index: idx })}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* Disclaimer Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'disclaimer' ? (
              <input
                type="text"
                className="text-xs text-gray-500 text-center mt-4 w-full outline-none"
                value={block.content.disclaimer}
                onChange={e => handleInlineEdit(block.id, 'disclaimer', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-xs text-gray-500 text-center mt-4 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'disclaimer' })}
              >
                {block.content.disclaimer}
              </p>
            )}
          </div>
        );

      case 'cta':
        return (
          <div className="text-center">
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'text' ? (
              <input
                type="text"
                className="text-2xl font-bold mb-4 w-full outline-none"
                value={block.content.text}
                onChange={e => handleInlineEdit(block.id, 'text', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-2xl font-bold mb-4 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'text' })}
              >
                {block.content.text}
              </h2>
            )}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subtitle' ? (
              <input
                type="text"
                className="text-center mb-8 w-full outline-none"
                value={block.content.subtitle}
                onChange={e => handleInlineEdit(block.id, 'subtitle', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-center mb-8 text-gray-700 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subtitle' })}
              >
                {block.content.subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'buttonText' ? (
                <input
                  type="text"
                  className="w-full sm:w-auto bg-accent text-white py-3 rounded-lg font-semibold text-center outline-none"
                  value={block.content.buttonText}
                  onChange={e => handleInlineEdit(block.id, 'buttonText', e.target.value)}
                  onBlur={() => setInlineEdit(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  className="w-full sm:w-auto bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/80 transition-colors"
                  onClick={() => setInlineEdit({ blockId: block.id, field: 'buttonText' })}
                >
                  {block.content.buttonText}
                </button>
              )}
              {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'secondaryButtonText' ? (
                <input
                  type="text"
                  className="w-full sm:w-auto bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold text-center outline-none"
                  value={block.content.secondaryButtonText}
                  onChange={e => handleInlineEdit(block.id, 'secondaryButtonText', e.target.value)}
                  onBlur={() => setInlineEdit(null)}
                  onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                  autoFocus
                />
              ) : (
                <button
                  type="button"
                  className="w-full sm:w-auto bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  onClick={() => setInlineEdit({ blockId: block.id, field: 'secondaryButtonText' })}
                >
                  {block.content.secondaryButtonText}
                </button>
              )}
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="text-center">
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'title' ? (
              <input
                type="text"
                className="text-2xl font-bold mb-4 w-full outline-none"
                value={block.content.title}
                onChange={e => handleInlineEdit(block.id, 'title', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-2xl font-bold mb-4 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'title' })}
              >
                {block.content.title}
              </h2>
            )}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subtitle' ? (
              <input
                type="text"
                className="text-center mb-8 w-full outline-none"
                value={block.content.subtitle}
                onChange={e => handleInlineEdit(block.id, 'subtitle', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-center mb-8 text-gray-700 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subtitle' })}
              >
                {block.content.subtitle}
              </p>
            )}
            <div className="flex justify-center">
              <iframe
                width="560"
                height="315"
                src={block.content.videoUrl}
                title="Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg shadow-lg w-full max-w-xl"
              ></iframe>
            </div>
          </div>
        );
      case 'gallery':
        return (
          <div>
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'title' ? (
              <input
                type="text"
                className="text-2xl font-bold mb-4 w-full outline-none"
                value={block.content.title}
                onChange={e => handleInlineEdit(block.id, 'title', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-2xl font-bold mb-4 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'title' })}
              >
                {block.content.title}
              </h2>
            )}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subtitle' ? (
              <input
                type="text"
                className="text-center mb-8 w-full outline-none"
                value={block.content.subtitle}
                onChange={e => handleInlineEdit(block.id, 'subtitle', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-center mb-8 text-gray-700 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subtitle' })}
              >
                {block.content.subtitle}
              </p>
            )}
            <div className="grid grid-cols-3 gap-4">
              {block.content.images?.map((img: any, idx: number) => (
                <div key={idx} className="relative group">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="rounded-lg shadow-md w-full h-32 object-cover"
                  />
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'gallery-image-title' && inlineEdit.index === idx ? (
                    <input
                      type="text"
                      className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded-md"
                      value={img.title}
                      onChange={e => handleInlineEdit(block.id, 'gallery', { title: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <h4 className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-sm px-2 py-1 rounded-md">
                      {img.title}
                    </h4>
                  )}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'gallery-image-description' && inlineEdit.index === idx ? (
                    <textarea
                      className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md"
                      value={img.description}
                      onChange={e => handleInlineEdit(block.id, 'gallery', { description: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <p className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md">
                      {img.description}
                    </p>
                  )}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'gallery-image-link' && inlineEdit.index === idx ? (
                    <input
                      type="text"
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md"
                      value={img.link}
                      onChange={e => handleInlineEdit(block.id, 'gallery', { link: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <a
                      href={img.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md hover:underline"
                      onClick={e => { e.stopPropagation(); setInlineEdit({ blockId: block.id, field: 'gallery-image-link', index: idx }); }}
                    >
                      {img.linkText}
                    </a>
                  )}
                </div>
              ))}
            </div>
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'ctaText' ? (
              <input
                type="text"
                className="w-full bg-accent text-white py-3 rounded-lg font-semibold text-center outline-none"
                value={block.content.ctaText}
                onChange={e => handleInlineEdit(block.id, 'ctaText', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <button
                type="button"
                className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/80 transition-colors"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'ctaText' })}
              >
                {block.content.ctaText}
              </button>
            )}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'ctaLink' ? (
              <input
                type="text"
                className="w-full bg-accent text-white py-3 rounded-lg font-semibold text-center outline-none"
                value={block.content.ctaLink}
                onChange={e => handleInlineEdit(block.id, 'ctaLink', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <a
                href={block.content.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/80 transition-colors"
                onClick={e => { e.stopPropagation(); setInlineEdit({ blockId: block.id, field: 'ctaLink' }); }}
              >
                {block.content.ctaText}
              </a>
            )}
          </div>
        );
      case 'faq':
        return (
          <div>
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'title' ? (
              <input
                type="text"
                className="text-2xl font-bold mb-4 w-full outline-none"
                value={block.content.title}
                onChange={e => handleInlineEdit(block.id, 'title', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-2xl font-bold mb-4 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'title' })}
              >
                {block.content.title}
              </h2>
            )}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subtitle' ? (
              <input
                type="text"
                className="text-center mb-8 w-full outline-none"
                value={block.content.subtitle}
                onChange={e => handleInlineEdit(block.id, 'subtitle', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-center mb-8 text-gray-700 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subtitle' })}
              >
                {block.content.subtitle}
              </p>
            )}
            <div className="space-y-4">
              {block.content.faqs?.map((faq: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg shadow p-4">
                  <div className="font-semibold">Q: {faq.question}</div>
                  <div className="text-gray-700 mt-1">A: {faq.answer}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'social-proof':
        return (
          <div className="text-center">
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'title' ? (
              <input
                type="text"
                className="text-2xl font-bold mb-4 w-full outline-none"
                value={block.content.title}
                onChange={e => handleInlineEdit(block.id, 'title', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-2xl font-bold mb-4 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'title' })}
              >
                {block.content.title}
              </h2>
            )}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subtitle' ? (
              <input
                type="text"
                className="text-center mb-8 w-full outline-none"
                value={block.content.subtitle}
                onChange={e => handleInlineEdit(block.id, 'subtitle', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-center mb-8 text-gray-700 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subtitle' })}
              >
                {block.content.subtitle}
              </p>
            )}
            <div className="flex justify-center gap-6">
              {block.content.logos?.map((logo: any, idx: number) => (
                <div key={idx} className="relative group">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-10 object-contain"
                  />
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'social-proof-logo-name' && inlineEdit.index === idx ? (
                    <input
                      type="text"
                      className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md"
                      value={logo.name}
                      onChange={e => handleInlineEdit(block.id, 'social-proof', { name: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <h4 className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md">
                      {logo.name}
                    </h4>
                  )}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'social-proof-logo-link' && inlineEdit.index === idx ? (
                    <input
                      type="text"
                      className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md"
                      value={logo.link}
                      onChange={e => handleInlineEdit(block.id, 'social-proof', { link: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <a
                      href={logo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-md hover:underline"
                      onClick={e => { e.stopPropagation(); setInlineEdit({ blockId: block.id, field: 'social-proof-logo-link', index: idx }); }}
                    >
                      {logo.linkText}
                    </a>
                  )}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {block.content.stats?.map((stat: any, idx: number) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">{stat.number}</div>
                  <div className="text-sm text-gray-700">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div>
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'title' ? (
              <input
                type="text"
                className="text-2xl font-bold mb-4 w-full outline-none"
                value={block.content.title}
                onChange={e => handleInlineEdit(block.id, 'title', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <h2
                className="text-2xl font-bold mb-4 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'title' })}
              >
                {block.content.title}
              </h2>
            )}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'subtitle' ? (
              <input
                type="text"
                className="text-center mb-8 w-full outline-none"
                value={block.content.subtitle}
                onChange={e => handleInlineEdit(block.id, 'subtitle', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-center mb-8 text-gray-700 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'subtitle' })}
              >
                {block.content.subtitle}
              </p>
            )}
            <div className="grid grid-cols-2 gap-6">
              {block.content.plans?.map((plan: any, idx: number) => (
                <div key={idx} className={`bg-white rounded-lg shadow p-6 text-center ${plan.popular ? 'ring-2 ring-accent' : ''}`}>
                  {plan.popular && (
                    <div className="bg-accent text-white text-xs px-3 py-1 rounded-full mb-4 inline-block">
                      Most Popular
                    </div>
                  )}
                  {/* Plan Name Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'pricing-plan-name' && inlineEdit.index === idx ? (
                    <input
                      type="text"
                      className="text-xl font-semibold mb-2 w-full outline-none"
                      value={plan.name}
                      onChange={e => handleInlineEdit(block.id, 'pricing', { name: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="text-xl font-semibold mb-2 cursor-pointer"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'pricing-plan-name', index: idx })}
                    >
                      {plan.name}
                    </div>
                  )}
                  {/* Plan Price Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'pricing-plan-price' && inlineEdit.index === idx ? (
                    <input
                      type="text"
                      className="text-3xl font-bold mb-4 w-full outline-none"
                      value={plan.price}
                      onChange={e => handleInlineEdit(block.id, 'pricing', { price: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <div
                      className="text-3xl font-bold mb-4 cursor-pointer"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'pricing-plan-price', index: idx })}
                    >
                      {plan.price}
                    </div>
                  )}
                  {plan.originalPrice && (
                    <div className="text-sm text-gray-500 line-through mb-4">{plan.originalPrice}</div>
                  )}
                  <ul className="mb-4 space-y-1">
                    {plan.features?.map((f: string, i: number) => (
                      <li key={i} className="text-gray-700">• {f}</li>
                    ))}
                  </ul>
                  {/* Plan CTA Inline Edit */}
                  {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'pricing-plan-cta' && inlineEdit.index === idx ? (
                    <input
                      type="text"
                      className="w-full bg-accent text-white py-2 rounded-lg font-semibold text-center outline-none"
                      value={plan.cta}
                      onChange={e => handleInlineEdit(block.id, 'pricing', { cta: e.target.value }, idx)}
                      onBlur={() => setInlineEdit(null)}
                      onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                      autoFocus
                    />
                  ) : (
                    <button
                      type="button"
                      className="w-full bg-accent text-white py-2 rounded-lg font-semibold hover:bg-accent/80 transition"
                      onClick={() => setInlineEdit({ blockId: block.id, field: 'pricing-plan-cta', index: idx })}
                    >
                      {plan.cta}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {/* Disclaimer Inline Edit */}
            {inlineEdit && inlineEdit.blockId === block.id && inlineEdit.field === 'disclaimer' ? (
              <input
                type="text"
                className="text-xs text-gray-500 text-center mt-4 w-full outline-none"
                value={block.content.disclaimer}
                onChange={e => handleInlineEdit(block.id, 'disclaimer', e.target.value)}
                onBlur={() => setInlineEdit(null)}
                onKeyDown={e => { if (e.key === 'Enter') setInlineEdit(null); }}
                autoFocus
              />
            ) : (
              <p
                className="text-xs text-gray-500 text-center mt-4 cursor-pointer"
                onClick={() => setInlineEdit({ blockId: block.id, field: 'disclaimer' })}
              >
                {block.content.disclaimer}
              </p>
            )}
          </div>
        );

      default:
        return <div className="p-8 text-center">Block content here</div>;
    }
  };

  const saveFunnel = async () => {
    try {
      const response = await fetch('/api/funnels', {
        method: funnelId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: funnelId,
          title: funnelData.title,
          description: funnelData.description,
          blocks,
          theme,
          slug: funnelData.title.toLowerCase().replace(/\s+/g, '-')
        })
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/funnel/${result.funnel.slug}`);
      }
    } catch (error) {
      console.error('Error saving funnel:', error);
    }
  };

  const selectedBlockData = blocks.find(block => block.id === selectedBlock);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Funnel Builder</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-2 rounded ${deviceMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-2 rounded ${deviceMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-2 rounded ${deviceMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                previewMode 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {previewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={saveFunnel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save Funnel
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-[80vh]">
        {/* Block Library Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 p-4 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Blocks</h2>
          <div className="flex flex-col gap-2">
            {blockTypeMeta.map((block) => (
              <button
                key={block.type}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                onClick={() => {
                  const template = blockTemplates[block.type as keyof typeof blockTemplates];
                  if (template) {
                    setBlocks((prev) => [
                      ...prev,
                      {
                        id: `${block.type}-${Date.now()}`,
                        type: block.type as Block['type'],
                        ...JSON.parse(JSON.stringify(template)),
                      },
                    ]);
                  }
                }}
              >
                <span className="text-xl">{block.icon}</span>
                <span className="font-medium text-gray-800">{block.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Canvas */}
        <main className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8 relative">
          {/* Device Preview Toggle */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              className={`p-2 rounded-full border ${deviceMode === 'desktop' ? 'bg-accent text-white' : 'bg-white text-gray-700'} shadow`}
              onClick={() => setDeviceMode('desktop')}
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-full border ${deviceMode === 'tablet' ? 'bg-accent text-white' : 'bg-white text-gray-700'} shadow`}
              onClick={() => setDeviceMode('tablet')}
            >
              <Tablet className="w-5 h-5" />
            </button>
            <button
              className={`p-2 rounded-full border ${deviceMode === 'mobile' ? 'bg-accent text-white' : 'bg-white text-gray-700'} shadow`}
              onClick={() => setDeviceMode('mobile')}
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>

          {/* Empty State */}
          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <PlusCircle className="w-16 h-16 text-accent mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Start Building Your Funnel</h3>
              <p className="text-gray-700 mb-6">Add blocks from the left to create your high-converting funnel.</p>
              <button
                className="bg-accent text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-accent/80 transition"
                onClick={() => {
                  // Add a hero block by default
                  const template = blockTemplates['hero'];
                  setBlocks([
                    {
                      id: `hero-${Date.now()}`,
                      type: 'hero',
                      ...JSON.parse(JSON.stringify(template)),
                    },
                  ]);
                }}
              >
                <PlusCircle className="w-5 h-5 mr-2 inline" /> Add First Block
              </button>
            </div>
          )}

          {/* Drag & Drop Canvas */}
          {blocks.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
                  {blocks.map((block, idx) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      index={idx}
                      isSelected={selectedBlock === block.id}
                      onSelect={(id) => {
                        setSelectedBlock(id);
                        setShowBlockSettings(true);
                      }}
                      onDelete={deleteBlock}
                      onUpdate={updateBlock}
                      previewMode={previewMode}
                      renderBlockContent={renderBlockContent}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </main>

        {/* Block Settings Sidebar */}
        {showBlockSettings && selectedBlock && (
          <aside className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col gap-4">
            <button
              className="self-end text-gray-400 hover:text-gray-700 mb-2"
              onClick={() => setShowBlockSettings(false)}
            >
              ×
            </button>
            <BlockSettings
              block={blocks.find((b) => b.id === selectedBlock)!}
              onUpdate={updateBlock}
              onClose={() => setShowBlockSettings(false)}
              onDuplicate={() => duplicateBlock(selectedBlock)}
              onDelete={() => deleteBlock(selectedBlock)}
            />
          </aside>
        )}
      </div>
    </div>
  );
};

export default FunnelBuilder; 