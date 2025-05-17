import { motion } from "framer-motion";
import { ChevronDown, Check, Clock } from "lucide-react";

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
              <span className="text-primary">렌탈 비즈니스 </span>
              <span className="text-white">모든 것!</span>
              <br />
              <span className="text-white">렌잇이 </span>
              <span className="text-primary">알려드립니다.</span>
            </h1>
            
            <motion.p 
              variants={fadeIn("up", 0.2)}
            >
              렌탈사설립, 전산구축, 렌탈사제휴, 렌탈부업<br/>
              렌탈비즈니스의 모든 것을 도와드립니다.
            </motion.p>
            
            <motion.div 
              variants={fadeIn("up", 0.3)}
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
              >
                무료상담
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={fadeIn("up", 0.4)}
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
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
