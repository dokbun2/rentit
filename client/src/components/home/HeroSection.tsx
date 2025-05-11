import { motion } from "framer-motion";
import { ChevronDown, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import GradientBorder from "@/components/ui/gradient-border";
import GlassEffect from "@/components/ui/glass-effect";
import { fadeIn, staggerContainer } from "@/lib/motion";
import { supabase } from "@/lib/supabase";

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="home" className="min-h-screen pt-20 relative overflow-hidden flex items-center">
      <div className="absolute inset-0 z-0">
        {/* Background image with overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background opacity-90 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080" 
          alt="Modern office space" 
          className="w-full h-full object-cover object-center"
        />
      </div>
      
      <div className="container mx-auto px-4 md:px-4 relative z-10">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row items-center"
        >
          <motion.div 
            variants={fadeIn("up", 0.1)}
            className="md:w-1/2 md:pr-8"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              <span className="text-primary">렌탈 비즈니스 </span>
              <span className="text-white">모든 것!</span>
              <br />
              <span className="text-white">렌잇이 </span>
              <span className="text-primary">알려드립니다.</span>
            </h1>
            
            <motion.p 
              variants={fadeIn("up", 0.2)}
              className="text-lg md:text-xl text-gray-300 mb-8"
            >
              렌탈사설립, 렌탈전산구축, 렌탈업무제휴, 렌탈부업<br/>
              렌탈비즈니스의 모든 것을 도와드립니다.
            </motion.p>
            
            <motion.div 
              variants={fadeIn("up", 0.3)}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Button 
                onClick={() => scrollToSection("#services")}
                className="px-8 py-7 bg-gradient-to-r from-primary to-purple-500 rounded-full text-white text-lg font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
              >
                렌탈솔루션
              </Button>
              <Button 
                onClick={() => scrollToSection("#contact")}
                variant="outline" 
                className="px-8 py-7 dark-light border-gray-700 rounded-full text-white text-lg font-medium hover:bg-dark-lighter transition-all"
              >
                무료상담신청
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={fadeIn("up", 0.4)}
            className="md:w-1/2 mt-12 md:mt-0 relative"
          >
            <GradientBorder>
              <GlassEffect className="p-8 rounded-lg">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mr-4">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 text-white" 
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
                    <h3 className="text-2xl font-bold text-white">렌잇과 함께 성장!</h3>
                    <p className="text-gray-400 text-lg">성공적인 렌탈 비즈니스의 시작</p>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                      <Check className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base">렌탈사설립 전문컨설팅</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                      <Check className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base">최신 렌탈전산 시스템 구축</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                      <Check className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base">업계 최고 렌탈 비즈니스 파트너십</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                      <Check className="h-3.5 w-3.5 text-purple-400" />
                    </div>
                    <span className="text-gray-300 text-base">부업으로 시작하는 렌탈 비즈니스</span>
                  </li>
                </ul>
              </GlassEffect>
            </GradientBorder>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <button 
          onClick={() => scrollToSection("#about")} 
          className="text-white opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Scroll to about section"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
