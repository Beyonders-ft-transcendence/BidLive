"use client";

import { FiUser, FiHeart, FiGlobe } from "react-icons/fi";
import { FaCoins } from "react-icons/fa";

export default function TopBar() {
  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto flex h-10 items-center justify-between px-4">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="rounded bg-primary px-2 py-1 text-white font-medium shadow-sm">
            AO VIVO
          </span>
          <p className="font-medium">
            Acompanhe os melhores leilões em tempo real.
          </p>
        </div>
        <ul className="flex items-center gap-6 text-xs text-gray-600 font-medium">
          <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <FiUser size={14} />
            <span>Minha Conta</span>
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <FiHeart size={14} />
            <span>Favoritos</span>
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <FiGlobe size={14} />
            <select className="bg-transparent outline-none cursor-pointer text-gray-600 hover:text-primary transition-colors">
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <FaCoins size={14} />
            <select className="bg-transparent outline-none cursor-pointer text-gray-600 hover:text-primary transition-colors">
              <option value="aoa">Kz (AOA)</option>
              <option value="usd">USD ($)</option>
              <option value="eur">EUR (€)</option>
            </select>
          </li>
        </ul>
      </div>
    </div>
  );
}
