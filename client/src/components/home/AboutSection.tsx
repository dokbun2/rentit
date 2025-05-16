import { motion } from "framer-motion";
import { Trophy, Handshake, Lightbulb, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";

const AboutSection = () => {
  const scrollToContact = () => {
    const contactSection = document.querySelector("#contact");
    if (contactSection) {
      const offsetTop = contactSection.getBoundingClientRect().top + window.pageYOffset - 140;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="about" className="py-20 md:py-24 pt-24 md:pt-28 bg-[#121212] relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.h2 
            variants={fadeIn("up", 0.1)}
            className="text-4xl md:text-5xl font-bold mb-4 md:mb-5"
          >
            회사 <span className="text-primary">소개</span>
          </motion.h2>
          <motion.p 
            variants={fadeIn("up", 0.2)}
            className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg"
          >
            렌잇은 렌탈 비즈니스의 설립부터 운영까지<br />
            필요한 모든 전문 서비스를 제공합니다.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeIn("right", 0.3)}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-xl shadow-dark-light/20">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="렌탈 비즈니스 컨설턴트 팀" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-28 md:w-32 h-28 md:h-32 bg-primary rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -top-6 -left-6 w-24 md:w-24 h-24 md:h-24 bg-secondary rounded-full opacity-20 animate-pulse"></div>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeIn("left", 0.3)}
            className="flex flex-col items-center text-center mt-8 md:mt-0"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-5 md:mb-6">렌탈 비즈니스의 <span className="text-primary">전문가</span></h3>
            
            <p className="text-gray-300 text-base md:text-lg mb-5 md:mb-7 leading-relaxed">
              렌잇은 렌탈 비즈니스 분야에서 10년 이상의 경험을 바탕으로 고객님의 성공적인 비즈니스를 위한 최고의 솔루션을 제공합니다. 
              시장 조사부터 비즈니스 모델 구축, 시스템 개발까지 종합적인 컨설팅 서비스로 고객의 니즈에 맞는 최적의 결과를 도출합니다.
            </p>
            
            <div className="flex flex-col items-start gap-4 md:gap-5 mb-6 md:mb-8 w-full max-w-md mx-auto pl-4 md:pl-24">
              <div className="flex items-center w-full">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 md:mr-5 shrink-0">
                  <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <h4 className="font-bold text-white text-lg md:text-xl mb-1 md:mb-2">전문성</h4>
                  <p className="text-gray-400 text-base md:text-lg">렌탈 분야 전문 컨설턴트</p>
                </div>
              </div>
              <div className="flex items-center w-full">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary/20 flex items-center justify-center mr-4 md:mr-5 shrink-0">
                  <Handshake className="h-5 w-5 md:h-6 md:w-6 text-secondary" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <h4 className="font-bold text-white text-lg md:text-xl mb-1 md:mb-2">신뢰성</h4>
                  <p className="text-gray-400 text-base md:text-lg">200+ 성공 비즈니스 사례</p>
                </div>
              </div>
              <div className="flex items-center w-full">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-amber-500/20 flex items-center justify-center mr-4 md:mr-5 shrink-0">
                  <Lightbulb className="h-5 w-5 md:h-6 md:w-6 text-amber-500" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <h4 className="font-bold text-white text-lg md:text-xl mb-1 md:mb-2">혁신성</h4>
                  <p className="text-gray-400 text-base md:text-lg">최신 렌탈 트렌드 반영</p>
                </div>
              </div>
              <div className="flex items-center w-full">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 md:mr-5 shrink-0">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <h4 className="font-bold text-white text-lg md:text-xl mb-1 md:mb-2">고객 중심</h4>
                  <p className="text-gray-400 text-base md:text-lg">맞춤형 솔루션 제공</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
