import {
    User,
    Lock,
    Eye,
    MessageCircle,
    Send,
    Globe,
    X,
} from "lucide-react";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

export default function SignIn() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-sm overflow-hidden">
                <div className="grid md:grid-cols-2" style={{ minHeight: 600 }}>
                    {/* Left Side */}
                    <div className="relative p-10 flex flex-col justify-center">
                        <button className="absolute top-6 left-6 text-gray-700 hover:text-black">
                            <X size={20} />
                        </button>

                        <div className="max-w-sm mx-auto w-full">
                            {/* Username */}
                            <div className="mb-4">
                                <Input
                                    type="text"
                                    placeholder="Nome de usuário ou e-mail"
                                    icon={<User size={18} />}
                                    fullWidth
                                />
                            </div>

                            {/* Password */}
                            <div className="relative mb-6">
                                <Input
                                    type="password"
                                    placeholder="Senha"
                                    icon={<Lock size={18} />}
                                    iconPosition="left"
                                    fullWidth
                                    className="pr-12"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                                    aria-label="Mostrar senha"
                                >
                                    <Eye size={18} />
                                </button>
                            </div>

                            {/* Remember + Login */}
                            <div className="flex items-center justify-between mb-4">
                                <label className="flex items-center gap-2 text-sm text-gray-500">
                                    <input type="checkbox" />
                                    Lembrar de mim
                                </label>

                                <Button variant="primary" size="md" className="px-8">
                                    ENTRAR
                                </Button>
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
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage:
                                    "linear-gradient(to bottom right, rgb(243 244 246), rgb(229 231 235), rgb(209 213 219))",
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}