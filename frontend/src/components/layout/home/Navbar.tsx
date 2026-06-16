"use client";

import { FiMenu } from "react-icons/fi";
import { FaGavel } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white shadow-xl relative z-10">
      <div className="max-w-7xl mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4 md:gap-8 h-full">
          <button className="flex items-center gap-2 text-white lg:hidden hover:text-primary transition-colors">
            <FiMenu size={24} />
          </button>
          <ul className="hidden lg:flex items-center h-full">
            <li className="flex items-center h-full border-b-[3px] border-primary px-6 text-sm font-bold text-white cursor-pointer bg-gray-800/50">
              Início
            </li>
            <li className="flex items-center h-full px-6 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all cursor-pointer">
              Leilões
            </li>
            <li className="flex items-center h-full px-6 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all cursor-pointer">
              Categorias
            </li>
            <li className="flex items-center h-full px-6 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all cursor-pointer">
              Como Funciona
            </li>
            <li className="flex items-center h-full px-6 text-sm font-semibold text-gray-300 hover:text-white hover:bg-gray-800 transition-all cursor-pointer">
              Contacto
            </li>
          </ul>
        </div>
        <button className="flex h-full items-center gap-2 md:gap-3 bg-primary px-4 md:px-8 text-xs md:text-sm font-bold text-white hover:bg-primary-light transition-all shadow-lg hover:shadow-primary/40 active:scale-95">
          <FaGavel size={16} className="md:w-[18px] md:h-[18px]" />
          <span className="hidden sm:inline">Meus Lances</span>
        </button>
      </div>
    </nav>
  );
}
