/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeadData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  businessType?: string;
  currentChallenges?: string[];
  budget?: string;
  timeline?: string;
  source?: string;
}

const LeadFunnel = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [leadData, setLeadData] = useState<LeadData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    businessType: '',
    currentChallenges: [],
    budget: '',
    timeline: '',
    source: ''
  });

  const businessTypes = [
    'Local Business',
    'E-commerce',
    'Service Business',
    'Restaurant/Food',
    'Healthcare',
    'Real Estate',
    'Legal Services',
    'Financial Services',
    'Technology',
    'Manufacturing',
    'Other'
  ];

  const challenges = [
    'Low online visibility',
    'Poor website performance',
    'No digital marketing strategy',
    'Competition is outranking us',
    'Need more qualified leads',
    'Social media presence is weak',
    'No local SEO strategy',
    'Website needs redesign',
    'No analytics tracking',
    'Customer reviews are poor'
  ];

  const budgets = [
    'Under $1,000',
    '$1,000 - $3,000',
    '$3,000 - $5,000',
    '$5,000 - $10,000',
    '$10,000 - $25,000',
    '$25,000+'
  ];

  const timelines = [
    'Immediately',
    'Within 30 days',
    'Within 60 days',
    'Within 90 days',
    'Just exploring options'
  ];

  const updateLeadData = (field: keyof LeadData, value: any) => {
    setLeadData(prev => ({ ...prev, [field]: value }));
  };

  const handleChallengeToggle = (challenge: string) => {
    setLeadData(prev => ({
      ...prev,
      currentChallenges: prev.currentChallenges?.includes(challenge)
        ? prev.currentChallenges.filter(c => c !== challenge)
        : [...(prev.currentChallenges || []), challenge]
    }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...leadData,
          funnelStep: currentStep,
          submittedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        setCurrentStep(6); // Success step
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Transform Your Business with Data-Driven Insights
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Get a comprehensive analysis of your local market and discover opportunities to dominate your competition
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="text-blue-600 text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Market Analysis</h3>
                <p className="text-gray-600">Discover your competitors&quot; weaknesses and market gaps</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <div className="text-green-600 text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Lead Generation</h3>
                <p className="text-gray-600">Identify high-value prospects in your local area</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="text-purple-600 text-2xl mb-2">📈</div>
                <h3 className="font-semibold text-gray-900 mb-2">Growth Strategy</h3>
                <p className="text-gray-600">Get actionable strategies to scale your business</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Your Free Market Analysis</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={leadData.name}
                    onChange={(e) => updateLeadData('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={leadData.email}
                    onChange={(e) => updateLeadData('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email address"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tell Us About Your Business</h2>
              <p className="text-lg text-gray-600">This helps us provide more targeted insights</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={leadData.company}
                    onChange={(e) => updateLeadData('company', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={leadData.phone}
                    onChange={(e) => updateLeadData('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type *</label>
                <select
                  value={leadData.businessType}
                  onChange={(e) => updateLeadData('businessType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select your business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">What Are Your Biggest Challenges?</h2>
              <p className="text-lg text-gray-600">Select all that apply to help us tailor your analysis</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="grid md:grid-cols-2 gap-4">
                {challenges.map((challenge) => (
                  <label key={challenge} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={leadData.currentChallenges?.includes(challenge) || false}
                      onChange={() => handleChallengeToggle(challenge)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{challenge}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Investment & Timeline</h2>
              <p className="text-lg text-gray-600">Help us understand your readiness to invest in growth</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What&quot;s your marketing budget range?</label>
                <select
                  value={leadData.budget}
                  onChange={(e) => updateLeadData('budget', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select budget range</option>
                  {budgets.map(budget => (
                    <option key={budget} value={budget}>{budget}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">When do you want to start implementing changes?</label>
                <select
                  value={leadData.timeline}
                  onChange={(e) => updateLeadData('timeline', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select timeline</option>
                  {timelines.map(timeline => (
                    <option key={timeline} value={timeline}>{timeline}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Your Analysis?</h2>
              <p className="text-lg text-gray-600">Review your information and get instant access to your market analysis</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Name:</span>
                  <span>{leadData.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="font-medium">Email:</span>
                  <span>{leadData.email}</span>
                </div>
                {leadData.company && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Company:</span>
                    <span>{leadData.company}</span>
                  </div>
                )}
                {leadData.businessType && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Business Type:</span>
                    <span>{leadData.businessType}</span>
                  </div>
                )}
                {leadData.budget && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Budget:</span>
                    <span>{leadData.budget}</span>
                  </div>
                )}
                {leadData.timeline && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Timeline:</span>
                    <span>{leadData.timeline}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">What You&quot;ll Get:</h3>
                <ul className="text-blue-800 space-y-1">
                  <li>• Comprehensive market analysis report</li>
                  <li>• Competitor analysis and opportunities</li>
                  <li>• Custom growth recommendations</li>
                  <li>• 15-minute strategy consultation</li>
                  <li>• Priority access to our services</li>
                </ul>
              </div>
            </div>
          </motion.div>
        );

      case 6:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-3xl font-bold text-gray-900">Thank You!</h2>
            <p className="text-lg text-gray-600">
              Your market analysis is being prepared. You&quot;ll receive it within the next 24 hours.
            </p>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-4">What&quot;s Next:</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</div>
                  <span>Check your email for your analysis report</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</div>
                  <span>Schedule your free strategy consultation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">3</div>
                  <span>Get personalized recommendations for your business</span>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          {currentStep < 6 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of 5
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / 5) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 6 && (
            <div className="flex justify-between mt-8">
              <button
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Back
              </button>

              <button
                onClick={currentStep === 5 ? handleSubmit : handleNext}
                disabled={
                  (currentStep === 1 && (!leadData.name || !leadData.email)) ||
                  (currentStep === 2 && !leadData.businessType) ||
                  (currentStep === 4 && (!leadData.budget || !leadData.timeline))
                }
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  (currentStep === 1 && (!leadData.name || !leadData.email)) ||
                  (currentStep === 2 && !leadData.businessType) ||
                  (currentStep === 4 && (!leadData.budget || !leadData.timeline))
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-accent text-secondary py-3 rounded-lg font-semibold hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {currentStep === 5 ? 'Get My Analysis' : 'Continue'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadFunnel; 