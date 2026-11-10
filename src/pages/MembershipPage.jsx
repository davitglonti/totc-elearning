import React, { useState } from 'react';
import { Check, Star, ArrowRight, HelpCircle } from 'lucide-react';

export default function MembershipPage({ setActivePage, openAuthModal }) {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      name: 'Free Starter',
      price: '$0',
      period: 'Forever free',
      desc: 'Ideal for casual learners exploring introductory online classes.',
      features: [
        'Access to 250+ free introductory courses',
        'Standard community discussion boards',
        'Mobile and desktop web access',
        'Limited quiz assessments (3 per month)'
      ],
      buttonText: 'Get Started Free',
      buttonStyle: 'bg-gray-100 text-totc-navy hover:bg-gray-200',
      isPopular: false
    },
    {
      name: 'Student Pro',
      price: annualBilling ? '$24' : '$29',
      period: annualBilling ? '/ month (billed annually)' : '/ month',
      desc: 'Everything you need for serious skills development and certifications.',
      features: [
        'Unlimited access to all 5,000+ courses',
        'Direct live video podium access with teachers',
        'Real-time automated gradebook tracking',
        'One-on-one private discussion sessions',
        'Official verified certificates of completion',
        'Offline course downloads on mobile'
      ],
      buttonText: 'Start 14-Day Free Trial',
      buttonStyle: 'bg-totc-teal text-white hover:bg-totc-teal-dark shadow-lg shadow-totc-teal/30',
      isPopular: true
    },
    {
      name: 'Institution / Campus',
      price: annualBilling ? '$89' : '$109',
      period: annualBilling ? '/ instructor / month' : '/ instructor / month',
      desc: 'Tailored for K-12 school districts, universities, and corporate academies.',
      features: [
        'Full Zoom API & LMS integration (Canvas, Blackboard)',
        'Unlimited student rosters and automated attendance',
        'Dedicated administrative analytics dashboard',
        'Custom institution branding and subdomains',
        '24/7 Priority SLA support & dedicated onboarding'
      ],
      buttonText: 'Contact Sales',
      buttonStyle: 'bg-totc-purple text-white hover:bg-totc-navy shadow-lg shadow-totc-purple/20',
      isPopular: false
    }
  ];

  const handleSelectPlan = (plan) => {
    if (plan.name === 'Free Starter') {
      openAuthModal('register');
    } else {
      setActivePage('checkout');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="px-4 py-1.5 rounded-full bg-totc-teal-light text-totc-teal font-semibold text-xs tracking-wider uppercase">
            Flexible Plans
          </span>
          <h1 className="font-poppins font-bold text-3xl sm:text-5xl text-totc-navy leading-tight">
            Simple, Transparent Membership
          </h1>
          <p className="text-totc-gray text-base sm:text-lg">
            Choose the perfect plan for individual learning, teaching, or campus-wide classroom deployments.
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
              <span className="px-2.5 py-0.5 rounded-full bg-totc-orange text-white text-[11px] font-bold">
                Save 20%
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-24">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-[28px] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 relative bg-white border ${
                p.isPopular
                  ? 'border-totc-teal shadow-2xl scale-[1.02] z-10'
                  : 'border-gray-200 shadow-sm hover:shadow-xl'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-totc-teal text-white text-xs font-bold uppercase tracking-wider shadow-md">
                    Most Popular Choice
                  </span>
                </div>
              )}

              <div>
                <h3 className="font-poppins font-bold text-2xl text-totc-navy mb-2">
                  {p.name}
                </h3>
                <p className="text-totc-gray text-sm leading-relaxed mb-6">
                  {p.desc}
                </p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="font-poppins font-bold text-5xl text-totc-purple">
                      {p.price}
                    </span>
                    <span className="text-totc-gray text-xs font-medium">
                      {p.period}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 mb-8">
                  <div className="text-xs font-semibold text-totc-navy uppercase tracking-wider">
                    Included Features:
                  </div>
                  {p.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-totc-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-totc-teal" />
                      </div>
                      <span className="text-sm text-totc-gray leading-relaxed">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelectPlan(p)}
                className={`w-full py-4 rounded-full font-semibold text-base transition-all active:scale-98 ${p.buttonStyle}`}
              >
                {p.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6 pt-12 border-t border-gray-200">
          <div className="text-center space-y-2 mb-10">
            <h2 className="font-poppins font-bold text-3xl text-totc-navy">
              Frequently Asked Questions
            </h2>
            <p className="text-totc-gray text-sm">
              Have questions about our plans? We have answers.
            </p>
          </div>

          {[
            { q: 'Can I cancel or switch my membership plan at any time?', a: 'Yes! You can upgrade, downgrade, or cancel your subscription directly from your account settings at any moment without penalty.' },
            { q: 'Does TOTC require a separate Zoom Pro license?', a: 'No. All TOTC student accounts include access to licensed classroom sessions hosted by your certified instructors without requiring an individual paid Zoom license.' },
            { q: 'Are educational discounts available for verified schools?', a: 'Yes, we offer special volume pricing and grants for accredited K-12 public schools, non-profits, and educational charities.' }
          ].map((faq, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <h4 className="font-poppins font-semibold text-lg text-totc-navy flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-totc-teal shrink-0" />
                {faq.q}
              </h4>
              <p className="text-totc-gray text-sm leading-relaxed pl-7">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
