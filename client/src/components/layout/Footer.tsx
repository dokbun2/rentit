import { Link } from "wouter";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin
} from "lucide-react";

const Footer = () => {
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
    <footer className="bg-background pt-16 pb-8 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <Link href="/" className="text-2xl font-bold text-white flex items-center mb-6">
              <span className="text-primary">REN</span><span className="text-secondary">'T</span>
              <span className="ml-2 text-sm font-normal text-gray-300">렌잇</span>
            </Link>
            
            <p className="text-gray-400 mb-6">
              렌탈 비즈니스의 성공적인 시작과 성장을 위한 전문 컨설팅 서비스를 제공합니다. 렌잇과 함께 성장하세요.
            </p>
          </div>
          
          {/* Services Links */}
          <div>
            <h4 className="text-xl font-bold mb-6">렌탈솔루션</h4>
            
            <ul className="space-y-3">
              <li>
                <button onClick={() => scrollToSection("#services")} className="text-gray-400 hover:text-primary transition-colors">
                  렌탈사 설립
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#services")} className="text-gray-400 hover:text-primary transition-colors">
                  렌탈업무 제휴
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#services")} className="text-gray-400 hover:text-primary transition-colors">
                  렌탈시스템 구축
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection("#services")} className="text-gray-400 hover:text-primary transition-colors">
                  렌탈 부업
                </button>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  온라인 세미나
                </a>
              </li>
            </ul>
          </div>
          
          {/* Customer Support */}
          <div>
            <h4 className="text-xl font-bold mb-6">고객지원</h4>
            
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  자료실
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} 렌잇(REN'T). All rights reserved.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">이용약관</a>
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">개인정보처리방침</a>
              <a href="#" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">쿠키정책</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
