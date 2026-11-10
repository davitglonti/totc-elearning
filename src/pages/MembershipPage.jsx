import React, { useState } from 'react';
import { Check, Star, ArrowRight, HelpCircle, Sparkles, ShieldCheck, Zap, X } from 'lucide-react';
import { api } from '../services/api';

export default function MembershipPage({ setActivePage, openAuthModal, currentUser, onSubscriptionUpdated }) {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [selectedPlanModal, setSelectedPlanModal] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const plans = [
    {
      name: 'Free Starter',
      planId: 'Free',
      price: '$0',
      period: 'Forever free',
      desc: 'Ideal for casual learners exploring introductory online classes.',
      features: [
        'Access to free introductory preview lectures',
        'Standard community discussion boards',
        'Mobile and desktop web access',
        'Limited quiz assessments (3 per month)'
      ],
      buttonText: 'Get Started Free',
      buttonStyle: 'bg-gray-100 text-totc-navy hover:bg-gray-200',
      isPopular: false
    },
    {
      name: 'Student Pro All-Access',
      planId: 'Pro',
      price: annualBilling ? '$19' : '$24',
      period: annualBilling ? '/ month (billed $190/yr)' : '/ month',
      desc: 'Unlock unlimited access to every single course, workshop, and certification.',
      features: [
        '✨ Unlimited instant access to ALL courses in the catalog',
        'Direct live video podium access with teachers',
        'Real-time automated gradebook tracking',
        'One-on-one private discussion sessions',
        'Official verified certificates of completion',
        'Offline course materials and code asset downloads'
      ],
      buttonText: currentUser?.isSubscribed ? 'Plan Active (Current)' : 'Activate Pro All-Access Pass',
      buttonStyle: 'bg-totc-teal text-white hover:bg-totc-teal-dark shadow-lg shadow-totc-teal/30',
      isPopular: true
    },
    {
      name: 'Enterprise / Campus',
      planId: 'Enterprise',
      price: annualBilling ? '$89' : '$109',
      period: annualBilling ? '/ seat / month' : '/ seat / month',
      desc: 'Tailored for K-12 school districts, universities, and corporate academies.',
      features: [
        'Full Zoom API & LMS integration (Canvas, Blackboard)',
        'Unlimited student rosters and automated attendance',
        'Dedicated administrative analytics dashboard',
        'Custom institution branding and subdomains',
        '24/7 Priority SLA support & dedicated onboarding'
      ],
      buttonText: 'Activate Enterprise Plan',
      buttonStyle: 'bg-totc-navy text-white hover:bg-slate-800 shadow-lg',
      isPopular: false
    }
  ];

  const handleSelectPlan = (plan) => {
    if (plan.planId === 'Free') {
      if (!currentUser) openAuthModal('register');
      else setActivePage('courses');
      return;
    }

    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    setSelectedPlanModal(plan);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlanModal) return;
    setIsSubscribing(true);
    setErrorMessage('');

    try {
      const billingCycle = annualBilling ? 'annual' : 'monthly';
      const res = await api.subscriptions.subscribe(selectedPlanModal.planId, billingCycle);

      if (onSubscriptionUpdated && res.user) {
        onSubscriptionUpdated(res.user);
      }

      setSubscriptionSuccess(res);
      setTimeout(() => {
        setSelectedPlanModal(null);
        setSubscriptionSuccess(null);
        setActivePage('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to activate subscription. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-4 py-1.5 rounded-full bg-totc-teal-light text-totc-teal font-semibold text-xs tracking-wider uppercase">
            Unlimited Learning Pass
          </span>
          <h1 className="font-poppins font-bold text-3xl sm:text-5xl text-totc-navy leading-tight">
            Simple, All-Access Membership
          </h1>
          <p className="text-totc-gray text-base sm:text-lg">
            Subscribe once and unlock every course, video lesson, and certificate across the entire TOTC platform.
          </p>

          {currentUser?.isSubscribed && (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>You currently have an active {currentUser.subscriptionPlan || 'Pro'} Membership!</span>
            </div>
          )}

          {/* Billing Switch */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <span className={`text-sm font-semibold ${!annualBilling ? 'text-totc-navy' : 'text-totc-gray'}`}>
              Monthly Billing
            </span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative focus:outline-none ${
                annualBilling ? 'bg-totc-teal' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  annualBilling ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-semibold ${annualBilling ? 'text-totc-navy' : 'text-totc-gray'}`}>
                Annual Billing
              </span>
              <span className="bg-totc-orange-light text-totc-orange text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                Save 25%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-[28px] p-8 flex flex-col justify-between border transition-all duration-300 relative ${
                plan.isPopular
                  ? 'border-totc-teal shadow-2xl scale-105 z-10'
                  : 'border-gray-100 shadow-sm hover:shadow-lg'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-totc-orange text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-poppins font-bold text-xl text-totc-navy mb-2">{plan.name}</h3>
                  <p className="text-totc-gray text-xs leading-relaxed">{plan.desc}</p>
                </div>

                <div className="border-t border-b border-gray-100 py-6 space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="font-poppins font-black text-4xl sm:text-5xl text-totc-navy">
                      {plan.price}
                    </span>
                    <span className="text-totc-gray text-xs font-medium">{plan.period}</span>
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-3">
                  <p className="font-poppins font-semibold text-xs text-totc-navy uppercase tracking-wider">
                    What's included:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-xs text-totc-gray">
                        <Check className="w-4 h-4 text-totc-mint shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={currentUser?.isSubscribed && plan.planId === 'Pro'}
                  className={`w-full py-4 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 group ${plan.buttonStyle} ${
                    currentUser?.isSubscribed && plan.planId === 'Pro' ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{plan.buttonText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Subscription Checkout / Activation Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-[28px] p-8 shadow-2xl border border-gray-100 overflow-hidden">
            
            <button
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-totc-navy transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {subscriptionSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-poppins font-bold text-2xl text-totc-navy">
                  Subscription Activated! 🎉
                </h3>
                <p className="text-totc-gray text-sm">
                  {subscriptionSuccess.message}
                </p>
                <p className="text-xs text-totc-teal font-semibold">
                  Redirecting you to your unlocked Student Dashboard...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-totc-teal-light text-totc-teal text-xs font-bold uppercase">
                    <Zap className="w-3.5 h-3.5" />
                    Instant Activation
                  </div>
                  <h3 className="font-poppins font-bold text-2xl text-totc-navy">
                    Confirm {selectedPlanModal.name}
                  </h3>
                  <p className="text-xs text-totc-gray">
                    Unlock immediate and unlimited access to all platform courses.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl">
                    {errorMessage}
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-totc-gray font-medium">Selected Plan:</span>
                    <span className="font-bold text-totc-navy">{selectedPlanModal.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-totc-gray font-medium">Billing Period:</span>
                    <span className="font-bold text-totc-navy">{annualBilling ? 'Annual (12 Months)' : 'Monthly'}</span>
                  </div>
                  <div className="flex items-center justify-between text-base border-t border-gray-200 pt-3">
                    <span className="font-bold text-totc-navy">Amount to Charge:</span>
                    <span className="font-black text-2xl text-totc-teal">
                      {annualBilling ? '$190.00' : '$19.00'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-totc-gray">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Instant sandbox test activation with automatic course unlocks.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Cancel or switch plans anytime from your user settings.</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setSelectedPlanModal(null)}
                    className="px-5 py-2.5 rounded-full text-xs font-semibold text-totc-gray hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSubscription}
                    disabled={isSubscribing}
                    className="px-8 py-3.5 rounded-full font-bold text-sm bg-totc-teal text-white hover:bg-totc-teal-dark shadow-md flex items-center gap-2"
                  >
                    {isSubscribing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Activating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Confirm & Activate Unlimited Access</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}