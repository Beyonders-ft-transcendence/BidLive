import React from "react";
import {
  User,
  Lock,
  Eye,
  MessageCircle,
  Send,
  Globe,
  X,
} from "lucide-react";

export default function SignIn() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden">
        <div className="grid md:grid-cols-2 min-h-[600px]">
          {/* Left Side */}
          <div className="relative p-10 flex flex-col justify-center">
            <button className="absolute top-6 left-6 text-gray-700 hover:text-black">
              <X size={20} />
            </button>

            <div className="max-w-sm mx-auto w-full">
              {/* Username */}
              <div className="relative mb-4">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Nome de usuário ou e-mail"
                  className="w-full border border-gray-200 rounded px-12 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Password */}
              <div className="relative mb-6">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  className="w-full border border-gray-200 rounded px-12 py-3 pr-12 outline-none focus:border-blue-500"
                />
                <Eye
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                />
              </div>

              {/* Remember + Login */}
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-sm text-gray-500">
                  <input type="checkbox" />
                  Lembrar de mim
                </label>

                <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded text-sm font-medium transition">
                  ENTRAR
                </button>
              </div>

              {/* Links */}
              <div className="flex justify-between text-sm mb-8">
                <a href="#" className="text-blue-500 hover:underline">
                  Cadastre-se agora
                </a>

                <a href="#" className="text-gray-500 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-sm">ou</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Social Buttons */}
              <div className="space-y-4">
                <button className="w-full flex items-center bg-[#3b5998] text-white rounded overflow-hidden">
                  <span className="px-4 py-3 border-r border-white/20">
                    <MessageCircle size={18} />
                  </span>
                  <span className="flex-1 py-3 text-sm font-medium">
                    ENTRAR COM FACEBOOK
                  </span>
                </button>

                <button className="w-full flex items-center bg-[#1da1f2] text-white rounded overflow-hidden">
                  <span className="px-4 py-3 border-r border-white/20">
                    <Send size={18} />
                  </span>
                  <span className="flex-1 py-3 text-sm font-medium">
                    ENTRAR COM TWITTER
                  </span>
                </button>

                <button className="w-full flex items-center bg-[#ea4335] text-white rounded overflow-hidden">
                  <span className="px-4 py-3 border-r border-white/20">
                    <Globe size={18} />
                  </span>
                  <span className="flex-1 py-3 text-sm font-medium">
                    ENTRAR COM GOOGLE
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="bg-gray-200 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}