import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPaperlogyStyle } from "@/lib/fonts";

const navLinks = [
  { name: "회사소개", href: "#about" },
  { name: "렌탈솔루션", href: "#services" },
  { name: "렌탈뉴스", href: "#news" },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
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
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "glass-effect py-3" : "bg-transparent py-5"
    )}>
      <div className="container mx-auto px-4 md:px-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-3xl text-white flex items-center"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="flex items-baseline">
              <span className={cn("text-primary text-[1.4em]", getPaperlogyStyle('black'))}>REN</span>
              <span className={cn("text-secondary text-[1.4em]", getPaperlogyStyle('bold'))}>'T</span>
              <span className={cn("ml-2 text-3xl text-gray-300", getPaperlogyStyle('regular'))}>렌잇</span>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            <button
              onClick={() => scrollToSection("#about")}
              className="nav-underline text-gray-300 hover:text-white transition-colors text-lg"
            >
              회사소개
            </button>
            <button
              onClick={() => scrollToSection("#services")}
              className="nav-underline text-gray-300 hover:text-white transition-colors text-lg"
            >
              렌탈솔루션
            </button>
            <button
              onClick={() => scrollToSection("#news")}
              className="nav-underline text-gray-300 hover:text-white transition-colors text-lg"
            >
              렌탈뉴스
            </button>
            <Button 
              onClick={() => scrollToSection("#contact")}
              className="bg-gradient-to-r from-primary to-purple-500 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all text-lg px-6 py-6"
            >
              무료 상담
            </Button>
          </div>
          
          <button 
            className="md:hidden text-white focus:outline-none flex items-center h-full my-auto"
            style={{ marginTop: '1px' }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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
              onClick={() => scrollToSection("#about")}
              className="nav-underline text-gray-300 hover:text-white py-2 transition-colors text-left text-lg"
            >
              회사소개
            </button>
            <button
              onClick={() => scrollToSection("#services")}
              className="nav-underline text-gray-300 hover:text-white py-2 transition-colors text-left text-lg"
            >
              렌탈솔루션
            </button>
            <button
              onClick={() => scrollToSection("#news")}
              className="nav-underline text-gray-300 hover:text-white py-2 transition-colors text-left text-lg"
            >
              렌탈뉴스
            </button>
            <Button 
              onClick={() => scrollToSection("#contact")}
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
