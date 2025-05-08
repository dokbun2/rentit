import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";

const newsItems = [
  {
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    category: "시장 동향",
    date: "2023년 9월 15일",
    tag: { text: "렌탈 트렌드", bgClass: "bg-primary-dark/30", textClass: "text-purple-400" },
    title: "2023년 하반기 렌탈 시장 동향 분석",
    description: "코로나19 이후 변화된 소비 패턴과 렌탈 시장의 새로운 기회에 대해 알아봅니다. 구독 경제의 성장과 함께 주목받는 렌탈 비즈니스의 미래 전망을 분석합니다.",
    textColor: "text-primary",
  },
  {
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    category: "기술 혁신",
    date: "2023년 8월 22일",
    tag: { text: "디지털 전환", bgClass: "bg-secondary-dark/30", textClass: "text-emerald-400" },
    title: "디지털 기술로 진화하는 렌탈 비즈니스",
    description: "AI와 빅데이터를 활용한 렌탈 관리 시스템의 발전 사례와 디지털 전환을 통해 성공한 렌탈 기업들의 전략을 소개합니다. 비대면 시대에 맞는 효율적인 운영 방안을 알아봅니다.",
    textColor: "text-secondary",
  },
  {
    image: "https://images.unsplash.com/photo-1558403194-611308249627?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500",
    category: "비즈니스 전략",
    date: "2023년 7월 10일",
    tag: { text: "파트너십", bgClass: "bg-amber-700/30", textClass: "text-amber-400" },
    title: "성공적인 렌탈 비즈니스 파트너십 구축 방법",
    description: "렌탈 비즈니스의 성장을 위한 전략적 파트너십 구축 사례와 성공 요인을 분석합니다. 효과적인 협력 모델과 상호 이익을 창출하는 비즈니스 제휴 방안을 소개합니다.",
    textColor: "text-amber-500",
  },
];

const NewsSection = () => {
  return (
    <section id="news" className="py-20 dark-lighter relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full opacity-5 -ml-20 -mt-20"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary rounded-full opacity-5 -mr-40 -mb-40"></div>
      
      <div className="container mx-auto px-4 relative z-10">
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
            렌탈 <span className="text-primary">뉴스</span>
          </motion.h2>
          <motion.p 
            variants={fadeIn("up", 0.2)}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            렌탈 시장의 최신 트렌드와 업계 소식을 확인하세요.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeIn("up", 0.2 + index * 0.1)}
              className="group glass-effect rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="relative h-48">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-background px-3 py-1 rounded-full text-xs text-gray-300">
                  {item.category}
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-gray-500 text-sm group-hover:text-primary transition-colors">{item.date}</p>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 ${item.tag.bgClass} rounded-md text-xs ${item.tag.textClass}`}>
                      {item.tag.text}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                
                <p className="text-gray-400 mb-6 line-clamp-3">
                  {item.description}
                </p>
                
                <a href="#" className={`inline-flex items-center ${item.textColor} hover:opacity-80 transition-colors`}>
                  자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn("up", 0.5)}
          className="mt-12 text-center"
        >
          <Button 
            variant="outline" 
            className="px-6 py-3 dark-light rounded-lg text-white hover:bg-background border border-gray-700 transition-all inline-flex items-center"
          >
            더 많은 뉴스 보기 <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSection;
