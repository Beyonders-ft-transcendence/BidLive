// components/layout/Header.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { User, ChevronDown, Globe, Moon, PlusCircle, Gavel, LogOut } from "lucide-react";
import { useState } from "react";
import icon from "@/assets/images/icon.png";
import { useAuthStore } from "@/store/auth.store";

const menuItems = [
  { label: "Home", href: "#home" },
  { label: "Sobre", href: "#sobre" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Leilões", href: "#leiloes" },
];

export default function Header() {
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 w-full z-50 font-sans antialiased">
      <div className="w-full bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 lg:px-12 h-[68px]">
          
          {/* Logo */}
          <Link href="#home" className="flex items-center shrink-0">
            <Image src={icon} alt="BidLive" width={130} height={44} priority className="object-contain" />
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {menuItems.map((item) => (
              <Link key={item.label} href={item.href} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
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

            {/* Auth / User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setOpenUserMenu(!openUserMenu)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {/* Avatar Placeholder */}
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                    {user?.first_name ? user.first_name.charAt(0).toUpperCase() : (user?.username?.charAt(0).toUpperCase() || "US")}
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {openUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 mb-1 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Usuário"}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{user?.email || ""}</p>
                    </div>
                    <Link href="/user" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-orange-50 transition-colors">
                      <User size={15} />
                      Meu Painel
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button 
                      onClick={() => {
                        logout();
                        setOpenUserMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15} />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
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
            )}
          </div>

        </div>
      </div>
    </header>
  );
}