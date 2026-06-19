"use client";

import { FiUser, FiHeart, FiGlobe } from "react-icons/fi";
import { FaCoins } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function TopBar() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const handleProtectedClick = (path: string) => {
    if (!isAuthenticated) {
      router.push("/signin");
    } else {
      router.push(path);
    }
  };

  return (
    <div className="border-b border-slate-800 bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto flex h-10 items-center justify-between px-4">
        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="rounded bg-primary px-2 py-1 text-white font-medium shadow-sm">
            AO VIVO
          </span>
          <p className="hidden md:block font-medium">
            Acompanhe os melhores leilões em tempo real.
          </p>
        </div>
        <ul className="flex items-center gap-4 md:gap-6 text-xs text-slate-400 font-medium ml-auto sm:ml-0">
          <li 
            onClick={() => handleProtectedClick("/user")}
            className="hidden sm:flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
          >
            <FiUser size={14} />
            <span>Minha Conta</span>
          </li>
          <li 
            onClick={() => handleProtectedClick("/user/favorites")}
            className="hidden sm:flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
          >
            <FiHeart size={14} />
            <span>Favoritos</span>
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <FiGlobe size={14} />
            <select className="bg-transparent outline-none cursor-pointer text-slate-400 hover:text-primary transition-colors [&>option]:bg-[#0B0F19]">
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </li>
          <li className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
            <FaCoins size={14} />
            <select className="bg-transparent outline-none cursor-pointer text-slate-400 hover:text-primary transition-colors [&>option]:bg-[#0B0F19]">
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
