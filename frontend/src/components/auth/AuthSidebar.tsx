import React from "react";

interface AuthSidebarProps {
    mode?: "signin" | "signup";
}

export default function AuthSidebar({ mode = "signin" }: AuthSidebarProps) {
    const isSignIn = mode === "signin";

    return (
        <div className="md:col-span-5 bg-primary p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Top Right Dot Grid Pattern */}
            <div className="absolute top-8 right-8 opacity-20 text-white select-none pointer-events-none">
                <svg className="w-12 h-12" viewBox="0 0 48 48">
                    <g fill="currentColor">
                        <circle cx="4" cy="4" r="1.5" /><circle cx="16" cy="4" r="1.5" /><circle cx="28" cy="4" r="1.5" /><circle cx="40" cy="4" r="1.5" />
                        <circle cx="4" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /><circle cx="28" cy="16" r="1.5" /><circle cx="40" cy="16" r="1.5" />
                        <circle cx="4" cy="28" r="1.5" /><circle cx="16" cy="28" r="1.5" /><circle cx="28" cy="28" r="1.5" /><circle cx="40" cy="28" r="1.5" />
                        <circle cx="4" cy="40" r="1.5" /><circle cx="16" cy="40" r="1.5" /><circle cx="28" cy="40" r="1.5" /><circle cx="40" cy="40" r="1.5" />
                    </g>
                </svg>
            </div>

            {/* Bottom Left Dot Grid Pattern */}
            <div className="absolute bottom-8 left-8 opacity-20 text-white select-none pointer-events-none">
                <svg className="w-12 h-12" viewBox="0 0 48 48">
                    <g fill="currentColor">
                        <circle cx="4" cy="4" r="1.5" /><circle cx="16" cy="4" r="1.5" /><circle cx="28" cy="4" r="1.5" /><circle cx="40" cy="4" r="1.5" />
                        <circle cx="4" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /><circle cx="28" cy="16" r="1.5" /><circle cx="40" cy="16" r="1.5" />
                        <circle cx="4" cy="28" r="1.5" /><circle cx="16" cy="28" r="1.5" /><circle cx="28" cy="28" r="1.5" /><circle cx="40" cy="28" r="1.5" />
                        <circle cx="4" cy="40" r="1.5" /><circle cx="16" cy="40" r="1.5" /><circle cx="28" cy="40" r="1.5" /><circle cx="40" cy="40" r="1.5" />
                    </g>
                </svg>
            </div>

            {/* Background circular segment blur */}
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Logo */}
            <div className="flex items-center z-10 select-none">
                <svg className="h-6 w-6 text-white shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2.5" fill="none" />
                    <path d="M6 18L18 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span className="text-lg font-bold ml-2 tracking-tight">BidLive.</span>
            </div>

            {/* Center Mockup Visuals */}
            <div className="relative w-full max-w-[280px] mx-auto my-auto aspect-[1.1] scale-95 md:scale-100 transition-all duration-300">
                {/* Main White Card */}
                <div className="bg-white rounded-sm shadow-2xl p-4 text-gray-800 relative z-0 w-[90%] mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium px-1">
                        {isSignIn ? (
                            <>
                                <div>
                                    <p className="text-gray-400 font-normal">Licitações</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">$24.908,00</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 font-normal">Arrematado</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">$1.028,00</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <p className="text-gray-400 font-normal">Ativos Agora</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">3.420</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-400 font-normal">Lances/min</p>
                                    <p className="text-sm font-bold text-gray-900 mt-0.5">42</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* SVG Line Chart with floating tooltip */}
                    <div className="relative h-16 mt-4">
                        <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path d="M 0,40 Q 15,10 30,28 T 60,12 T 90,20 T 100,8 L 100,40 Z" fill="url(#chart-gradient)" opacity="0.08" />
                            <path d="M 0,35 Q 15,10 30,28 T 60,12 T 90,20 T 100,8" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
                            <circle cx="30" cy="28" r="3" fill="var(--primary)" />
                        </svg>
                        <defs>
                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" />
                                <stop offset="100%" stopColor="#FFFFFF" />
                            </linearGradient>
                        </defs>
                        <div className="absolute top-[8px] left-[18%] bg-gray-900 text-[8px] text-white px-2 py-0.5 rounded-md shadow-md font-semibold">
                            {isSignIn ? "Lance: $5.052" : "Lances: +18%"}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="flex justify-between text-[8px] text-gray-400 mt-1 px-1">
                        <span>06 Jun</span>
                        <span>07 Jun</span>
                        <span>08 Jun</span>
                        <span>09 Jun</span>
                    </div>

                    {/* Transactions/Auctions list */}
                    <div className="mt-3 space-y-2.5">
                        {isSignIn ? (
                            <>
                                {/* MacBook Pro */}
                                <div className="flex justify-between items-center text-[9px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-primary font-bold text-[8px]">
                                            M
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">MacBook Pro</p>
                                            <p className="text-[7px] text-gray-400 font-light">Hoje às 07:18</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900">+$523,10</span>
                                </div>
                                {/* PlayStation 5 */}
                                <div className="flex justify-between items-center text-[9px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-primary font-bold text-[8px]">
                                            P
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">PlayStation 5</p>
                                            <p className="text-[7px] text-gray-400 font-light">Hoje às 06:24</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-500">-$550,00</span>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* BMW M3 */}
                                <div className="flex justify-between items-center text-[9px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-primary font-bold text-[8px]">
                                            B
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">BMW M3 Sedan</p>
                                            <p className="text-[7px] text-gray-400 font-light">Há 2 mins</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-green-600">$67.500</span>
                                </div>
                                {/* iPhone 15 */}
                                <div className="flex justify-between items-center text-[9px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-primary font-bold text-[8px]">
                                            I
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">iPhone 15 Pro</p>
                                            <p className="text-[7px] text-gray-400 font-light">Há 5 mins</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-gray-900">$950</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Floating Card 1 */}
                <div className="absolute right-[-12px] top-[26%] bg-white rounded-sm shadow-lg border border-gray-50 p-2.5 flex items-center gap-2 z-10 w-[135px] text-gray-800 animate-bounce-slow">
                    <div className="w-6 h-6 rounded-sm bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div className="text-[8px]">
                        <p className="text-gray-400 font-normal">
                            {isSignIn ? "Lance Vencedor" : "Leilão Criado"}
                        </p>
                        <p className="font-bold text-primary">
                            {isSignIn ? "+$24.900,00" : "Porsche 911"}
                        </p>
                    </div>
                </div>

                {/* Floating Card 2 */}
                <div className="absolute left-[-20px] bottom-[12%] bg-white rounded-sm shadow-lg border border-gray-50 p-2.5 flex flex-col items-center gap-1 z-10 w-[95px] text-center text-gray-800 animate-bounce-slow-reverse">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-[7px] text-gray-400 leading-tight">
                        {isSignIn ? "Licitação Confirmada" : "Novo Utilizador"}
                    </p>
                    <p className="text-[9px] font-bold text-gray-900">
                        {isSignIn ? "$950,00" : "@john_doe"}
                    </p>
                </div>
            </div>

            {/* Bottom Content */}
            <div className="z-10 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-none">
                    {isSignIn ? "Rápido, Simples e Seguro" : "Junte-se à Comunidade"}
                </h3>
                <p className="text-xs md:text-[13px] text-blue-100 mt-3 font-light leading-relaxed max-w-[290px]">
                    {isSignIn
                        ? "O BidLive ajuda-o a gerir os seus leilões, licitações e negócios em tempo real com total transparência e segurança. Licite agora."
                        : "Crie a sua conta no BidLive para aceder instantaneamente a milhares de leilões ativos, licitar em tempo real e fechar negócios incríveis com total transparência."}
                </p>
                {/* Carousel indicators */}
                <div className="flex justify-center md:justify-start gap-1.5 mt-5">
                    <span className={`h-1 rounded-full transition-all duration-300 ${isSignIn ? "w-5 bg-white" : "w-1 bg-white/40"}`}></span>
                    <span className={`h-1 rounded-full transition-all duration-300 ${!isSignIn ? "w-5 bg-white" : "w-1 bg-white/40"}`}></span>
                    <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                </div>
            </div>
        </div>
    );
}
