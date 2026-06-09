// components/layout/Header.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import { Phone, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import icon from "@/assets/images/icon.png";

const menuItems = [
  { label: "Home", href: "#" },
  { label: "Sobre", href: "#" },
  {
    label: "Categorias",
    href: "#",
    dropdown: ["Imóveis", "Veículos", "Eletrônicos", "Equipamentos"],
  },
  { label: "Leilões", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Contato", href: "#" },
];

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 w-full z-50 font-sans antialiased">
      <div className="w-full bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 lg:px-12 h-[68px]">
          
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image src={icon} alt="BidLive" width={130} height={44} priority className="object-contain" />
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {menuItems.map((item) => (
              <div key={item.label} className="relative">
                {item.dropdown ? (
                  <button
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                    className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                  >
                    {item.label}
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>
                ) : (
                  <Link href={item.href} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                )}

                {item.dropdown && openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    {item.dropdown.map((sub) => (
                      <Link key={sub} href="#" className="block px-4 py-2 text-sm text-gray-600 hover:text-primary hover:bg-orange-50 transition-colors">
                        {sub}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
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
          </div>

        </div>
      </div>
    </header>
  );
}