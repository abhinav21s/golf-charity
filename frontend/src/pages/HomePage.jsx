/**
 * Home Page
 * Landing page with emotion-driven design
 * Focus: Charitable impact, excitement, personal growth (NOT traditional golf aesthetics)
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Award, 
  ArrowRight,
  Sparkles,
  Target,
  Gift
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GolfBall from '../components/icons/GolfBall';
import { charityAPI } from '../services/api';

const HomePage = () => {
  const [featuredCharities, setFeaturedCharities] = useState([]);

  useEffect(() => {
    loadFeaturedCharities();
  }, []);

  const loadFeaturedCharities = async () => {
    try {
      const response = await charityAPI.getCharities({ featured: true });
      setFeaturedCharities(response.data.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to load charities:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section - Emotion-Driven */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium">Play. Win. Give.</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Your Scores.
              <br />
              <span className="text-yellow-300">Your Impact.</span>
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Transform your golf passion into charitable giving. Enter your scores, 
              participate in monthly draws, and support causes that matter.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn bg-white text-primary-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-2xl"
                >
                  Start Your Journey
                  <ArrowRight className="inline-block ml-2 w-5 h-5" />
                </motion.button>
              </Link>
              
              <Link to="/charities">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 px-8 py-4 text-lg font-semibold"
                >
                  Explore Charities
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 right-10 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-20 left-10 w-32 h-32 bg-pink-300/20 rounded-full blur-xl"
        />
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Simple. Meaningful. <span className="gradient-text">Rewarding.</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Four easy steps to make a difference while enjoying your passion
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Users,
                title: 'Subscribe',
                description: 'Choose monthly or yearly plan. 10% goes to your chosen charity automatically.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Target,
                title: 'Enter Scores',
                description: 'Log your latest 5 Stableford scores (1-45). Simple, quick, engaging.',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: Award,
                title: 'Monthly Draws',
                description: 'Your scores become your draw numbers. Match 3, 4, or 5 to win prizes!',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: GolfBall,
                title: 'Give Back',
                description: 'Every subscription supports your chosen charity. Track your impact.',
                color: 'from-green-500 to-emerald-500'
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="card-gradient text-center h-full">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-600">{step.description}</p>
                </div>
                
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { value: '$50K+', label: 'Donated to Charities', icon: GolfBall },
              { value: '500+', label: 'Active Members', icon: Users },
              { value: '$25K+', label: 'Prizes Awarded', icon: Gift }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass p-8 rounded-2xl"
              >
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
                <div className="text-5xl font-display font-bold mb-2">{stat.value}</div>
                <div className="text-blue-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Charities Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Causes That <span className="gradient-text">Matter</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Choose from our carefully selected charity partners
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {featuredCharities.map((charity, index) => (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/charities/${charity.id}`}>
                  <div className="card hover:scale-105 transition-transform duration-200 h-full">
                    <div className="w-20 h-20 mb-4 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                      <GolfBall className="w-10 h-10 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{charity.name}</h3>
                    <p className="text-slate-600 mb-4 line-clamp-3">{charity.description}</p>
                    <div className="text-primary-600 font-semibold flex items-center gap-2">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/charities">
              <button className="btn btn-primary">
                View All Charities
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Join hundreds of golfers who are turning their passion into positive change
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn bg-white text-primary-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold shadow-2xl"
              >
                Get Started Today
                <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
