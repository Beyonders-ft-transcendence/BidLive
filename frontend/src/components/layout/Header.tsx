// components/layout/Header.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Globe, Moon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import icon from "@/assets/images/icon.png";
import { useAuthStore } from "@/store/auth.store";
import Avatar from "@/components/common/Avatar";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (pathname !== "/") {
      if (pathname === "/explore") setActiveSection("explore");
      else setActiveSection("");
      setIsMenuOpen(false); // fechar menu se aberto
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
      <div className="w-full bg-white shadow-sm border-b border-gray-100 relative">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-12 h-[68px]">
          
          {/* Logo */}
          <Link href="/#home" className="flex items-center shrink-0">
            <Image src={icon} alt="BidLive" width={110} height={38} priority className="object-contain lg:w-[130px] lg:h-[44px]" />
          </Link>

          {/* Nav Desktop */}
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
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Theme & Language (Visíveis no desktop/tablet) */}
            <div className="hidden sm:flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
              <button className="p-2 text-gray-500 hover:text-primary transition-colors rounded-sm hover:bg-gray-50" title="Mudar Idioma">
                <Globe size={18} />
              </button>
              <button className="p-2 text-gray-500 hover:text-primary transition-colors rounded-sm hover:bg-gray-50" title="Mudar Tema">
                <Moon size={18} />
              </button>
            </div>
     
            {isAuthenticated && user ? (
              <Link
                href={
                  user.roles?.includes("SUPER_ADMIN") || user.roles?.includes("MONITOR")
                    ? "/backoffice/dashboard"
                    : "/user"
                }
                className="flex items-center gap-2.5 pl-3 border-l border-gray-200 hover:opacity-95 transition-opacity"
              >
                <Avatar name={user.full_name || user.username} src={user.avatar_url} size="md" />
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-800 leading-tight">
                    {user.full_name || user.username}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    {user.roles?.includes("SUPER_ADMIN") ? "Admin" : user.roles?.includes("MONITOR") ? "Moderador" : "Licitante"}
                  </span>
                </div>
              </Link>
            ) : (
              <>
                <Link href="/signin" className="hidden sm:block">
                  <button className="px-4 py-2 lg:px-5 lg:py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-sm hover:bg-gray-50 hover:text-primary transition-colors">
                    Entrar
                  </button>
                </Link>
                <Link href="/signup" className="hidden sm:block">
                  <button className="flex items-center gap-2 px-4 py-2 lg:px-5 lg:py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-sm transition-colors">
                    <User size={15} />
                    <span className="hidden md:inline">Criar Conta</span>
                  </button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 text-gray-600 hover:text-primary transition-colors rounded-sm hover:bg-gray-50 ml-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-[68px] left-0 w-full bg-white border-b border-gray-100 shadow-lg">
            <nav className="flex flex-col p-4 gap-2">
              {menuItems.map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  onClick={() => {
                    setActiveSection(item.sectionId);
                    setIsMenuOpen(false);
                  }}
                  className={`text-base font-medium px-4 py-3 rounded-sm transition-colors ${
                    activeSection === item.sectionId 
                      ? "text-primary bg-primary/5" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-3">
                <div className="flex justify-around mb-2">
                  <button className="flex items-center gap-2 p-2 text-gray-500 hover:text-primary transition-colors rounded-sm hover:bg-gray-50">
                    <Globe size={18} /> Idioma
                  </button>
                  <button className="flex items-center gap-2 p-2 text-gray-500 hover:text-primary transition-colors rounded-sm hover:bg-gray-50">
                    <Moon size={18} /> Tema
                  </button>
                </div>
                {isAuthenticated && user ? (
                  <Link
                    href={
                      user.roles?.includes("SUPER_ADMIN") || user.roles?.includes("MONITOR")
                        ? "/backoffice/dashboard"
                        : "/user"
                    }
                    className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Avatar name={user.full_name || user.username} src={user.avatar_url} size="md" />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-gray-800 leading-tight">
                        {user.full_name || user.username}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        {user.roles?.includes("SUPER_ADMIN") ? "Admin" : user.roles?.includes("MONITOR") ? "Moderador" : "Portal do Usuário"}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <>
                    <Link href="/signin" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full px-5 py-3 text-sm font-semibold text-gray-700 border border-gray-200 rounded-sm hover:bg-gray-50 hover:text-primary transition-colors">
                        Entrar
                      </button>
                    </Link>
                    <Link href="/signup" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-sm transition-colors">
                        <User size={15} />
                        Criar Conta
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}