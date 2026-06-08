import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

import icon from "@/assets/images/icon.png";
import Button from "@/components/common/Button";

const menuItems = [
  { label: "Home", href: "#" },
  { label: "Leilões", href: "#" },
  { label: "Como Funciona", href: "#" },
  { label: "Categorias", href: "#" },
  { label: "Contato", href: "#" },
];

export default function Header() {
  return (
    <header className="absolute top-0 left-0 w-full z-50 font-sans antialiased">
      <div className="w-full bg-white shadow-sm">
        
        {/* THIN TOP BAR - Contact Info */}
        {/* <div className="hidden lg:flex items-center justify-between px-6 lg:px-12 py-2 bg-[#F3F4F6] border-b border-gray-200 text-xs">
          <div className="flex items-center gap-6 text-gray-500">
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <MapPin size={14} className="text-primary" />
              <span>Luanda, Angola</span>
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <Phone size={14} className="text-primary" />
              <span>+244 900 000 000</span>
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-default">
              <Mail size={14} className="text-primary" />
              <span>suporte@bidlive.ao</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500">
            <Link href="/ajuda" className="hover:text-primary transition-colors">Ajuda e Suporte</Link>
            <span className="w-px h-3 bg-gray-300"></span>
            <Link href="/termos" className="hover:text-primary transition-colors">Termos de Uso</Link>
          </div>
        </div> */}

        {/* MAIN NAVIGATION BAR */}
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-6 lg:px-12 h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={icon}
              alt="BidLive"
              width={140}
              height={50}
              priority
              className="object-contain"
            />
          </Link>

          {/* Menu Items */}
          <nav className="hidden lg:flex items-center gap-8 ml-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3 ml-auto shrink-0">
            <Link href="/signin" className="hidden sm:block">
              <Button variant="outline" size="md" className="font-semibold px-6 border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary">
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary" size="md" className="font-semibold px-6 shadow-md shadow-blue-500/10">
                Criar Conta
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
}