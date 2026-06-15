// components/layout/Header.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Globe, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import icon from "@/assets/images/icon.png";

const menuItems = [
  { label: "Home", href: "/#home", sectionId: "home" },
  { label: "Sobre", href: "/#sobre", sectionId: "sobre" },
  { label: "Como Funciona", href: "/#como-funciona", sectionId: "como-funciona" },
  { label: "Leilões", href: "/#leiloes", sectionId: "leiloes" },
  { label: "Explorar", href: "/explore", sectionId: "explore" },
];

export default function Header() {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    if (pathname !== "/") {
      if (pathname === "/explore") setActiveSection("explore");
      else setActiveSection("");
      return;
    }

    const handleScroll = () => {
      const sections = menuItems.filter(item => item.sectionId !== "explore").map(item => item.sectionId);
      
      let currentSection = "home";
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 120) {
            currentSection = section;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <header className="sticky top-0 w-full z-50 font-sans antialiased">
      <div className="w-full bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 lg:px-12 h-[68px]">
          
          {/* Logo */}
          <Link href="/#home" className="flex items-center shrink-0">
            <Image src={icon} alt="BidLive" width={130} height={44} priority className="object-contain" />
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {menuItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                onClick={() => setActiveSection(item.sectionId)}
                className={`text-sm font-medium transition-colors ${
                  activeSection === item.sectionId 
                    ? "text-primary" 
                    : "text-gray-600 hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Theme & Language (Sempre visíveis) */}
            <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
              <button className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-50" title="Mudar Idioma">
                <Globe size={18} />
              </button>
              <button className="p-2 text-gray-500 hover:text-primary transition-colors rounded-full hover:bg-gray-50" title="Mudar Tema">
                <Moon size={18} />
              </button>
            </div>
     
            <>
              <Link href="/signin" className="hidden sm:block">
                <button className="px-5 py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-primary transition-colors">
                  Entrar
                </button>
              </Link>
              <Link href="/signup">
                <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors">
                  <User size={15} />
                  Criar Conta
                </button>
              </Link>
            </>
          
          </div>

        </div>
      </div>
    </header>
  );
}