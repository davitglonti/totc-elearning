import React, { useState } from 'react';
import { LayoutGrid, Users, Eye, CheckCircle2 } from 'lucide-react';

export default function Features({ openAuthModal }) {
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [showQuizSuccess, setShowQuizSuccess] = useState(false);

  const handleQuizAnswer = (ans) => {
    setQuizAnswer(ans);
    setShowQuizSuccess(true);
    setTimeout(() => {
      // keep answer selected
    }, 2000);
  };

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden space-y-28 md:space-y-40">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-20 md:mb-32">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl md:text-5xl text-totc-purple tracking-tight">
            Our <span className="text-totc-mint">Features</span>
          </h2>
          <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
            This very extraordinary feature, can make learning activities more efficient
          </p>
        </div>

        {/* Feature 1: Classroom User Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Card Left */}
          <div className="lg:col-span-7 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-2xl group transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/card_classroom_ui.png"
                alt="Classroom user interface"
                className="w-full h-auto drop-shadow-2xl select-none"
              />
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-5 space-y-8">
            <h3 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-purple leading-snug">
              A <span className="text-totc-mint">user interface</span> designed for the classroom
            </h3>

            <div className="space-y-6">
              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 text-totc-purple group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-5 h-5 text-totc-purple" />
                </div>
                <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg leading-relaxed pt-2">
                  Teachers don’t get lost in the grid view and have a dedicated Podium space.
                </p>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 text-totc-orange group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-totc-orange" />
                </div>
                <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg leading-relaxed pt-2">
                  TA’s and presenters can be moved to the front of the class.
                </p>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center shrink-0 text-totc-cyan group-hover:scale-110 transition-transform">
                  <Eye className="w-5 h-5 text-totc-cyan" />
                </div>
                <p className="font-poppins font-normal text-totc-gray text-base sm:text-lg leading-relaxed pt-2">
                  Teachers can easily see all students and class data at one time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Tools For Teachers And Learners */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text Left */}
          <div className="lg:col-span-6 lg:order-1 order-2 space-y-6">
            <h3 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-purple leading-snug">
              <span className="text-totc-mint">Tools</span> For Teachers And Learners
            </h3>
            <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
              Class has a dynamic set of teaching tools built to be deployed and used during class. Teachers can handout assignments in real-time for students to complete and submit.
            </p>
          </div>

          {/* Graphic Right */}
          <div className="lg:col-span-6 lg:order-2 order-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xl group transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/card_tools_girl.png"
                alt="Tools for teachers and learners"
                className="w-full h-auto drop-shadow-2xl select-none"
              />
            </div>
          </div>
        </div>

        {/* Feature 3: Assessments, Quizzes, Tests */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Card Left */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-xl group transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/card_quiz.png"
                alt="Assessments, Quizzes, Tests"
                className="w-full h-auto drop-shadow-2xl select-none"
              />
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-purple leading-snug">
              Assessments, <span className="text-totc-mint">Quizzes</span>, Tests
            </h3>
            <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
              Easily launch live assignments, quizzes, and tests. Student results are automatically entered in the online gradebook.
            </p>
          </div>
        </div>

        {/* Feature 4: Class Management Tools for Educators */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text Left */}
          <div className="lg:col-span-5 lg:order-1 order-2 space-y-6">
            <h3 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-purple leading-snug">
              <span className="text-totc-mint">Class Management</span> Tools for Educators
            </h3>
            <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
              Class provides tools to help run and manage the class such as Class Roster, Attendance, and more. With the Gradebook, teachers can review and grade tests and quizzes in real-time.
            </p>
          </div>

          {/* Graphic Right */}
          <div className="lg:col-span-7 lg:order-2 order-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-2xl group transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/card_gradebook.png"
                alt="Gradebook class management tool"
                className="w-full h-auto drop-shadow-2xl select-none"
              />
            </div>
          </div>
        </div>

        {/* Feature 5: One-on-One Discussions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Card Left */}
          <div className="lg:col-span-6 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-xl group transition-transform duration-300 hover:scale-[1.01]">
              <img
                src="/assets/card_private_discussion.png"
                alt="One-on-One Discussions"
                className="w-full h-auto drop-shadow-2xl select-none"
              />
            </div>
          </div>

          {/* Text Right */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="font-poppins font-bold text-3xl sm:text-4xl text-totc-purple leading-snug">
              <span className="text-totc-mint">One-on-One</span> Discussions
            </h3>
            <p className="font-poppins font-normal text-totc-gray text-base sm:text-xl leading-relaxed">
              Teachers and teacher assistants can talk with students privately without leaving the Zoom environment.
            </p>
          </div>
        </div>

        {/* See More Features Button */}
        <div className="text-center pt-8">
          <button
            onClick={() => openAuthModal('register')}
            className="px-10 py-4 rounded-full font-medium text-lg text-totc-teal border-2 border-totc-teal hover:bg-totc-teal hover:text-white transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
          >
            See more features
          </button>
        </div>

      </div>
    </section>
  );
}
