import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PageHeader from '../components/shared/PageHeader';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCurrentSubscription();
    }
  }, [user]);

  const fetchCurrentSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/my-subscription');
      setCurrentSubscription(response.data);
    } catch (error) {
      // Silently handle - user may not have subscription
      console.log('No subscription found');
    }
  };

  const handleSubscribe = (planType) => {
    if (!user) {
      navigate('/register');
      return;
    }

    // Phase 1: Stripe not integrated yet
    toast.info('Stripe payment integration coming soon! This feature will be available after deployment.');
  };

  const isCurrentPlan = (planType) => {
    return currentSubscription?.plan_type === planType && currentSubscription?.status === 'active';
  };

  const plans = [
    {
      type: 'monthly',
      name: 'Monthly Plan',
      price: '₹2,499',
      billing: 'per month',
      features: [
        'Submit up to 5 golf scores per month',
        'Automatic entry into monthly draws',
        'Choose your charity (10-100% contribution)',
        'Track your winnings and contributions',
        'Email notifications for draws and wins',
        'Access to draw history and results'
      ],
      recommended: false
    },
    {
      type: 'yearly',
      name: 'Yearly Plan',
      price: '₹24,999',
      billing: 'per year',
      savings: 'Save ₹4,989 (17% off)',
      features: [
        'Submit up to 5 golf scores per month',
        'Automatic entry into monthly draws',
        'Choose your charity (10-100% contribution)',
        'Track your winnings and contributions',
        'Email notifications for draws and wins',
        'Access to draw history and results',
        '2 months free compared to monthly plan'
      ],
      recommended: true
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-12">
        <div className="container-custom">
          <PageHeader
            title="Pricing Plans"
            description="Choose a plan that works for you and start making a difference"
          />

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.type}
                className={`card relative ${
                  plan.recommended ? 'border-2 border-accent-500 shadow-lg' : ''
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-accent-500 text-white rounded-full text-sm font-semibold">
                      ⭐ Recommended
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h2 className="text-2xl font-display font-bold mb-2">{plan.name}</h2>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-primary-600">{plan.price}</span>
                    <span className="text-slate-600 ml-2">{plan.billing}</span>
                  </div>
                  {plan.savings && (
                    <p className="text-success-600 font-semibold text-sm">{plan.savings}</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-success-600 mt-1">✓</span>
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan(plan.type) ? (
                  <button
                    disabled
                    className="btn-secondary w-full opacity-75 cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.type)}
                    className={`w-full ${
                      plan.recommended ? 'btn-primary' : 'btn-secondary'
                    }`}
                  >
                    {user ? 'Subscribe Now' : 'Sign Up to Subscribe'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="mt-12 max-w-3xl mx-auto space-y-6">
            <div className="card bg-primary-50 border border-primary-200">
              <h3 className="font-semibold text-primary-900 mb-3">💙 Charity Contribution</h3>
              <p className="text-primary-800">
                When you win, you choose how much to contribute to your selected charity (minimum 10%). 
                Your generosity helps support important causes while you enjoy the game you love.
              </p>
            </div>

            <div className="card bg-slate-50">
              <h3 className="font-semibold text-slate-900 mb-3">❓ Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-slate-900">How does the draw work?</p>
                  <p className="text-slate-700 text-sm mt-1">
                    Each month, we randomly select 5 winning numbers. Your submitted scores are matched 
                    against these numbers. The more matches you have, the bigger your prize!
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">Can I cancel anytime?</p>
                  <p className="text-slate-700 text-sm mt-1">
                    Yes! You can cancel your subscription at any time. Your access will continue until 
                    the end of your current billing period.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-slate-900">How are prizes calculated?</p>
                  <p className="text-slate-700 text-sm mt-1">
                    The prize pool is distributed among winners based on match types: 5-match (jackpot), 
                    4-match, and 3-match. If there are no 5-match winners, the jackpot rolls over to the next month.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
