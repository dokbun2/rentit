import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";
import GlassEffect from "@/components/ui/glass-effect";

const testimonials = [
  {
    quote: "렌잇의 전문적인 컨설팅 덕분에 제 부업으로 시작한 렌탈 비즈니스가 안정적으로 성장할 수 있었습니다. 초기 자금이 적었지만 효율적인 운영 방법을 배워 현재는 전업으로 전환할 계획입니다.",
    name: "김민수",
    role: "렌탈 부업 컨설팅 고객",
    rating: 5,
  },
  {
    quote: "렌탈 시스템 구축에 필요한 기술적 지식이 부족했는데, 렌잇의 맞춤형 솔루션 덕분에 효율적인 관리 시스템을 갖출 수 있었습니다. 재고 관리와 고객 관리가 한결 수월해졌습니다.",
    name: "이지연",
    role: "렌탈시스템 구축 고객",
    rating: 4.5,
  },
];

const TestimonialsSection = () => {
  const scrollToContact = () => {
    const contactSection = document.querySelector("#contact");
    if (contactSection) {
      const offsetTop = contactSection.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 text-amber-400 fill-amber-400" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-amber-400" />
          <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </div>
        </div>
      );
    }
    
    // Add empty stars to reach 5
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-amber-400" />);
    }
    
    return stars;
  };

  return (
    <section id="testimonials" className="py-20 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeIn("up", 0.1)}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            고객 <span className="text-primary">후기</span>
          </motion.h2>
          <motion.p 
            variants={fadeIn("up", 0.2)}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            렌잇의 서비스를 경험한 고객들의 생생한 후기를 확인하세요.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeIn("up", 0.2 + index * 0.1)}
            >
              <GlassEffect className="rounded-xl p-8 relative">
                <div className="absolute -top-4 -left-4 text-6xl text-primary opacity-20">❝</div>
                
                <p className="text-gray-300 mb-6 relative z-10">
                  {testimonial.quote}
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-700 mr-4"></div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </GlassEffect>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn("up", 0.4)}
          className="text-center"
        >
          <Button 
            onClick={scrollToContact}
            className="px-6 py-3 bg-gradient-to-r from-primary to-purple-500 rounded-full text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            무료 상담 신청하기
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
