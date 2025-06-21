'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, Check, Crown, Eye, EyeOff } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  onClose: () => void;
  onPaymentSuccess: (user: { id: string; email: string; firstName: string; lastName: string }) => void;
}

const CheckoutForm: React.FC<{ onSuccess: (user: { id: string; email: string; firstName: string; lastName: string }) => void }> = ({ onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!email || !firstName || !lastName || !password) {
      setMessage('Please fill in all required fields.');
      setMessageType('error');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Create subscription
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      const { client_secret, customer_id } = data;

      if (!client_secret) {
        console.error('No client_secret received:', data);
        throw new Error('Payment processing failed - no client secret received');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      });

      if (error) {
        setMessage(error.message || 'An error occurred while processing your payment.');
        setMessageType('error');
      } else if (paymentIntent.status === 'succeeded') {
        setMessage('Payment successful! Creating your account...');
        setMessageType('success');
        
        // Poll for user creation (since webhook might take a moment)
        let attempts = 0;
        const maxAttempts = 6; // Reduced from 10
        const pollInterval = 2000; // Increased from 1000ms to 2000ms (2 seconds)
        
        const pollForUser = async (): Promise<void> => {
          attempts++;
          
          try {
            // Try to find the user by email in PayloadCMS
            const response = await fetch('/api/auth/check-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, customer_id }),
            });
            
            if (response.ok) {
              const userData = await response.json();
              if (userData.user) {
                // Try to set up subscription (optional)
                try {
                  await fetch('/api/setup-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      userId: userData.user.id, 
                      customerId: customer_id 
                    }),
                  });
                } catch (subscriptionError) {
                  console.log('Subscription setup will be handled later:', subscriptionError);
                }
                
                setMessage('Account created successfully! Welcome to BusinessChecker Premium! You can now access all premium features.');
                onSuccess(userData.user);
                return;
              }
            }
            
            if (attempts < maxAttempts) {
              setTimeout(pollForUser, pollInterval);
            } else {
              // Fallback: create user directly if webhook failed
              const createResponse = await fetch('/api/auth/create-user-after-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  email, 
                  firstName, 
                  lastName, 
                  password,
                  customer_id,
                  payment_intent_id: paymentIntent.id
                }),
              });
              
              if (createResponse.ok) {
                const createdUser = await createResponse.json();
                
                // Try to set up subscription (optional, won't fail if payment method isn't ready)
                try {
                  await fetch('/api/setup-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      userId: createdUser.user.id, 
                      customerId: customer_id 
                    }),
                  });
                } catch (subscriptionError) {
                  console.log('Subscription setup will be handled later:', subscriptionError);
                }
                
                setMessage('Account created successfully! Welcome to BusinessChecker Premium! You can now access all premium features.');
                onSuccess(createdUser.user);
              } else {
                throw new Error('Failed to create user account');
              }
            }
          } catch (error) {
            console.error('Error polling for user:', error);
            if (attempts >= maxAttempts) {
              setMessage('Payment successful, but there was an issue creating your account. Please contact support.');
              setMessageType('error');
            }
          }
        };
        
        // Start polling
        pollForUser();
      }
    } catch (error) {
      console.error('Payment error:', error);
      setMessage('An error occurred while processing your payment.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Create Your Premium Account</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 hover:bg-white/90 text-black"
              placeholder="John"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 hover:bg-white/90 text-black"
              placeholder="Doe"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 hover:bg-white/90 text-black"
            placeholder="john@example.com"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/70 hover:bg-white/90 text-black pr-12"
              placeholder="Enter your password"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">What you&apos;ll get:</h4>
        <ul className="space-y-2">
          {[
            'Unlimited business searches',
            'Complete website analysis for each business',
            'Premium analytics dashboard',
            'Competitor analysis tools',
            'Priority support'
          ].map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-gray-700">
              <Check className="w-4 h-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
          <div className="flex justify-between items-center mb-2">
                            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">$7.00</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">per month</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <p className="text-sm text-blue-600 font-medium">Cancel anytime • No hidden fees</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Card Information
        </label>
        <div className="p-4 border-2 border-gray-200 rounded-xl bg-white/70 hover:bg-white/90 transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1f2937',
                  fontFamily: '"Inter", "system-ui", sans-serif',
                  fontSmoothing: 'antialiased',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#ef4444',
                  iconColor: '#ef4444',
                },
                complete: {
                  color: '#10b981',
                  iconColor: '#10b981',
                },
              },
            }}
          />
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl disabled:transform-none disabled:shadow-md btn-glow flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing your subscription...</span>
          </>
        ) : (
          <>
            <Crown className="w-5 h-5" />
            <span>Start Premium Subscription - $20/month</span>
          </>
        )}
      </button>
    </form>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, onPaymentSuccess }) => {
  const [success, setSuccess] = useState(false);

  const handleSuccess = (user: { id: string; email: string; firstName: string; lastName: string }) => {
    setSuccess(true);
    setTimeout(() => {
      onPaymentSuccess(user);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-float">
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Upgrade to Premium
              </h3>
              <p className="text-sm text-gray-500">Unlock unlimited potential</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Premium!</h4>
              <p className="text-gray-600 text-lg">Your account has been created successfully.</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting you to your dashboard...</p>
              <div className="mt-6">
                <div className="animate-shimmer h-2 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 rounded-full"></div>
              </div>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <CheckoutForm onSuccess={handleSuccess} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 