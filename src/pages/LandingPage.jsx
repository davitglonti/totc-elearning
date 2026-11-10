import React from 'react';
import Hero from '../components/Hero';
import SuccessStats from '../components/SuccessStats';
import CloudSoftware from '../components/CloudSoftware';
import WhatIsTotc from '../components/WhatIsTotc';
import PhysicalClassroom from '../components/PhysicalClassroom';
import Features from '../components/Features';
import ExploreCourses from '../components/ExploreCourses';
import Testimonials from '../components/Testimonials';
import LatestNews from '../components/LatestNews';

export default function LandingPage({
  openAuthModal,
  openVideoModal,
  openAssessmentModal,
  setActivePage,
}) {
  return (
    <div className="w-full">
      <Hero openAuthModal={openAuthModal} openVideoModal={openVideoModal} />
      <SuccessStats />
      <CloudSoftware />
      <WhatIsTotc openAuthModal={openAuthModal} />
      <PhysicalClassroom openVideoModal={openVideoModal} />
      <Features openAuthModal={openAuthModal} />
      <ExploreCourses setActivePage={setActivePage} />
      <Testimonials openAssessmentModal={openAssessmentModal} />
      <LatestNews setActivePage={setActivePage} />
    </div>
  );
}
