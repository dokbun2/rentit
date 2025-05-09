import { motion } from "framer-motion";
import { TrendingUp, Settings, Headset } from "lucide-react";
import { fadeIn } from "@/lib/motion";
import GlassEffect from "@/components/ui/glass-effect";

const features = [
  {
    icon: <TrendingUp className="h-6 w-6 text-primary" />,
    title: "업계 전문 지식",
    description: "10년 이상의 렌탈 비즈니스 경험을 바탕으로 시장 트렌드와 효과적인 전략을 제공합니다.",
    iconBgClass: "bg-primary/20",
  },
  {
    icon: <Settings className="h-6 w-6 text-secondary" />,
    title: "맞춤형 솔루션",
    description: "각 비즈니스의 특성과 요구사항에 맞는 최적화된 솔루션을 개발하고 제공합니다.",
    iconBgClass: "bg-secondary/20",
  },
  {
    icon: <Headset className="h-6 w-6 text-amber-500" />,
    title: "지속적인 지원",
    description: "비즈니스 설립 이후에도 지속적인 컨설팅과 기술 지원으로 성장을 돕습니다.",
    iconBgClass: "bg-amber-500/20",
  },
];

const statistics = [
  { value: "98%", label: "고객 만족도", textColor: "text-primary" },
  { value: "200+", label: "성공 사례", textColor: "text-secondary" },
  { value: "10년+", label: "업계 경험", textColor: "text-amber-500" },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
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
            왜 <span className="text-primary">렌잇</span>인가요?
          </motion.h2>
          <motion.p 
            variants={fadeIn("up", 0.2)}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            렌탈 비즈니스의 성공을 위한 최고의 선택,<br />
            렌잇만의 특별함을 확인하세요.
          </motion.p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={fadeIn("up", 0.2 + index * 0.1)}
              className="glass-effect rounded-xl p-8 flex items-center text-left transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className={`w-16 h-16 rounded-full ${feature.iconBgClass} flex items-center justify-center mr-6 shrink-0`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={fadeIn("up", 0.5)}
          className="mt-16"
        >
          <GlassEffect className="rounded-xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {statistics.map((stat, index) => (
                <div key={index} className="text-center">
                  <h3 className={`text-4xl font-bold ${stat.textColor} mb-2`}>{stat.value}</h3>
                  <p className="text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </GlassEffect>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
