import { motion } from "framer-motion";
import { Building, Handshake, Laptop, Coins, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/motion";
import GlassEffect from "@/components/ui/glass-effect";

const services = [
  {
    icon: <Building className="h-6 w-6 text-primary" />,
    title: "렌탈사 설립",
    description: "렌탈사설립, 전산시스템구축, 조직셋팅 등, 초기 운영 전략까지 렌탈사 설립의 모든 과정을 지원합니다.",
    features: ["법인설립 전반", "전산시스템구축", "각종계약서 작성"],
    iconBgClass: "bg-primary/20",
    textColorClass: "text-primary",
    checkColorClass: "text-primary",
  },
  {
    icon: <Handshake className="h-6 w-6 text-secondary" />,
    title: "렌탈업무 제휴",
    description: "국내 렌탈사와의 파트너십 구축과 효율적인 업무 제휴를 통해 렌탈사와 협업 타사 대비 경쟁력을 강화.",
    features: ["전략적 파트너 발굴", "계약 조건 협상 지원", "협력 관계 구축 컨설팅"],
    iconBgClass: "bg-secondary/20",
    textColorClass: "text-secondary",
    checkColorClass: "text-secondary",
  },
  {
    icon: <Laptop className="h-6 w-6 text-amber-500" />,
    title: "렌탈시스템 구축",
    description: "렌탈전산시스템 구축을 통해 고정비용 절감 및 효율적인 렌탈 관리를 위한 맞춤형 서비스를 제공합니다.",
    features: ["맞춤형 렌탈 관리 시스템", "재고 및 자산 관리 솔루션", "고객 관리 및 결제 시스템"],
    iconBgClass: "bg-amber-500/20",
    textColorClass: "text-amber-500",
    checkColorClass: "text-amber-500",
  },
  {
    icon: <Coins className="h-6 w-6 text-primary" />,
    title: "렌탈 부업",
    description: "렌탈 판매 부업을 희망하시는 분들중 선별하여 월 100만원 벌수있도록 부업서비스를 무료로 제공",
    features: ["무료 부업 컨설팅", "월 100벌기 프로젝트", "체계적인 운영 모델 구축"],
    iconBgClass: "bg-primary/20",
    textColorClass: "text-primary",
    checkColorClass: "text-primary",
  },
];

const ServicesSection = () => {
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

  return (
    <section id="services" className="py-20 dark-lighter relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary rounded-full opacity-5 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full opacity-5 -ml-40 -mb-40"></div>
      
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
            렌탈 <span className="text-primary">솔루션</span>
          </motion.h2>
          <motion.p 
            variants={fadeIn("up", 0.2)}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            렌탈 비즈니스의 시작부터 성장까지, 전문적인 컨설팅으로 성공을 돕습니다.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeIn("up", 0.1 + index * 0.1)}
              className="group glass-effect rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 mx-auto w-full max-w-sm flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-full ${service.iconBgClass} flex items-center justify-center mb-6 mx-auto transition-all duration-300 transform group-hover:-translate-y-2`}>
                {service.icon}
              </div>
              
              <h3 className="text-xl font-bold text-center mb-4">{service.title}</h3>
              
              <p className="text-gray-400 text-center mb-6">
                {service.description}
              </p>
              
              <ul className="space-y-3 mb-6 w-full">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start justify-center">
                    <Check className={`h-4 w-4 ${service.checkColorClass} mr-2 mt-1`} />
                    <span className="text-gray-300 text-sm text-left">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                onClick={scrollToContact}
                className={`block text-center py-2 px-4 bg-gradient-to-r from-primary to-purple-500 rounded-full text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all w-full`}
              >
                자세히 보기
              </button>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn("up", 0.5)}
          className="mt-16 text-center"
        >
          <Button 
            onClick={scrollToContact}
            className="px-8 py-6 bg-gradient-to-r from-primary to-purple-500 rounded-full text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            무료 상담 신청하기
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
