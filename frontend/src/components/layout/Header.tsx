// components/layout/Header.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { User, Globe, Moon } from "lucide-react";
import { useState } from "react";
import icon from "@/assets/images/icon.png";

const menuItems = [
  { label: "Home", href: "#home" },
  { label: "Sobre", href: "#sobre" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Leilões", href: "#leiloes" },
];

export default function Header() {

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