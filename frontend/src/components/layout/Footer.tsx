// components/layout/Footer.tsx

export default function Footer() {
    return (
        <footer className="bg-[#2f313d] text-gray-300">

            {/* Top */}
            <div className="max-w-7xl mx-auto px-4 py-14">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            TOURPRO X
                        </h2>

                        <p className="text-sm text-gray-400 leading-6">
                            Plataforma moderna para leilões online em tempo real,
                            oferecendo segurança, transparência e praticidade.
                        </p>
                    </div>

                    {/* Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">
                            Informações
                        </h3>

                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Sobre
                                </a>
                            </li>

                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Como Funciona
                                </a>
                            </li>

                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Termos
                                </a>
                            </li>

                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Privacidade
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">
                            Categorias
                        </h3>

                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Imóveis
                                </a>
                            </li>

                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Veículos
                                </a>
                            </li>

                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Tecnologia
                                </a>
                            </li>

                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Equipamentos
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Column */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">
                            Suporte
                        </h3>

                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Central de Ajuda
                                </a>
                            </li>

                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Contactos
                                </a>
                            </li>

                            <li>
                                <a href="#" className="hover:text-white transition">
                                    FAQ
                                </a>
                            </li>

                            <li>
                                <a href="#" className="hover:text-white transition">
                                    Atendimento
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-white/10">
                <div className="max-w-[1400px] mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3">

                    <p className="text-xs text-gray-500">
                        © 2026 TOURPRO X. Todos os direitos reservados.
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <a href="#" className="hover:text-white transition">
                            Política
                        </a>

                        <a href="#" className="hover:text-white transition">
                            Termos
                        </a>

                        <a href="#" className="hover:text-white transition">
                            Segurança
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}