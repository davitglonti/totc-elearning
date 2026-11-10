import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, CheckCircle, ArrowLeft, ArrowRight, BookOpen, 
  Clock, Award, Download, MessageSquare, FileText, Share2, 
  Volume2, Maximize, Check 
} from 'lucide-react';
import { api } from '../services/api';

export default function CoursePlayerPage({ activeCourse, setActivePage }) {
  const [courseContent, setCourseContent] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'notes', 'resources'
  const [loading, setLoading] = useState(true);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [successNotice, setSuccessNotice] = useState('');

  // Fallback static course content if API fails or demo course
  const defaultCourse = {
    title: activeCourse?.title || 'AWS Certified Solutions Architect & Cloud Operations',
    progressPercentage: activeCourse?.progressPercentage || 45,
    sections: [
      {
        id: 'sec-1',
        title: 'Module 1: Cloud Architecture Fundamentals',
        lessons: [
          { id: 'les-1', title: '1. Welcome & Architecture Overview', durationMinutes: 12, isCompleted: true },
          { id: 'les-2', title: '2. Designing Scalable VPCs and Subnets', durationMinutes: 24, isCompleted: true },
          { id: 'les-3', title: '3. Security Groups & IAM Role Polices', durationMinutes: 18, isCompleted: false },
        ]
      },
      {
        id: 'sec-2',
        title: 'Module 2: Real-time Gradebook & Zoom Integration',
        lessons: [
          { id: 'les-4', title: '4. Webhooks for Virtual Classroom Attendance', durationMinutes: 20, isCompleted: false },
          { id: 'les-5', title: '5. Storing Quiz Results in DynamoDB', durationMinutes: 32, isCompleted: false },
          { id: 'les-6', title: '6. Live Architectural Review & Debugging', durationMinutes: 15, isCompleted: false }
        ]
      },
      {
        id: 'sec-3',
        title: 'Module 3: Serverless Microservices and Certification Review',
        lessons: [
          { id: 'les-7', title: '7. AWS Lambda Triggers & Event Handlers', durationMinutes: 22, isCompleted: false },
          { id: 'les-8', title: '8. Capstone Project Submission Guide', durationMinutes: 35, isCompleted: false }
        ]
      }
    ]
  };

  useEffect(() => {
    async function fetchCourseDetails() {
      setLoading(true);
      if (activeCourse?.courseId) {
        try {
          const data = await api.learning.getContent(activeCourse.courseId);
          if (data && data.sections && data.sections.length > 0) {
            setCourseContent(data);
            const initialCompleted = new Set();
            data.sections.forEach(sec => {
              sec.lessons?.forEach(les => {
                if (les.isCompleted) initialCompleted.add(les.id);
              });
            });
            setCompletedLessonIds(initialCompleted);
            // Default to first incomplete lesson, or first lesson
            const firstIncomplete = data.sections.flatMap(s => s.lessons).find(l => !l.isCompleted);
            setActiveLesson(firstIncomplete || data.sections[0].lessons[0]);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Using local fallback curriculum:', err.message);
        }
      }

      // Default fallback
      setCourseContent(defaultCourse);
      const setIds = new Set(['les-1', 'les-2']);
      setCompletedLessonIds(setIds);
      setActiveLesson(defaultCourse.sections[0].lessons[2]);
      setLoading(false);
    }

    fetchCourseDetails();
  }, [activeCourse]);

  // Handle Mark as Complete
  const handleCompleteCurrentLesson = async () => {
    if (!activeLesson) return;

    try {
      // Call backend API to mark completed
      await api.learning.completeLesson(activeLesson.id, 0, true);
    } catch (e) {
      console.warn('Saved completion locally:', e.message);
    }

    setCompletedLessonIds(prev => new Set(prev).add(activeLesson.id));
    setSuccessNotice('Lesson marked as complete! 🎉');
    setTimeout(() => setSuccessNotice(''), 3000);

    // Auto advance to next lesson if available
    const allLessons = courseContent?.sections?.flatMap(s => s.lessons) || [];
    const currentIndex = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    }
  };

  const allLessons = courseContent?.sections?.flatMap(s => s.lessons) || [];
  const completedCount = allLessons.filter(l => completedLessonIds.has(l.id)).length;
  const currentProgressPercent = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  return (
    <div className="pt-20 bg-[#0F172A] text-white min-h-screen flex flex-col">
      {/* Top Navigation Header */}
      <div className="bg-[#1E293B] border-b border-slate-700/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setActivePage('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-totc-teal font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Learning</span>
          </button>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <h1 className="font-poppins font-semibold text-base sm:text-lg text-white truncate max-w-md sm:max-w-xl">
            {courseContent?.title || activeCourse?.title}
          </h1>
        </div>

        {/* Progress in Header */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{completedCount} / {allLessons.length} Completed</span>
          </div>
          <div className="w-32 h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-totc-teal transition-all duration-300 rounded-full"
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-totc-teal">{currentProgressPercent}%</span>
        </div>
      </div>

      {/* Main Classroom Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-[1700px] mx-auto w-full">
        
        {/* Left: Video Player & Lecture Notes (8 cols) */}
        <div className="lg:col-span-8 p-6 lg:p-8 flex flex-col space-y-6">
          
          {/* Video Container */}
          <div className="relative rounded-[24px] overflow-hidden bg-black shadow-2xl aspect-video flex items-center justify-center group border border-slate-800">
            {/* Realistic video backdrop */}
            <img
              src="/assets/classroom_feature.png"
              alt="Lecture Stream"
              className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-90' : 'opacity-65'}`}
            />

            {/* Center Play/Pause button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute w-20 h-20 rounded-full bg-totc-teal/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-totc-teal transition-all duration-200"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-white" />
              ) : (
                <Play className="w-8 h-8 fill-white ml-1" />
              )}
            </button>

            {/* Video Controls Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between text-xs text-white">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-totc-teal">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <span>04:15 / {activeLesson?.durationMinutes || 15}:00</span>
              </div>

              <div className="flex items-center gap-4">
                <Volume2 className="w-4 h-4 hover:text-totc-teal cursor-pointer" />
                <Maximize className="w-4 h-4 hover:text-totc-teal cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Lesson Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/60 p-5 rounded-2xl border border-slate-700/60">
            <div>
              <p className="text-xs font-semibold text-totc-teal uppercase tracking-wider mb-1">
                Active Lecture
              </p>
              <h2 className="font-poppins font-bold text-xl text-white">
                {activeLesson?.title || '1. Welcome & Architecture Overview'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {completedLessonIds.has(activeLesson?.id) ? (
                <div className="px-4 py-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Completed</span>
                </div>
              ) : (
                <button
                  onClick={handleCompleteCurrentLesson}
                  className="px-5 py-2.5 rounded-full bg-totc-teal text-white hover:bg-totc-teal-dark text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </button>
              )}
            </div>
          </div>

          {successNotice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Lesson Tabs: Overview, Notes, Resources */}
          <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/60 space-y-6">
            <div className="flex border-b border-slate-700 gap-6">
              {[
                { id: 'overview', name: 'Lecture Overview', icon: BookOpen },
                { id: 'notes', name: 'Instructor Notes', icon: FileText },
                { id: 'resources', name: 'Downloadable Assets', icon: Download },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                      isActive
                        ? 'border-totc-teal text-totc-teal'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                <p>
                  In this comprehensive hands-on lecture, you will delve into architectural best practices, high-availability deployments, and interactive classroom streaming configurations.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-xs text-slate-400">Duration</p>
                      <p className="font-semibold text-white">{activeLesson?.durationMinutes || 15} minutes</p>
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center gap-3">
                    <Award className="w-5 h-5 text-totc-teal" />
                    <div>
                      <p className="text-xs text-slate-400">Skill Level</p>
                      <p className="font-semibold text-white">Intermediate to Advanced</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-3 text-sm text-slate-300">
                <p className="font-semibold text-white">Key Takeaways:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-400 text-xs">
                  <li>Configure isolated VPC environments with private subnets for sensitive database tiers.</li>
                  <li>Use autoscaling group policies tied directly to CloudWatch metric alarms.</li>
                  <li>Validate webhooks with HMAC SHA256 signatures before processing course enrollments.</li>
                </ul>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-2">
                {[
                  { name: 'architecture_diagram_v2.pdf', size: '2.4 MB' },
                  { name: 'cloudformation_starter_template.yaml', size: '14 KB' },
                  { name: 'classroom_api_cheatsheet.zip', size: '5.1 MB' },
                ].map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-totc-teal" />
                      <span className="font-medium text-white">{file.name}</span>
                      <span className="text-slate-400">({file.size})</span>
                    </div>
                    <button className="text-totc-teal hover:underline font-semibold flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive Syllabus / Course Curriculum (4 cols) */}
        <div className="lg:col-span-4 bg-[#1E293B] border-t lg:border-t-0 lg:border-l border-slate-700/80 p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="font-poppins font-bold text-lg text-white">Course Content</h3>
            <p className="text-xs text-slate-400">
              {courseContent?.sections?.length || 3} modules • {allLessons.length} lectures
            </p>
          </div>

          {/* Modules Accordion */}
          <div className="space-y-3 overflow-y-auto max-h-[750px] pr-1">
            {courseContent?.sections?.map((section, sIdx) => (
              <div
                key={section.id || sIdx}
                className="bg-slate-800/80 rounded-2xl border border-slate-700/60 overflow-hidden"
              >
                <div className="p-3.5 bg-slate-800 border-b border-slate-700/60 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-200">{section.title}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{section.lessons?.length || 0} lectures</span>
                </div>

                <div className="divide-y divide-slate-700/40">
                  {section.lessons?.map((lesson, lIdx) => {
                    const isCurrent = activeLesson?.id === lesson.id;
                    const isDone = completedLessonIds.has(lesson.id);

                    return (
                      <button
                        key={lesson.id || lIdx}
                        onClick={() => {
                          setActiveLesson(lesson);
                          setIsPlaying(true);
                        }}
                        className={`w-full text-left p-3 flex items-start gap-3 transition-colors ${
                          isCurrent
                            ? 'bg-totc-teal/15 text-white font-medium border-l-4 border-totc-teal'
                            : 'hover:bg-slate-700/40 text-slate-300'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <Play className="w-4 h-4 text-totc-teal fill-totc-teal animate-pulse" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-500" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs line-clamp-2 ${isCurrent ? 'font-bold text-totc-cyan' : ''}`}>
                            {lesson.title}
                          </p>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {lesson.durationMinutes || 15} mins
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}