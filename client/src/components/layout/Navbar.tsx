import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "회사소개", href: "#about" },
  { name: "렌탈뉴스", href: "#news" },
  { name: "렌탈솔루션", href: "#services" },
  { name: "문의하기", href: "#contact" },
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
      <div className="container mx-auto px-5 md:px-4">
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-lg md:text-2xl text-white flex items-center"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span className="text-primary" style={{ fontFamily: 'Paperlogy', fontWeight: 900 }}>REN</span>
            <span className="text-secondary" style={{ fontFamily: 'Paperlogy', fontWeight: 700 }}>'T</span>
            <span className="ml-0 md:ml-2 text-base md:text-lg font-normal text-gray-300" style={{ fontFamily: 'Paperlogy', fontWeight: 400 }}>렌잇</span>
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="nav-underline text-gray-300 hover:text-white transition-colors"
              >
                {link.name}
              </button>
            ))}
            <Button 
              onClick={() => scrollToSection("#contact")}
              className="bg-gradient-to-r from-primary to-purple-500 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
            >
              무료 상담
            </Button>
          </div>
          
          <button 
            className="md:hidden text-white focus:outline-none"
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
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="nav-underline text-gray-300 hover:text-white py-2 transition-colors text-left"
              >
                {link.name}
              </button>
            ))}
            <Button 
              onClick={() => scrollToSection("#contact")}
              className="w-full mt-4 bg-gradient-to-r from-primary to-purple-500 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all"
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
