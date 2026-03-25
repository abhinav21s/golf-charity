import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import api from '../services/api';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [checking, setChecking] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10; // 10 attempts = ~20 seconds

  useEffect(() => {
    if (!sessionId) {
      toast.error('Invalid session');
      navigate('/pricing');
      return;
    }

    checkSubscription();
  }, [sessionId]);

  const checkSubscription = async () => {
    try {
      const response = await api.get('/subscriptions/my-subscription');
      const subscription = response.data?.data || response.data;
      
      if (subscription && subscription.status === 'active') {
        // Subscription found and active
        toast.success('Subscription activated successfully!');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else if (attempts < maxAttempts) {
        // Not found yet, try again
        setAttempts(prev => prev + 1);
        setTimeout(checkSubscription, 2000); // Check again in 2 seconds
      } else {
        // Max attempts reached
        toast.error('Subscription processing is taking longer than expected. Please check your dashboard.');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      if (attempts < maxAttempts) {
        // Error (likely 404), try again
        setAttempts(prev => prev + 1);
        setTimeout(checkSubscription, 2000);
      } else {
        // Max attempts reached
        toast.error('Unable to verify subscription. Please check your dashboard or contact support.');
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-12">
        <div className="container-custom">
          <div className="max-w-md mx-auto text-center">
            <div className="card">
              <div className="mb-6">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <h1 className="text-2xl font-display font-bold mb-2">Payment Successful!</h1>
                <p className="text-slate-600">
                  We're activating your subscription...
                </p>
              </div>

              <LoadingSpinner />

              <p className="text-sm text-slate-500 mt-6">
                This usually takes just a few seconds. You'll be redirected to your dashboard automatically.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SubscriptionSuccessPage;
