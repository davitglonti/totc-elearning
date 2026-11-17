import React, { useState } from 'react';
import { X, Star, CheckCircle } from 'lucide-react';

export function AssessmentModal({ isOpen, onClose }) {
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-totc-navy transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-totc-mint mx-auto" />
            <h4 className="font-poppins font-bold text-2xl text-totc-navy">
              გმადლობთ შეფასებისთვის!
            </h4>
            <p className="text-totc-gray text-sm">
              თქვენი შეფასება ეხმარება სტუდენტებსა და მასწავლებლებს აღმოაჩინონ TOTC-ის შესაძლებლობები.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-totc-teal uppercase tracking-wider">
                საზოგადოების უკუკავშირი
              </span>
              <h3 className="font-poppins font-bold text-2xl text-totc-navy mt-1">
                დაწერეთ თქვენი შეფასება
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-totc-navy uppercase mb-2">
                თქვენი რეიტინგი
              </label>
              <div className="flex items-center gap-2 text-totc-orange">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-totc-orange text-totc-orange' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-totc-navy uppercase mb-2">
                თქვენი სახელი, გვარი და სტატუსი
              </label>
              <input
                type="text"
                required
                placeholder="მაგ. მარიამ ჯავახიშვილი (სკოლის მასწავლებელი)"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-totc-navy uppercase mb-2">
                თქვენი გამოცდილება TOTC-თან
              </label>
              <textarea
                required
                rows="4"
                placeholder="როგორ დაგეხმარათ TOTC სწავლისა თუ სწავლების პროცესში?..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-totc-teal"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-totc-teal hover:bg-totc-teal-dark text-white font-semibold text-base transition-colors shadow-md"
            >
              შეფასების გაგზავნა
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default AssessmentModal;
