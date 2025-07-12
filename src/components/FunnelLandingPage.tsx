'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Users, 
  TrendingUp, 
  Zap, 
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Settings,
  Copy,
  Trash2,
  Plus,
  Target,
  Award,
  Shield,
  Clock,
  DollarSign,
  Percent,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface FunnelLandingPageProps {
  funnel: {
    id: string;
    title: string;
    description: string;
    blocks: any[];
    theme: any;
    slug: string;
  };
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}

const FunnelLandingPage: React.FC<FunnelLandingPageProps> = ({ 
  funnel, 
  onEdit, 
  onDuplicate, 
  onDelete 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBlock, setCurrentBlock] = useState(0);

  const features = [
    {
      icon: '🚀',
      title: 'Lightning Fast',
      description: 'Optimized for speed and performance'
    },
    {
      icon: '🎯',
      title: 'High Converting',
      description: 'Proven to increase conversions by 300%'
    },
    {
      icon: '💎',
      title: 'Premium Quality',
      description: 'Built with the latest technologies'
    },
    {
      icon: '🛡️',
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security and uptime'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'CEO, TechStart',
      content: 'This funnel increased our conversions by 400% in just 30 days! The drag-and-drop builder is incredibly intuitive.',
      rating: 5,
      avatar: '/api/placeholder/60/60'
    },
    {
      name: 'Mike Chen',
      role: 'Marketing Director',
      content: 'The best investment we\'ve made this year. ROI was immediate and the analytics are incredibly detailed.',
      rating: 5,
      avatar: '/api/placeholder/60/60'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Founder, GrowthLab',
      content: 'Finally, a funnel builder that actually converts! The templates are amazing and the customization is endless.',
      rating: 5,
      avatar: '/api/placeholder/60/60'
    }
  ];

  const stats = [
    { label: 'Active Users', value: '10,000+', icon: Users },
    { label: 'Conversion Rate', value: '300%', icon: TrendingUp },
    { label: 'Uptime', value: '99.9%', icon: Shield },
    { label: 'Support', value: '24/7', icon: Clock }
  ];

  const renderBlock = (block: any, index: number) => {
    const isActive = index === currentBlock;
    
    return (
      <div 
        key={block.id}
        className={`transition-all duration-500 ${
          isActive ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-full absolute'
        }`}
        style={{
          backgroundColor: block.settings?.backgroundColor || '#FFFFFF',
          color: block.settings?.textColor || '#1F2937',
          padding: `${block.settings?.padding || 40}px`,
          borderRadius: `${block.settings?.borderRadius || 8}px`,
          boxShadow: block.settings?.shadow || '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        {renderBlockContent(block)}
      </div>
    );
  };

  const renderBlockContent = (block: any) => {
    switch (block.type) {
      case 'hero':
        return (
          <div className="text-center">
            <div className="animate-fadeInUp">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
                {block.content.headline || 'Transform Your Business'}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                {block.content.subheadline || 'Discover the secret to 10x your conversions with our proven funnel system'}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="group bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
                  {block.content.ctaText || 'Get Started Now'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="animate-slideInUp">
            <h2 className="text-4xl font-bold text-center mb-12">
              {block.content.title || 'Why Choose Client Compass'}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center group hover-lift">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="animate-fadeIn">
            <h2 className="text-4xl font-bold text-center mb-12">
              {block.content.title || 'What Our Clients Say'}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-lg hover-lift">
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
                  <p className="text-gray-700 mb-4 leading-relaxed">{testimonial.content}</p>
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
          <div className="max-w-md mx-auto animate-slideInRight">
            <h2 className="text-3xl font-bold text-center mb-4">
              {block.content.title || 'Get Your Free Strategy Session'}
            </h2>
            <p className="text-center mb-8 text-gray-300">
              {block.content.subtitle || 'Join 10,000+ businesses that have transformed their results'}
            </p>
            <form className="space-y-4">
              {block.content.fields?.map((field: any, index: number) => (
                <div key={index}>
                  <label className="block text-sm font-medium mb-2">
                    {field.label} {field.required && '*'}
                  </label>
                  {field.type === 'select' ? (
                    <select className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      {field.options?.map((option: string) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={field.label}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {block.content.ctaText || 'Get My Free Session'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-4">
                {block.content.privacyText || 'We respect your privacy. Unsubscribe at any time.'}
              </p>
            </form>
          </div>
        );

      default:
        return <div className="p-8 text-center">Block content here</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold gradient-text">Client Compass</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setCurrentBlock(0)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
              
              {onEdit && (
                <div className="flex gap-2">
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Edit
                  </button>
                  {onDuplicate && (
                    <button
                      onClick={onDuplicate}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="animate-fadeInUp">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
                  {funnel.title || 'Transform Your Business'}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                  {funnel.description || 'Discover the secret to 10x your conversions with our proven funnel system'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button className="group bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
                    Get Started Now
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="group bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Client Compass
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built for modern businesses that demand results
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center group hover-lift">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our Clients Say
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of satisfied customers who have transformed their businesses
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-lg hover-lift">
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
                  <p className="text-gray-700 mb-4 leading-relaxed">{testimonial.content}</p>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 10,000+ businesses that have already increased their conversions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105">
                Start Your Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Schedule a Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Client Compass</h3>
              <p className="text-gray-400">
                The ultimate funnel builder for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Client Compass. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FunnelLandingPage; 