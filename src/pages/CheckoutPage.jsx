import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, Lock, ArrowLeft, AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function CheckoutPage({ setActivePage, selectedCourse, currentUser }) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountMessage, setDiscountMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  // Form inputs
  const [cardholderName, setCardholderName] = useState(currentUser?.fullName || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');

  // Course details resolution
  const course = selectedCourse || {
    id: 'a027e9f8-f06e-48c6-8fab-58222f839625',
    courseId: 'a027e9f8-f06e-48c6-8fab-58222f839625',
    title: 'AWS Certified Solutions Architect & Cloud Operations',
    price: 450,
    thumbnailUrl: '/assets/explore_row_1.png',
    instructorName: 'Lina Wilson'
  };

  const courseId = course.id || course.courseId;
  const rawPrice = course.price !== undefined ? parseFloat(String(course.price).replace(/[^0-9.]/g, '')) || 99 : 99;
  const basePrice = Math.max(0, rawPrice);
  const discountAmount = discountPercent > 0 ? Math.round((basePrice * discountPercent) / 100) : 0;
  const totalDue = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanCoupon = coupon.trim().toUpperCase();
    if (!cleanCoupon) return;

    try {
      const res = await api.promoCodes.validate(cleanCoupon, basePrice, courseId);
      if (res && res.valid) {
        setDiscountPercent(res.discountPercentage || 20);
        setDiscountMessage(res.message || `პრომოკოდი "${cleanCoupon}" გააქტიურდა: ${res.discountPercentage}% ფასდაკლება!`);
        setErrorMessage('');
      } else {
        setErrorMessage(res?.message || 'არასწორი პრომოკოდი. სცადეთ: TOTC (20% ფასდაკლება)');
        setDiscountPercent(0);
        setDiscountMessage('');
      }
    } catch {
      // Fallback local evaluation if offline
      if (cleanCoupon === 'TOTC' || cleanCoupon === 'TOTC2026') {
        setDiscountPercent(20);
        setDiscountMessage(`პრომოკოდი "${cleanCoupon}" გააქტიურდა: 20% ფასდაკლება!`);
      } else if (cleanCoupon === 'WELCOME50') {
        setDiscountPercent(50);
        setDiscountMessage(`პრომოკოდი "${cleanCoupon}" გააქტიურდა: 50% ფასდაკლება!`);
      } else {
        setErrorMessage('არასწორი პრომოკოდი. სცადეთ: TOTC (20% ფასდაკლება)');
        setDiscountPercent(0);
        setDiscountMessage('');
      }
    }
  };

  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const effectiveUser = currentUser || api.auth.getCurrentUser();
    if (!effectiveUser) {
      setErrorMessage('შეძენის დასასრულებლად გთხოვთ გაიაროთ ავტორიზაცია ან რეგისტრაცია.');
      return;
    }

    setProcessing(true);

    try {
      // 1. Initialize real backend checkout session
      const checkoutRes = await api.payments.createCheckout(
        courseId,
        discountPercent > 0 ? coupon.trim() : null
      );

      // 2. Automatically register course enrollment for student
      try {
        await api.enrollments.enroll(courseId);
      } catch (enrollErr) {
        // May already be enrolled or requires webhook confirmation
        console.warn('Enrollment API response note:', enrollErr.message);
      }

      setSuccessOrder({
        orderId: checkoutRes.orderId || `ORD-${Date.now().toString(36).toUpperCase()}`,
        transactionId: checkoutRes.transactionId || `TXN-${Date.now()}`,
        amount: checkoutRes.amount ?? totalDue,
        currency: checkoutRes.currency || 'GEL',
        course: course
      });
    } catch (err) {
      setErrorMessage(err.message || 'გადახდის დამუშავება ვერ მოხერხდა. შეამოწმეთ მონაცემები.');
    } finally {
      setProcessing(false);
    }
  };

  if (successOrder) {
    return (
      <div className="pt-36 pb-28 bg-[#F8FAFC] min-h-[80vh] flex items-center justify-center font-poppins">
        <div className="max-w-md w-full bg-white rounded-[28px] p-8 sm:p-10 text-center shadow-2xl border border-gray-100 space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              გადახდა დადასტურებულია
            </span>
            <h2 className="font-poppins font-black text-2xl sm:text-3xl text-totc-navy tracking-tight">
              კურსზე ჩარიცხვა წარმატებულია!
            </h2>
            <p className="text-totc-gray text-xs sm:text-sm leading-relaxed">
              გილოცავთ! თქვენ გაქვთ სრული წვდომა კურსზე <strong>{successOrder.course.title}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-left text-xs space-y-2 text-totc-gray">
            <div className="flex justify-between">
              <span>ტრანზაქციის კოდი:</span>
              <span className="font-mono font-bold text-totc-navy truncate max-w-[180px]">
                {successOrder.transactionId}
              </span>
            </div>
            <div className="flex justify-between">
              <span>გადახდილი თანხა:</span>
              <span className="font-bold text-emerald-600">
                ₾{successOrder.amount}.00
              </span>
            </div>
            <div className="flex justify-between">
              <span>წვდომის დონე:</span>
              <span className="font-semibold text-totc-navy">მუდმივი სრული წვდომა</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => {
                setActivePage('course-player', successOrder.course);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-3.5 rounded-full bg-totc-teal text-white font-bold text-sm hover:bg-totc-teal-dark transition-all shadow-lg shadow-totc-teal/20 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>სასწავლო ოთახში გადასვლა</span>
            </button>

            <button
              onClick={() => {
                setActivePage('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-3 rounded-full bg-gray-100 text-totc-navy font-semibold text-xs hover:bg-gray-200 transition-colors"
            >
              ჩემს კაბინეტში დაბრუნება
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC] font-poppins">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        {/* Back Button */}
        <button
          onClick={() => {
            setActivePage('course-detail', course);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 text-totc-teal hover:text-totc-navy transition-colors font-medium text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>კურსის გვერდზე დაბრუნება</span>
        </button>

        <h1 className="font-poppins font-black text-3xl sm:text-4xl text-totc-navy tracking-tight mb-8">
          დაცული გადახდა და შეკვეთის გაფორმება
        </h1>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Payment & Billing Left (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Payment Method Selector */}
            <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-100 shadow-sm space-y-6">
              <h3 className="font-poppins font-bold text-xl text-totc-navy">
                აირჩიეთ გადახდის მეთოდი
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-totc-teal bg-totc-teal/5 text-totc-teal font-semibold shadow-sm'
                      : 'border-gray-200 text-totc-gray hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="text-xs sm:text-sm">საბანკო ბარათი</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-totc-teal bg-totc-teal/5 text-totc-teal font-semibold shadow-sm'
                      : 'border-gray-200 text-totc-gray hover:bg-gray-50'
                  }`}
                >
                  <span className="font-black text-xl italic tracking-tighter text-blue-800">PayPal</span>
                  <span className="text-xs sm:text-sm">მომენტალური გადახდა</span>
                </button>
              </div>

              {/* Card Form */}
              <form id="checkout-form" onSubmit={handleCompleteOrder} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-totc-navy uppercase mb-1">
                    ბარათის მფლობელის სახელი
                  </label>
                  <input
                    type="text"
                    required
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="გიორგი ბერიძე"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-totc-navy uppercase mb-1">
                    ბარათის ნომერი
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4000 1234 5678 9010"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal font-mono"
                    />
                    <CreditCard className="absolute right-4 top-3.5 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-totc-navy uppercase mb-1">
                      მოქმედების ვადა
                    </label>
                    <input
                      type="text"
                      required
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-totc-navy uppercase mb-1">
                      CVC / CVV კოდი
                    </label>
                    <input
                      type="password"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      maxLength={4}
                      placeholder="123"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal font-mono"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 text-xs text-totc-gray shadow-sm">
              <Lock className="w-5 h-5 text-totc-mint shrink-0" />
              <span>გადახდები დაცულია 256-ბიტიანი SSL დაშიფვრით. ბარათის მონაცემები არ ინახება ჩვენს სერვერებზე.</span>
            </div>
          </div>

          {/* Order Summary Right (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[24px] border border-gray-100 shadow-xl space-y-6">
              <h3 className="font-poppins font-bold text-xl text-totc-navy">
                შეკვეთის შეჯამება
              </h3>

              {/* Item preview */}
              <div className="flex gap-4 items-center pb-6 border-b border-gray-100">
                <img
                  src={course.thumbnailUrl || '/assets/explore_row_1.png'}
                  alt={course.title}
                  className="w-20 h-14 rounded-lg object-cover border shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="font-semibold text-totc-navy text-sm line-clamp-1">
                    {course.title}
                  </h4>
                  <span className="text-xs text-totc-gray block truncate">
                    ინსტრუქტორი: {course.instructorName || course.instructor || 'სერტიფიცირებული სპეციალისტი'}
                  </span>
                </div>
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="პრომოკოდი (მაგ. TOTC)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-totc-teal uppercase font-mono"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-totc-navy text-xs font-bold transition-colors shrink-0"
                >
                  გამოყენება
                </button>
              </form>

              {discountMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{discountMessage}</span>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm text-totc-gray pt-2">
                <div className="flex justify-between">
                  <span>კურსის ღირებულება:</span>
                  <span className="text-totc-navy font-semibold">₾{basePrice}.00</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>ფასდაკლება ({discountPercent}%):</span>
                    <span>-₾{discountAmount}.00</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-gray-100 text-lg font-black text-totc-purple">
                  <span>სულ გადასახდელი:</span>
                  <span>₾{totalDue}.00</span>
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={processing}
                className="w-full py-4 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-bold text-base transition-all shadow-lg shadow-totc-teal/20 active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <span>გადახდის დამუშავება...</span>
                ) : (
                  <span>გადახდის დასრულება (₾{totalDue}.00)</span>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-totc-gray pt-2">
                <ShieldCheck className="w-4 h-4 text-totc-teal" />
                <span>თანხის დაბრუნების 30-დღიანი გარანტია</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
