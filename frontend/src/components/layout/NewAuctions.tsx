// components/home/NewAuctionsSection.tsx

import Image from "next/image";

const auctions = [
    {
        id: 1,
        image: "/images/cards/auction-1.jpg",
        title: "Apartamento Premium Vista Mar",
        date: "15 Maio 2026",
        price: "10.300 Kz",
    },
    {
        id: 2,
        image: "/images/cards/auction-2.jpg",
        title: "Edifício Comercial Moderno",
        date: "20 Maio 2026",
        price: "10.300 Kz",
    },
    {
        id: 3,
        image: "/images/cards/auction-3.jpg",
        title: "Terreno Residencial Urbano",
        date: "28 Maio 2026",
        price: "10.300 Kz",
    },
    {
        id: 4,
        image: "/images/cards/auction-4.jpg",
        title: "Moradia T4 de Luxo",
        date: "30 Maio 2026",
        price: "10.300 Kz",
    },
];

export default function NewAuctionsSection() {
    return (
        <section className="bg-white py-10">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                        ✨
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800">
                        Novos Leilões
                    </h2>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {auctions.map((item) => (
                        <div
                            key={item.id}
                            className="border bg-white rounded-sm p-3 flex gap-4 hover:shadow-md transition"
                        >

                            {/* Image */}
                            <div className="relative w-40 h-24 overflow-hidden rounded-sm flex-shrink-0">

                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />

                                <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-sm">
                                    Novo
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex flex-col justify-between flex-1">

                                <div>
                                    <h3 className="text-sm font-medium text-gray-800 leading-5 line-clamp-2">
                                        {item.title}
                                    </h3>

                                    <p className="text-xs text-gray-400 mt-1">
                                        {item.date}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-3">

                                    <span className="text-blue-600 font-bold text-lg">
                                        {item.price}
                                    </span>

                                    <button className="text-xs text-blue-600 hover:underline">
                                        Ver detalhes
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}