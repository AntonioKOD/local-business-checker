'use client';

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { X, CreditCard, Check } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentModalProps {
  onClose: () => void;
  price: number;
  onPaymentSuccess: () => void;
}

const CheckoutForm: React.FC<{ price: number; onSuccess: () => void }> = ({ price, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Create payment intent
      const { client_secret } = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).then(res => res.json());

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
        // Confirm with backend
        await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_intent_id: paymentIntent.id }),
        });

        setMessage('Payment successful! You now have access to all search results.');
        setMessageType('success');
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
         } catch {
       setMessage('An error occurred while processing your payment.');
       setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">What you&apos;ll get:</h4>
        <ul className="space-y-2">
          {[
            'Access to all business results found',
            'Complete website analysis for each business',
            'Export results to CSV (coming soon)',
            'Priority support'
          ].map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-gray-700">
              <Check className="w-4 h-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">${price.toFixed(2)}</span>
            <span className="text-gray-600">One-time payment</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Card Information
        </label>
        <div className="p-3 border border-gray-300 rounded-lg">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
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
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pay Now - ${price.toFixed(2)}
          </>
        )}
      </button>
    </form>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, price, onPaymentSuccess }) => {
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    setTimeout(() => {
      onPaymentSuccess();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Upgrade to Full Access
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h4>
              <p className="text-gray-600">Redirecting you to access all results...</p>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <CheckoutForm price={price} onSuccess={handleSuccess} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 