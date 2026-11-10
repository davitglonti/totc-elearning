import React, { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

export default function CheckoutPage({ setActivePage }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [coupon, setCoupon] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const basePrice = 450;
  const discount = discountApplied ? 90 : 0;
  const total = basePrice - discount;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (coupon.trim().toLowerCase() === 'totc' || coupon.trim().toLowerCase() === 'totc2026') {
      setDiscountApplied(true);
    } else {
      alert('Try promo code: TOTC');
    }
  };

  const handleCompleteOrder = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="pt-36 pb-28 bg-[#F8FAFC] min-h-[80vh] flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-[28px] p-10 text-center shadow-2xl border border-gray-100 space-y-6">
          <div className="w-20 h-20 rounded-full bg-totc-teal/10 flex items-center justify-center mx-auto text-totc-teal">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h2 className="font-poppins font-bold text-3xl text-totc-navy">
            Enrollment Confirmed!
          </h2>

          <p className="text-totc-gray text-sm leading-relaxed">
            Congratulations! You now have full lifetime access to your courses and live virtual classroom sessions.
          </p>

          <div className="p-4 rounded-xl bg-gray-50 text-left text-xs text-totc-gray space-y-1">
            <div className="flex justify-between">
              <span>Order Number:</span> <span className="font-semibold text-totc-navy">#TOTC-92841</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span> <span className="font-semibold text-totc-teal">${total}.00</span>
            </div>
          </div>

          <button
            onClick={() => {
              setActivePage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full py-3.5 rounded-full bg-totc-teal text-white font-semibold hover:bg-totc-teal-dark transition-colors shadow-md"
          >
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        
        {/* Back Button */}
        <button
          onClick={() => {
            setActivePage('courses');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 text-totc-teal hover:text-totc-navy transition-colors font-medium text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to courses</span>
        </button>

        <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-navy mb-10">
          Secure Checkout & Enrollment
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Payment & Billing Left (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Payment Method Selector */}
            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-poppins font-semibold text-xl text-totc-navy">
                Select Payment Method
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-totc-teal bg-totc-teal/5 text-totc-teal font-semibold'
                      : 'border-gray-200 text-totc-gray hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-sm">Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-totc-teal bg-totc-teal/5 text-totc-teal font-semibold'
                      : 'border-gray-200 text-totc-gray hover:bg-gray-50'
                  }`}
                >
                  <span className="font-black text-xl italic tracking-tighter">PayPal</span>
                  <span className="text-sm">Instant Checkout</span>
                </button>
              </div>

              {/* Card Form */}
              <form id="checkout-form" onSubmit={handleCompleteOrder} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-totc-navy uppercase mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-totc-navy uppercase mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                    />
                    <CreditCard className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-totc-navy uppercase mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-totc-navy uppercase mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      placeholder="123"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 text-xs text-totc-gray">
              <Lock className="w-5 h-5 text-totc-mint shrink-0" />
              <span>Payments are encrypted with 256-bit bank-grade SSL security. Your financial data is never stored on our servers.</span>
            </div>
          </div>

          {/* Order Summary Right (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 rounded-[24px] border border-gray-100 shadow-xl space-y-6">
              <h3 className="font-poppins font-semibold text-xl text-totc-navy">
                Order Summary
              </h3>

              {/* Item preview */}
              <div className="flex gap-4 items-center pb-6 border-b border-gray-100">
                <img
                  src="/assets/explore_row_1.png"
                  alt="AWS Certified Solutions Architect"
                  className="w-20 h-14 rounded-lg object-cover border"
                />
                <div>
                  <h4 className="font-medium text-totc-navy text-sm line-clamp-1">
                    AWS Certified Solutions Architect
                  </h4>
                  <span className="text-xs text-totc-gray">Lifetime Access • 32 Hours</span>
                </div>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Coupon code (try: TOTC)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-totc-navy text-xs font-semibold transition-colors"
                >
                  Apply
                </button>
              </form>

              {discountApplied && (
                <p className="text-xs text-totc-mint font-medium">
                  Promo code "TOTC" applied: $90 discount!
                </p>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm text-totc-gray pt-2">
                <div className="flex justify-between">
                  <span>Course Original Price:</span>
                  <span className="text-totc-navy font-medium">${basePrice}.00</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-totc-mint">
                    <span>Discount:</span>
                    <span>-${discount}.00</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-100 text-lg font-bold text-totc-purple">
                  <span>Total Due:</span>
                  <span>${total}.00</span>
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={processing}
                className="w-full py-4 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-semibold text-lg transition-colors shadow-lg shadow-totc-teal/20 active:scale-98 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <span>Complete Purchase (${total}.00)</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-totc-gray pt-2">
                <ShieldCheck className="w-4 h-4 text-totc-teal" />
                <span>30-Day Full Refund Guarantee</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
