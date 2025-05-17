import { motion } from "framer-motion";
import { ChevronDown, Check, Clock } from "lucide-react";
<<<<<<< HEAD
import { Button } from "../ui/button";
import GradientBorder from "../ui/gradient-border";
import GlassEffect from "../ui/glass-effect";
import { fadeIn, staggerContainer } from "../../lib/motion";
import { supabase } from "../../lib/supabase";
=======
import { Button } from "@/components/ui/button";
import GradientBorder from "@/components/ui/gradient-border";
import GlassEffect from "@/components/ui/glass-effect";
import { fadeIn, staggerContainer } from "@/lib/motion";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef } from "react";
>>>>>>> rollback-from-8c1775a

const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // 비디오가 로드되면 자동 재생
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error("비디오 자동재생 실패:", error);
      });
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
<<<<<<< HEAD
      const offset = sectionId === "#contact" ? 140 : 100;
=======
      let offset = 80;
      if (sectionId === "#contact") offset = 140;
      else if (["#about", "#services", "#testimonials", "#news"].includes(sectionId)) offset = 20;
>>>>>>> rollback-from-8c1775a
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      
      if (sectionId === "#contact") {
        setTimeout(() => {
          const contactForm = document.querySelector('#contact-form');
          if (contactForm) {
            contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    }
  };

  return (
<<<<<<< HEAD
    <section id="home" className="min-h-screen pt-16 md:pt-20 relative overflow-hidden flex items-center">
=======
    <section id="home" className="h-screen-110 md:min-h-screen pt-28 md:pt-20 relative overflow-hidden flex items-start md:items-center">
>>>>>>> rollback-from-8c1775a
      <div className="absolute inset-0 z-0">
        {/* 배경 비디오와 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background opacity-90 z-10"></div>
        <video 
          ref={videoRef}
          src="https://sarpiggygpqzitvcdiqk.supabase.co/storage/v1/object/public/imgs//video.mp4"
          className="w-full h-full object-cover object-center"
          muted
          loop
          playsInline
        ></video>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row items-center"
        >
          <motion.div 
            variants={fadeIn("up", 0.1)}
<<<<<<< HEAD
            className="w-full md:w-1/2 md:pr-8 text-center md:text-left"
          >
            <h1 className="mobile-big-text font-bold leading-tight mb-8 sm:mb-10">
=======
            className="md:w-1/2 md:pr-8 text-center md:text-left"
          >
            <h1 className="text-[2.3rem] md:text-[3.5rem] lg:text-[3.9rem] font-bold leading-tight mb-6 md:mb-4">
>>>>>>> rollback-from-8c1775a
              <span className="text-primary">렌탈 비즈니스 </span>
              <span className="text-white">모든 것!</span>
              <br />
              <span className="text-white">렌잇이 </span>
              <span className="text-primary">알려드립니다.</span>
            </h1>
            
            <motion.p 
              variants={fadeIn("up", 0.2)}
<<<<<<< HEAD
              className="mobile-medium-text text-gray-300 mb-6 md:mb-8"
=======
              className="text-lg md:text-xl text-gray-300 mb-10 md:mb-12 mt-4"
>>>>>>> rollback-from-8c1775a
            >
              렌탈사설립, 전산구축, 렌탈사제휴, 렌탈부업<br/>
              렌탈비즈니스의 모든 것을 도와드립니다.
            </motion.p>
            
            <motion.div 
              variants={fadeIn("up", 0.3)}
<<<<<<< HEAD
              className="flex flex-col sm:flex-row justify-center md:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Button 
                onClick={() => scrollToSection("#services")}
                className="px-6 py-5 sm:px-8 sm:py-7 text-base sm:text-lg md:text-xl bg-gradient-to-r from-primary to-purple-500 rounded-full text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
=======
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start mb-1 md:mb-0"
            >
              <Button 
                onClick={() => scrollToSection("#services")}
                className="px-6 py-6 md:px-8 md:py-7 bg-gradient-to-r from-primary to-purple-500 rounded-full text-white text-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
>>>>>>> rollback-from-8c1775a
              >
                렌탈솔루션
              </Button>
              <Button 
                onClick={() => {
                  scrollToSection("#contact");
                  setTimeout(() => {
                    const contactForm = document.querySelector('#contact-form');
                    if (contactForm) {
                      contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }, 500);
                }}
                variant="outline" 
<<<<<<< HEAD
                className="px-6 py-5 sm:px-8 sm:py-7 text-base sm:text-lg md:text-xl border-gray-700 rounded-full text-white font-medium hover:bg-dark-lighter transition-all"
=======
                className="px-6 py-6 md:px-8 md:py-7 dark-light border-gray-700 rounded-full text-white text-lg font-medium hover:bg-dark-lighter transition-all"
>>>>>>> rollback-from-8c1775a
              >
                무료상담
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={fadeIn("up", 0.4)}
<<<<<<< HEAD
            className="w-full md:w-1/2 mt-12 md:mt-0 relative"
          >
            <GradientBorder>
              <GlassEffect className="p-6 sm:p-8 rounded-lg">
                <div className="flex items-center mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center mr-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 sm:h-7 sm:w-7 text-white" 
=======
            className="md:w-1/2 mt-10 md:mt-0 relative"
          >
            <GradientBorder>
              <GlassEffect className="p-6 md:p-8 rounded-lg">
                <div className="flex items-center mb-6 md:mb-6">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary flex items-center justify-center mr-4 md:mr-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 md:h-7 md:w-7 text-white" 
>>>>>>> rollback-from-8c1775a
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                      />
                    </svg>
                  </div>
                  <div>
<<<<<<< HEAD
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">렌잇과 함께 성장!</h3>
                    <p className="text-gray-400 text-base sm:text-lg">성공적인 렌탈 비즈니스의 시작</p>
                  </div>
                </div>
                
                <ul className="space-y-4 sm:space-y-5">
                  <li className="flex items-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-900/30 flex items-center justify-center mr-3 sm:mr-4">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base sm:text-lg">렌탈사설립 전문컨설팅</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-900/30 flex items-center justify-center mr-3 sm:mr-4">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base sm:text-lg">최신 렌탈전산 시스템 구축</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-900/30 flex items-center justify-center mr-3 sm:mr-4">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base sm:text-lg">업계 최고 렌탈 비즈니스 파트너십</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-900/30 flex items-center justify-center mr-3 sm:mr-4">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base sm:text-lg">부업으로 시작하는 렌탈 비즈니스</span>
=======
                    <h3 className="text-xl md:text-2xl font-bold text-white">렌잇과 함께 성장!</h3>
                    <p className="text-gray-400 text-base md:text-lg">성공적인 렌탈 비즈니스의 시작</p>
                  </div>
                </div>
                
                <ul className="space-y-3 md:space-y-4">
                  <li className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base md:text-lg">렌탈사설립 전문컨설팅</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base md:text-lg">최신 렌탈전산 시스템 구축</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base md:text-lg">업계 최고 렌탈 비즈니스 파트너십</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-7 h-7 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                      <Check className="h-4 w-4 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base md:text-lg">부업으로 시작하는 렌탈 비즈니스</span>
>>>>>>> rollback-from-8c1775a
                  </li>
                </ul>
              </GlassEffect>
            </GradientBorder>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-10 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <button 
          onClick={() => scrollToSection("#about")} 
          className="text-white opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Scroll to about section"
        >
<<<<<<< HEAD
          <ChevronDown className="h-7 w-7 sm:h-8 sm:w-8" />
=======
          <ChevronDown className="h-5 w-5 md:h-6 md:w-6" />
>>>>>>> rollback-from-8c1775a
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
