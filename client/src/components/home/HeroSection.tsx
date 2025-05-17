import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Check, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { fadeIn, staggerContainer } from "../../lib/motion";

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
      const offset = 0; // offset 값 임시 지정
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            className="flex-1 text-center md:text-left"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-primary">렌탈 비즈니스 </span>
              <span className="text-white">모든 것!</span>
              <br />
              <span className="text-white">렌잇이 </span>
              <span className="text-primary">알려드립니다.</span>
            </h1>
            <motion.p 
              variants={fadeIn("up", 0.2)}
              className="text-lg md:text-2xl text-gray-200 mb-8"
            >
              렌탈사설립, 전산구축, 렌탈사제휴, 렌탈부업<br/>
              렌탈비즈니스의 모든 것을 도와드립니다.
            </motion.p>
            <motion.div 
              variants={fadeIn("up", 0.3)}
              className="flex gap-4 justify-center md:justify-start"
            >
              <Button>
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
              >
                무료상담
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
      <div className="absolute bottom-10 md:bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <button 
          onClick={() => scrollToSection("#about")} 
          className="text-white opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Scroll to about section"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
