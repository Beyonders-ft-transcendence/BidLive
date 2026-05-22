import Image from "next/image";

const auctions = [
    {
        id: 1,
        title: "Apartamento T3 no Centro",
        location: "Luanda, Angola",
        image: "/images/cards/auction-1.jpg",
        price: "12.500.000 Kz",
        bids: 30,
    },
    {
        id: 2,
        title: "Toyota Land Cruiser",
        location: "Benguela, Angola",
        image: "/images/cards/auction-2.jpg",
        price: "18.200.000 Kz",
        bids: 18,
    },
    {
        id: 3,
        title: "Equipamentos Industriais",
        location: "Huambo, Angola",
        image: "/images/cards/auction-3.jpg",
        price: "7.900.000 Kz",
        bids: 12,
    },
    {
        id: 4,
        title: "Moradia Duplex Moderna",
        location: "Lubango, Angola",
        image: "/images/cards/auction-4.jpg",
        price: "25.000.000 Kz",
        bids: 42,
    },
];

export default function AuctionSection() {
    return (
        <section className="py-8">
            <div className="max-w-7xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">

                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center">
                            🏠
                        </div>

                        <h2 className="text-lg font-semibold text-gray-800">
                            Leilões em Destaque
                        </h2>
                    </div>

                    <button className="border border-blue-500 text-blue-600 px-4 py-1.5 rounded-sm text-sm hover:bg-blue-50 transition">
                        Ver Mais
                    </button>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    {auctions.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white border border-gray-300 rounded-sm overflow-hidden hover:shadow-md transition"
                        >

                            {/* Image */}
                            <div className="relative h-40">

                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />

                                {/* Badge */}
                                <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-sm">
                                    AO VIVO
                                </div>

                                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-sm">
                                    Novo
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-3">

                                <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-5 mb-1">
                                    {item.title}
                                </h3>

                                <p className="text-xs text-gray-500 mb-2">
                                    {item.location}
                                </p>

                                <p className="text-lg font-bold text-gray-900 mb-3">
                                    {item.price}
                                </p>

                                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">

                                    <div>
                                        Lances
                                        <span className="ml-1 font-semibold text-gray-800">
                                            {item.bids}
                                        </span>
                                    </div>

                                    <button className="text-blue-600 hover:underline">
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