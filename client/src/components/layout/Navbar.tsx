import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPaperlogyStyle } from "@/lib/fonts";

const navLinks = [
  { name: "회사소개", href: "#about" },
  { name: "렌탈솔루션", href: "#services" },
  { name: "렌탈뉴스", href: "/news" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    } else {
      setLocation(href);
    }
  };

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "glass-effect py-3" : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-4 md:px-4">
        <div className="flex justify-between items-center md:justify-between">
          {/* 모바일에서 메뉴 버튼 (왼쪽에 배치) */}
          <div className="md:hidden flex items-center">
            <button 
              className="text-white focus:outline-none flex items-center h-full my-auto"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* 로고 - 모바일에서는 중앙정렬 */}
          <Link
            href="/"
            className="text-3xl text-white flex items-center md:flex-none flex-grow md:flex-grow-0 justify-center md:justify-start"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="flex items-baseline">
              <span className={cn("text-primary text-[1.4em]", getPaperlogyStyle('black'))}>REN</span>
              <span className={cn("text-secondary text-[1.4em]", getPaperlogyStyle('bold'))}>'T</span>
              <span className={cn("ml-2 text-3xl text-gray-300", getPaperlogyStyle('regular'))}>렌잇</span>
            </div>
          </Link>
          
          {/* PC 메뉴 */}
          <div className="hidden md:flex space-x-8 items-center">
            <button
              onClick={() => handleNavClick("#about")}
              className="nav-underline text-gray-300 hover:text-white transition-colors text-lg"
            >
              회사소개
            </button>
            <button
              onClick={() => handleNavClick("#services")}
              className="nav-underline text-gray-300 hover:text-white transition-colors text-lg"
            >
              렌탈솔루션
            </button>
            <button
              onClick={() => handleNavClick("/news")}
              className={cn(
                "nav-underline text-gray-300 hover:text-white transition-colors text-lg",
                location === "/news" && "text-primary"
              )}
            >
              렌탈뉴스
            </button>
            <Button 
              onClick={() => handleNavClick("#contact")}
              className="bg-gradient-to-r from-primary to-purple-500 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all text-lg px-6 py-6"
            >
              무료 상담
            </Button>
          </div>
          
          {/* 모바일에서 빈 공간으로 균형 맞추기 */}
          <div className="md:hidden w-6"></div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden dark-lighter py-4 px-4"
        >
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => handleNavClick("#about")}
              className="nav-underline text-gray-300 hover:text-white py-2 transition-colors text-left text-lg"
            >
              회사소개
            </button>
            <button
              onClick={() => handleNavClick("#services")}
              className="nav-underline text-gray-300 hover:text-white py-2 transition-colors text-left text-lg"
            >
              렌탈솔루션
            </button>
            <button
              onClick={() => handleNavClick("/news")}
              className={cn(
                "nav-underline text-gray-300 hover:text-white py-2 transition-colors text-left text-lg",
                location === "/news" && "text-primary"
              )}
            >
              렌탈뉴스
            </button>
            <Button 
              onClick={() => handleNavClick("#contact")}
              className="w-full mt-4 bg-gradient-to-r from-primary to-purple-500 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all text-lg py-6"
            >
              무료 상담
            </Button>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;
