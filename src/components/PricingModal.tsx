'use client';

import React, { useState } from 'react';
import { X, Check, Crown, CreditCard } from 'lucide-react';

interface PricingModalProps {
  onClose: () => void;
  onSelectPlan: (plan: string, isSubscription: boolean, price: number) => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ onClose, onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const premiumPlan = {
    id: 'premium',
    name: 'Premium',
    icon: <Crown className="w-6 h-6" />,
    monthlyPrice: 10.00,
    yearlyPrice: 100.00,
    searches: 'Unlimited searches',
    features: [
      'Unlimited business searches',
      'Advanced website analysis',
      'Competitor tracking & analysis',
      'Lead scoring & prioritization',
      'Advanced analytics dashboard',
      'Search history & insights',
      'CSV export & reporting',
      'Email + priority support',
      'API access',
      'Custom integrations'
    ],
    popular: true,
    color: 'purple'
  };

  const oneTimePlan = {
    id: 'oneTime',
    name: 'One-Time Unlock',
    price: 4.97,
    description: 'Unlock all results for your current search'
  };

  const getPrice = () => {
    return billingCycle === 'monthly' ? premiumPlan.monthlyPrice : premiumPlan.yearlyPrice;
  };

  const getSavings = () => {
    const monthlyCost = premiumPlan.monthlyPrice * 12;
    const yearlyCost = premiumPlan.yearlyPrice;
    return Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Choose Your Plan</h3>
            <p className="text-gray-600 mt-1">Scale your business research with the right plan</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Yearly
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  Save 17%
                </span>
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="flex justify-center mb-8">
            <div className="relative rounded-2xl border-2 border-purple-500 p-8 max-w-md w-full shadow-lg ring-2 ring-purple-500 ring-opacity-50">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Best Value
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                  {premiumPlan.icon}
                </div>
                <h4 className="text-2xl font-bold text-gray-900">{premiumPlan.name}</h4>
              </div>

              <div className="mb-6 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    ${getPrice()}
                  </span>
                  <span className="text-gray-500">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    Save {getSavings()}% with yearly billing
                  </p>
                )}
                <p className="text-lg text-gray-600 mt-2 font-medium">{premiumPlan.searches}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {premiumPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan(premiumPlan.id, true, getPrice())}
                className="w-full py-4 px-6 rounded-lg font-semibold text-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Start Premium Plan
              </button>
            </div>
          </div>

          {/* One-Time Option */}
          <div className="border-t pt-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {oneTimePlan.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{oneTimePlan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    ${oneTimePlan.price}
                  </div>
                  <button
                    onClick={() => onSelectPlan(oneTimePlan.id, false, oneTimePlan.price)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Once
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              All plans include a 14-day free trial. Cancel anytime.{' '}
              <a href="#" className="text-blue-600 hover:underline">
                View full feature comparison
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal; 