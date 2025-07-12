'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
  Plus, 
  Eye, 
  Settings, 
  Palette, 
  Type, 
  Image, 
  Video, 
  FileText,
  Mail,
  Phone,
  MapPin,
  Star,
  Users,
  TrendingUp,
  Target,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Save,
  EyeOff,
  Smartphone,
  Monitor,
  Tablet,
  GripVertical
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
              <Settings className="w-4 h-4" />
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const blockTemplates = {
    hero: {
      content: {
        headline: 'Transform Your Business',
        subheadline: 'Discover the secret to 10x your conversions with our proven funnel system',
        ctaText: 'Get Started Now',
        ctaLink: '#',
        image: '/api/placeholder/600/400'
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
        features: [
          { icon: '🚀', title: 'Lightning Fast', description: 'Optimized for speed and performance' },
          { icon: '🎯', title: 'High Converting', description: 'Proven to increase conversions by 300%' },
          { icon: '💎', title: 'Premium Quality', description: 'Built with the latest technologies' }
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
        testimonials: [
          {
            name: 'Sarah Johnson',
            role: 'CEO, TechStart',
            content: 'This funnel increased our conversions by 400% in just 30 days!',
            rating: 5,
            avatar: '/api/placeholder/60/60'
          },
          {
            name: 'Mike Chen',
            role: 'Marketing Director',
            content: 'The best investment we\'ve made this year. ROI was immediate.',
            rating: 5,
            avatar: '/api/placeholder/60/60'
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
          { type: 'text', label: 'Full Name', required: true },
          { type: 'email', label: 'Email Address', required: true },
          { type: 'phone', label: 'Phone Number', required: false },
          { type: 'select', label: 'Company Size', options: ['1-10', '11-50', '51-200', '200+'] }
        ],
        ctaText: 'Get My Free Session',
        privacyText: 'We respect your privacy. Unsubscribe at any time.'
      },
      settings: {
        backgroundColor: '#1F2937',
        textColor: '#FFFFFF',
        padding: 60,
        borderRadius: 12,
        shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        animation: 'slideInRight'
      }
    }
  };

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
  }, []);

  const updateBlock = useCallback((blockId: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId ? { ...block, ...updates } : block
    ));
  }, []);

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
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
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
                  ) : (
                    <input
                      type={field.type}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900"
                      placeholder={field.label}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {block.content.ctaText}
              </button>
              <p className="text-xs text-gray-400 text-center mt-4">
                {block.content.privacyText}
              </p>
            </form>
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

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        {!previewMode && (
          <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
            {/* Funnel Settings */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Funnel Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={funnelData.title}
                    onChange={(e) => setFunnelData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={funnelData.description}
                    onChange={(e) => setFunnelData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Block Library */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Add Blocks</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(blockTemplates).map((type) => (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="font-medium capitalize">{type}</div>
                    <div className="text-sm text-gray-500">
                      {type === 'hero' && 'Hero section with headline and CTA'}
                      {type === 'features' && 'Feature highlights with icons'}
                      {type === 'testimonials' && 'Customer testimonials and reviews'}
                      {type === 'form' && 'Lead capture form'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Customization */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-full h-10 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => setTheme(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas */}
        <div className={`flex-1 overflow-y-auto bg-gray-100 p-6 ${showBlockSettings ? 'mr-96' : ''}`}>
          <div className={`mx-auto transition-all duration-300 ${
            deviceMode === 'mobile' ? 'max-w-sm' : 
            deviceMode === 'tablet' ? 'max-w-2xl' : 'max-w-4xl'
          }`}>
            <div 
              className="bg-white min-h-screen shadow-lg"
              style={{ fontFamily: theme.fontFamily }}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={blocks.map(block => block.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="min-h-screen">
                    {blocks.map((block, index) => (
                      <SortableBlock
                        key={block.id}
                        block={block}
                        index={index}
                        isSelected={selectedBlock === block.id}
                        onSelect={handleBlockSelect}
                        onDelete={deleteBlock}
                        onUpdate={(updates) => updateBlock(block.id, updates)}
                        previewMode={previewMode}
                        renderBlockContent={renderBlockContent}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {blocks.length === 0 && (
                <div className="flex items-center justify-center min-h-screen text-center">
                  <div className="max-w-md">
                    <div className="text-6xl mb-4">🎯</div>
                    <h2 className="text-2xl font-bold mb-2">Start Building Your Funnel</h2>
                    <p className="text-gray-600 mb-6">
                      Add blocks from the sidebar to create your high-converting funnel
                    </p>
                    <button
                      onClick={() => addBlock('hero')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Hero Section
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Block Settings Panel */}
        {showBlockSettings && selectedBlockData && (
          <BlockSettings
            block={selectedBlockData}
            onUpdate={(updates) => updateBlock(selectedBlock, updates)}
            onClose={() => {
              setShowBlockSettings(false);
              setSelectedBlock(null);
            }}
            onDuplicate={() => duplicateBlock(selectedBlock)}
            onDelete={() => deleteBlock(selectedBlock)}
          />
        )}
      </div>
    </div>
  );
};

export default FunnelBuilder; 