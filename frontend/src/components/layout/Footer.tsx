// components/layout/Footer.tsx
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#0C1B33] text-gray-300 font-sans antialiased">
            {/* Top */}
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div className="flex flex-col items-start">
                        <Link href="/" className="mb-5 inline-block">
                            <h2 className="text-3xl font-extrabold text-white tracking-tight">
                                BidLive<span className="text-primary">.</span>
                            </h2>
                        </Link>

                        <p className="text-sm text-gray-400 leading-relaxed pr-4">
                            Plataforma moderna para leilões online em tempo real,
                            oferecendo segurança, transparência e praticidade na
                            arrematação de bens.
                        </p>
                    </div>

                    {/* Column */}
                    <div>
                        <h3 className="text-white text-sm font-bold tracking-wider uppercase mb-5">
                            Informações
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Sobre</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Como Funciona</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Termos de Uso</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Privacidade</Link></li>
                        </ul>
                    </div>

                    {/* Column */}
                    <div>
                        <h3 className="text-white text-sm font-bold tracking-wider uppercase mb-5">
                            Categorias
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Imóveis</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Veículos</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Eletrônicos</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Equipamentos</Link></li>
                        </ul>
                    </div>

                    {/* Column */}
                    <div>
                        <h3 className="text-white text-sm font-bold tracking-wider uppercase mb-5">
                            Suporte
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Central de Ajuda</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Fale Conosco</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Dúvidas Frequentes (FAQ)</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-primary transition-colors">Atendimento</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-white/10">
                <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} BidLive. Todos os direitos reservados.
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                        <Link href="#" className="hover:text-primary transition-colors">
                            Política de Privacidade
                        </Link>
                        <Link href="#" className="hover:text-primary transition-colors">
                            Termos
                        </Link>
                        <Link href="#" className="hover:text-primary transition-colors">
                            Segurança
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}