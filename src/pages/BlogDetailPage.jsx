import React from 'react';
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, Heart, ThumbsUp } from 'lucide-react';

export default function BlogDetailPage({ setActivePage }) {
  return (
    <div className="pt-32 pb-24 bg-[#F8FAFC]">
      <div className="max-w-[960px] mx-auto px-6 md:px-12">
        
        {/* Back Button */}
        <button
          onClick={() => {
            setActivePage('blog');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-2 text-totc-teal hover:text-totc-navy transition-colors font-medium text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all articles</span>
        </button>

        {/* Article Header */}
        <div className="space-y-4 mb-8">
          <span className="px-3.5 py-1 rounded-full bg-totc-teal-light text-totc-teal font-semibold text-xs uppercase tracking-wider">
            NEWS & FUNDING
          </span>

          <h1 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-navy leading-tight">
            Class adds $30 million to its balance sheet for a Zoom-friendly edtech solution
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-b border-gray-200 pb-6 text-sm text-totc-gray">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="Author"
                className="w-10 h-10 rounded-full object-cover border border-totc-teal"
              />
              <div>
                <span className="font-semibold text-totc-navy block">Michael Chasen</span>
                <span className="text-xs text-totc-gray">Co-founder & CEO</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Nov 8, 2026</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 5 min read</span>
            </div>
          </div>
        </div>

        {/* Hero Photo */}
        <div className="rounded-[28px] overflow-hidden shadow-2xl mb-12">
          <img
            src="/assets/news_laptop.png"
            alt="Class in action on a laptop"
            className="w-full h-[360px] sm:h-[480px] object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-lg max-w-none text-totc-gray space-y-6 leading-relaxed font-nunito text-base sm:text-lg">
          <p className="font-semibold text-totc-navy text-xl leading-relaxed">
            Class, launched to bring specialized school management and active engagement tools directly inside Zoom meetings, announced today that it has secured $30 million in Series A funding.
          </p>

          <p>
            Traditional video conferencing platforms were built for business meetings, not pedagogical engagement. In a typical corporate call, having participants silent on mute works well. However, in an academic environment, instructors require dedicated podium views, automatic attendance rosters, real-time proctored quizzes, and private breakout rooms for one-on-one interventions.
          </p>

          {/* Key Quote / Callout */}
          <div className="my-8 p-8 rounded-2xl bg-totc-teal-light border-l-4 border-totc-teal text-totc-navy font-poppins font-medium text-lg sm:text-xl italic">
            "We aren't trying to replace Zoom; we're elevating it into an intuitive, high-fidelity digital campus where learning feels just as engaging as being in a real classroom."
          </div>

          <h2 className="font-poppins font-bold text-2xl sm:text-3xl text-totc-navy pt-4">
            Solving the Engagement Gap with Native EdTech Workflows
          </h2>

          <p>
            The newly secured capital will be utilized to double the engineering team and expand international deployments across school districts in Europe, North America, and Asia. Features currently rolling out include:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Automated Attendance & Roster Sync:</strong> Instructors no longer manually verify attendance—student arrival times and duration are automatically recorded into the school SIS.</li>
            <li><strong>Podium & Front-of-Class Placement:</strong> Teaching assistants, co-professors, and presenting students can be pinned prominently without disturbing the class grid.</li>
            <li><strong>Instant Formative Assessments:</strong> Teachers can launch quick true/false or multiple-choice questions in real-time, receiving instant telemetry on student comprehension.</li>
            <li><strong>Private One-on-One Breakout Channels:</strong> A teacher can invite a struggling student into a discreet whisper consultation without removing them from the class environment.</li>
          </ul>

          <p>
            With more than 100,000 active students and over 5,000 courses hosted on the platform, TOTC continues to pioneer the future of hybrid and distance learning.
          </p>
        </div>

        {/* Share & Clap Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-totc-teal/10 text-totc-teal hover:bg-totc-teal/20 transition-colors text-sm font-semibold">
              <ThumbsUp className="w-4 h-4" /> <span>342 Claps</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-totc-gray font-medium">Share:</span>
            <button className="p-2 rounded-full hover:bg-gray-100 text-totc-teal transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
