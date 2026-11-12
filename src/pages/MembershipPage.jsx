import React, { useState } from 'react';
import { 
  Check, Star, ArrowRight, HelpCircle, Sparkles, ShieldCheck, 
  Zap, X, CreditCard, Calendar, Clock, AlertTriangle, Download, 
  BookOpen, ExternalLink, RefreshCw, Lock, User, Shield, CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function MembershipPage({ setActivePage, openAuthModal, currentUser, onSubscriptionUpdated }) {
  const [annualBilling, setAnnualBilling] = useState(true);
  const [selectedPlanModal, setSelectedPlanModal] = useState(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [viewOtherPlans, setViewOtherPlans] = useState(false);

  // Real Payment / Checkout form state
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'paypal', 'googlepay'
  const [cardData, setCardData] = useState({
    cardholderName: currentUser?.fullName || '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    postalCode: ''
  });

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
      buttonText: 'Current Free Tier',
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
      buttonText: 'Activate Pro All-Access Pass',
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

    // Initialize cardholder name from current user
    setCardData(prev => ({
      ...prev,
      cardholderName: prev.cardholderName || currentUser.fullName || ''
    }));
    setErrorMessage('');
    setSelectedPlanModal(plan);
  };

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setCardData(prev => ({ ...prev, cardNumber: formatted }));
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setCardData(prev => ({ ...prev, cardExpiry: raw }));
  };

  const handleCvcChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData(prev => ({ ...prev, cardCvc: raw }));
  };

  const handleConfirmSubscription = async (e) => {
    if (e) e.preventDefault();
    if (!selectedPlanModal) return;
    setErrorMessage('');

    if (paymentMethod === 'card') {
      const cleanNum = cardData.cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 13) {
        setErrorMessage('გთხოვთ შეიყვანოთ ბარათის ვალიდური ნომერი (16 ციფრი).');
        return;
      }
      if (!cardData.cardholderName.trim()) {
        setErrorMessage('გთხოვთ მიუთითოთ ბარათის მფლობელის სახელი და გვარი.');
        return;
      }
      if (cardData.cardExpiry.length < 5) {
        setErrorMessage('გთხოვთ მიუთითოთ ბარათის მოქმედების ვადა (MM/YY).');
        return;
      }
      if (cardData.cardCvc.length < 3) {
        setErrorMessage('გთხოვთ მიუთითოთ ბარათის CVC კოდი (3 ციფრი).');
        return;
      }
    }

    setIsSubscribing(true);

    try {
      const billingCycle = annualBilling ? 'annual' : 'monthly';
      const res = await api.subscriptions.subscribe(selectedPlanModal.planId, billingCycle, {
        paymentMethod,
        cardNumber: cardData.cardNumber,
        cardholderName: cardData.cardholderName,
        cardExpiry: cardData.cardExpiry,
        cardCvc: cardData.cardCvc,
        postalCode: cardData.postalCode
      });

      if (onSubscriptionUpdated && res.user) {
        onSubscriptionUpdated(res.user);
      }

      setSubscriptionSuccess(res);
      setTimeout(() => {
        setSelectedPlanModal(null);
        setSubscriptionSuccess(null);
        setActivePage('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2500);
    } catch (err) {
      setErrorMessage(err.message || 'გადახდა ვერ განხორციელდა. გთხოვთ გადაამოწმოთ ბარათის მონაცემები.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await api.subscriptions.cancel();
      const updatedUser = {
        ...currentUser,
        isSubscribed: false,
        subscriptionPlan: 'None',
        subscriptionExpiresAt: null
      };
      if (onSubscriptionUpdated) {
        onSubscriptionUpdated(updatedUser);
      }
      setShowCancelModal(false);
    } catch (err) {
      alert(err.message || 'Failed to cancel subscription.');
    } finally {
      setIsCancelling(false);
    }
  };

  const formattedExpiryDate = currentUser?.subscriptionExpiresAt
    ? new Date(currentUser.subscriptionExpiresAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Next billing cycle (30 days)';

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* =====================================================================
            VIEW A: ACTIVE SUBSCRIBER MANAGEMENT HUB (When user is PRO)
            ===================================================================== */}
        {currentUser?.isSubscribed && !viewOtherPlans ? (
          <div className="space-y-10 animate-in fade-in duration-300">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-gray-200">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Subscription & Billing Hub
                </div>
                <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-navy">
                  Membership & Billing
                </h1>
                <p className="font-poppins text-totc-gray text-base">
                  Manage your active Pro All-Access pass, billing payment methods, and invoices.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setActivePage('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-6 py-3.5 rounded-full font-bold text-sm bg-totc-teal text-white hover:bg-totc-teal-dark shadow-md flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Go to My Learning</span>
                </button>
              </div>
            </div>

            {/* Active Subscription Hero Card */}
            <div className="bg-gradient-to-r from-totc-navy via-[#252b4a] to-totc-teal rounded-[32px] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Left side details */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1 rounded-full bg-amber-400 text-totc-navy font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow">
                      <Sparkles className="w-3.5 h-3.5 fill-totc-navy" />
                      Active Plan
                    </span>
                    <span className="text-white/80 text-xs font-medium">
                      Renews on {formattedExpiryDate}
                    </span>
                  </div>

                  <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-white">
                    Student Pro All-Access Pass
                  </h2>

                  <p className="text-white/85 text-sm sm:text-base max-w-2xl leading-relaxed">
                    You have complete, unrestricted access to all 42+ courses, lecture videos, downloadable project source files, and verified certificates of completion.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
                      <p className="text-xs text-white/70">Current Price</p>
                      <p className="font-poppins font-bold text-xl text-white">$19.00 / month</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
                      <p className="text-xs text-white/70">Payment Method</p>
                      <p className="font-poppins font-bold text-base text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-totc-cyan" />
                        <span>•••• 4242</span>
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
                      <p className="text-xs text-white/70">All Courses Status</p>
                      <p className="font-poppins font-bold text-base text-emerald-300 flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        <span>100% Unlocked</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side quick actions */}
                <div className="lg:col-span-4 flex flex-col gap-3 sm:items-end">
                  <button
                    onClick={() => {
                      setActivePage('dashboard');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm bg-white text-totc-navy hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-2 group"
                  >
                    <span>Browse Unlocked Courses</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold text-white/70 hover:text-red-300 hover:bg-white/10 transition-colors"
                  >
                    Cancel Subscription
                  </button>
                </div>

              </div>

              {/* Ambient visual background glow */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-totc-teal/30 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Invoices and Billing History */}
            <div className="bg-white rounded-[28px] border border-gray-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-poppins font-bold text-xl text-totc-navy">Billing History & Invoices</h3>
                  <p className="text-xs text-totc-gray">Download past receipts and view transaction status.</p>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  Account in Good Standing
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-totc-gray">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-totc-navy">
                    <tr>
                      <th className="px-6 py-3.5">Invoice</th>
                      <th className="px-6 py-3.5">Billing Date</th>
                      <th className="px-6 py-3.5">Plan Description</th>
                      <th className="px-6 py-3.5">Amount</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-semibold text-totc-navy">#INV-2026-0941</td>
                      <td className="px-6 py-4 text-xs">Today</td>
                      <td className="px-6 py-4 text-xs font-medium text-totc-navy">Student Pro All-Access Membership</td>
                      <td className="px-6 py-4 font-bold text-totc-navy">$19.00</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                          Paid
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs font-semibold text-totc-teal hover:underline flex items-center gap-1 ml-auto">
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Switch to Enterprise or Compare Plans Banner */}
            <div className="p-6 rounded-[24px] bg-slate-100/80 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="font-poppins font-bold text-base text-totc-navy">Need Team or Campus Deployment?</h4>
                <p className="text-xs text-totc-gray">
                  Upgrade to Enterprise for unlimited student seats, custom LMS integrations, and admin SLA support.
                </p>
              </div>

              <button
                onClick={() => setViewOtherPlans(true)}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-totc-navy border border-gray-300 hover:bg-gray-50 shadow-sm shrink-0"
              >
                Compare Other Tiers
              </button>
            </div>

          </div>
        ) : (

          /* =====================================================================
             VIEW B: PUBLIC MEMBERSHIP PRICING TIERS (When not subscribed)
             ===================================================================== */
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-4">
              {viewOtherPlans && (
                <button
                  onClick={() => setViewOtherPlans(false)}
                  className="mb-2 text-xs font-bold text-totc-teal hover:underline flex items-center gap-1 mx-auto"
                >
                  ← Back to My Subscription Management
                </button>
              )}

              <span className="px-4 py-1.5 rounded-full bg-totc-teal-light text-totc-teal font-semibold text-xs tracking-wider uppercase">
                Unlimited Learning Pass
              </span>
              <h1 className="font-poppins font-bold text-3xl sm:text-5xl text-totc-navy leading-tight">
                Simple, All-Access Membership
              </h1>
              <p className="text-totc-gray text-base sm:text-lg">
                Subscribe once and unlock every course, video lesson, and certificate across the entire TOTC platform.
              </p>

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
                      className={`w-full py-4 rounded-full font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 group ${plan.buttonStyle}`}
                    >
                      <span>{plan.buttonText}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* Subscription Checkout / Payment Modal */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-gray-100 overflow-hidden my-8">
            
            <button
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-totc-navy transition-colors z-10"
              aria-label="დახურვა"
            >
              <X className="w-5 h-5" />
            </button>

            {subscriptionSuccess ? (
              <div className="py-8 text-center space-y-5 animate-in zoom-in-95">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                    გადახდა დამოწმებულია ✓
                  </span>
                  <h3 className="font-poppins font-black text-2xl sm:text-3xl text-totc-navy">
                    Pro All-Access გააქტიურებულია! 🎉
                  </h3>
                  <p className="text-totc-gray text-xs sm:text-sm max-w-md mx-auto pt-1">
                    {subscriptionSuccess.message || 'გილოცავთ! თქვენ მიიღეთ ულიმიტო წვდომა ყველა კურსზე, ვიდეო ლექციაზე და ოფიციალურ სერტიფიკატებზე.'}
                  </p>
                </div>

                {subscriptionSuccess.order && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-left max-w-md mx-auto space-y-2">
                    <div className="flex justify-between text-totc-gray font-medium">
                      <span>შეკვეთის # ID:</span>
                      <span className="font-mono font-bold text-totc-navy">{subscriptionSuccess.order.id}</span>
                    </div>
                    <div className="flex justify-between text-totc-gray font-medium">
                      <span>გადახდილი თანხა:</span>
                      <span className="font-bold text-emerald-600">${subscriptionSuccess.order.totalAmount?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-totc-gray font-medium">
                      <span>სტატუსი:</span>
                      <span className="font-bold text-emerald-600">Paid & Verified</span>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 text-xs text-totc-teal font-semibold">
                    <div className="w-4 h-4 border-2 border-totc-teal border-t-transparent rounded-full animate-spin" />
                    <span>გადამისამართება სტუდენტის მართვის პანელზე...</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmSubscription} className="space-y-5">
                {/* Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-totc-teal-light text-totc-teal text-[11px] font-bold uppercase tracking-wider">
                      <Lock className="w-3 h-3" />
                      უსაფრთხო გადახდა
                    </span>
                    <span className="text-xs text-totc-gray font-medium">256-Bit SSL Checkout</span>
                  </div>
                  <h3 className="font-poppins font-black text-2xl text-totc-navy">
                    {selectedPlanModal.name} – გამოწერა
                  </h3>
                  <p className="text-xs text-totc-gray">
                    შეიყვანეთ საბანკო ბარათის მონაცემები ულიმიტო წვდომის მყისიერი გააქტიურებისთვის.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Plan Price Summary Card */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-emerald-50/40 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-totc-gray font-medium">არჩეული ტარიფი</div>
                    <div className="text-sm font-bold text-totc-navy flex items-center gap-1.5">
                      <span>{selectedPlanModal.name}</span>
                      <span className="text-[10px] font-semibold text-totc-teal bg-totc-teal-light px-2 py-0.5 rounded-full">
                        {annualBilling ? 'წლიური (დაზოგე 25%)' : 'თვიური'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-totc-gray font-medium">გადასახდელი თანხა</div>
                    <div className="text-2xl font-black text-totc-teal">
                      {annualBilling ? '$190.00' : '$19.00'}
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-totc-navy uppercase tracking-wider">
                    გადახდის მეთოდი
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-totc-teal bg-totc-teal-light/40 text-totc-teal font-bold shadow-sm ring-1 ring-totc-teal'
                          : 'border-gray-200 hover:border-gray-300 text-totc-gray font-medium'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xs">საბანკო ბარათი</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-totc-teal bg-totc-teal-light/40 text-totc-teal font-bold shadow-sm ring-1 ring-totc-teal'
                          : 'border-gray-200 hover:border-gray-300 text-totc-gray font-medium'
                      }`}
                    >
                      <span className="font-black text-blue-600 text-sm">PayPal</span>
                      <span className="text-[11px]">PayPal Checkout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('googlepay')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                        paymentMethod === 'googlepay'
                          ? 'border-totc-teal bg-totc-teal-light/40 text-totc-teal font-bold shadow-sm ring-1 ring-totc-teal'
                          : 'border-gray-200 hover:border-gray-300 text-totc-gray font-medium'
                      }`}
                    >
                      <span className="font-black text-totc-navy text-sm">G Pay</span>
                      <span className="text-[11px]">Google Pay</span>
                    </button>
                  </div>
                </div>

                {/* Card Fields Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3.5 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/80">
                    
                    {/* Fast Fill Demo Button */}
                    <div className="flex items-center justify-between pb-1 border-b border-gray-200/60">
                      <span className="text-[11px] font-semibold text-totc-gray flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-totc-teal" />
                        ბარათის მონაცემები (Visa / Mastercard)
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setCardData({
                            cardholderName: currentUser?.fullName || 'Davit Glonti',
                            cardNumber: '4242 4242 4242 4242',
                            cardExpiry: '12/28',
                            cardCvc: '888',
                            postalCode: '0179'
                          });
                        }}
                        className="text-[11px] font-bold text-totc-teal hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        ტესტ ბარათის შევსება
                      </button>
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-xs font-semibold text-totc-navy mb-1">
                        ბარათის მფლობელი (Cardholder Name)
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-totc-gray" />
                        <input
                          type="text"
                          required
                          placeholder="მაგ: Davit Glonti"
                          value={cardData.cardholderName}
                          onChange={(e) => setCardData(prev => ({ ...prev, cardholderName: e.target.value }))}
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-medium text-totc-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-totc-teal/30 focus:border-totc-teal"
                        />
                      </div>
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-xs font-semibold text-totc-navy mb-1">
                        ბარათის ნომერი (Card Number)
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-totc-gray" />
                        <input
                          type="text"
                          required
                          maxLength={19}
                          placeholder="4242 •••• •••• 4242"
                          value={cardData.cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full pl-10 pr-16 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-medium text-totc-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-totc-teal/30 focus:border-totc-teal"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-black text-totc-navy bg-gray-100 px-1.5 py-0.5 rounded">
                          VISA/MC
                        </div>
                      </div>
                    </div>

                    {/* Expiry & CVC & Postal Code */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-xs font-semibold text-totc-navy mb-1">
                          ვადა (MM/YY)
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={5}
                          placeholder="12/28"
                          value={cardData.cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-medium text-totc-navy text-center placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-totc-teal/30 focus:border-totc-teal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-totc-navy mb-1 flex items-center justify-between">
                          <span>CVC / CVV</span>
                          <Lock className="w-3 h-3 text-totc-gray" />
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="•••"
                          value={cardData.cardCvc}
                          onChange={handleCvcChange}
                          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-medium text-totc-navy text-center placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-totc-teal/30 focus:border-totc-teal"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-totc-navy mb-1">
                          ZIP / საფოსტო
                        </label>
                        <input
                          type="text"
                          placeholder="0179"
                          value={cardData.postalCode}
                          onChange={(e) => setCardData(prev => ({ ...prev, postalCode: e.target.value }))}
                          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-medium text-totc-navy text-center placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-totc-teal/30 focus:border-totc-teal"
                        />
                      </div>
                    </div>

                  </div>
                )}

                {paymentMethod !== 'card' && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2">
                    <p className="text-xs text-totc-gray font-medium">
                      თქვენ გადამისამართდებით {paymentMethod === 'paypal' ? 'PayPal-ის' : 'Google Pay-ს'} დაცულ გვერდზე ავტორიზაციისა და გადახდის დასადასტურებლად.
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold">
                      ✓ თანხის ჩამოჭრის შემდეგ Pro All-Access გააქტიურდება მყისიერად.
                    </p>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="pt-1 flex items-center justify-between text-[11px] text-totc-gray border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>PCI-DSS Level 1 დაცული</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-totc-teal" />
                    <span>30-დღიანი თანხის დაბრუნების გარანტია</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPlanModal(null)}
                    className="px-5 py-3 rounded-full text-xs font-semibold text-totc-gray hover:bg-gray-100 transition-colors"
                  >
                    გაუქმება
                  </button>
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="flex-1 sm:flex-none px-8 py-3.5 rounded-full font-bold text-sm bg-totc-teal text-white hover:bg-totc-teal-dark shadow-lg shadow-totc-teal/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 cursor-pointer"
                  >
                    {isSubscribing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>გადახდა მუშავდება...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>
                          გადახდა ({annualBilling ? '$190.00' : '$19.00'}) & გააქტიურება
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-8 shadow-2xl border border-gray-100 space-y-6">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-poppins font-bold text-xl text-totc-navy">
                Cancel Pro Subscription?
              </h3>
              <p className="text-xs text-totc-gray leading-relaxed">
                If you cancel, you will lose unlimited access to all 42+ courses, live classroom podiums, and completion certificates.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 rounded-full text-xs font-bold bg-gray-100 text-totc-navy hover:bg-gray-200 transition-colors"
              >
                Keep My Plan
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={isCancelling}
                className="flex-1 py-3 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-sm transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}