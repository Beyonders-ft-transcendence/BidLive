// components/layout/FeaturesBar.tsx

const features = [
    "Leilões seguros e confiáveis",
    "Pagamentos protegidos",
    "Sistema 100% digital",
    "Suporte especializado",
];

export default function FeaturesBar() {
    return (
        <section className="bg-gray-100 py-6 border-y">
            <div className="max-w-7xl mx-auto px-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white border rounded-sm px-5 py-4 flex items-center gap-3"
                        >

                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                ✓
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-gray-800">
                                    Segurança
                                </h4>

                                <p className="text-xs text-gray-500">
                                    {feature}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}