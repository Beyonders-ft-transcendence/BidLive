"use client";

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    icon: string;
    count?: number;
}

const categories: Category[] = [
    { id: 1, name: "Eletrônicos", icon: "📱", count: 1240 },
    { id: 2, name: "Moda e Acessórios", icon: "👔", count: 856 },
    { id: 3, name: "Casa e Jardim", icon: "🏠", count: 542 },
    { id: 4, name: "Esportes", icon: "⚽", count: 478 },
    { id: 5, name: "Livros e Mídia", icon: "📚", count: 634 },
    { id: 6, name: "Colecionáveis", icon: "🎨", count: 892 },
    { id: 7, name: "Automotivo", icon: "🚗", count: 315 },
    { id: 8, name: "Joias e Relógios", icon: "⌚", count: 421 },
];

interface CategoriesDropdownProps {
    onCategorySelect?: (category: Category) => void;
}

export default function CategoriesDropdown({ onCategorySelect }: CategoriesDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleCategoryClick = (category: Category) => {
        onCategorySelect?.(category);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 group"
            >
                <span className="text-gray-700 font-medium group-hover:text-[#2563eb] transition-colors">
                    Categorias
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-600 group-hover:text-[#2563eb] transition-all duration-300 ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-4 w-130 bg-white rounded-sm shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Grid */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryClick(category)}
                                onMouseEnter={() => setHoveredId(category.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                className="group flex items-start gap-3 text-left relative"
                            >
                                {/* Icon */}
                                <div className="text-2xl transition-transform duration-200 group-hover:scale-110">
                                    {category.icon}
                                </div>

                                {/* Text */}
                                <div className="flex flex-col">
                                    <span className="text-gray-900 font-medium text-sm group-hover:text-blue-600 transition-colors">
                                        {category.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {category.count} leilões
                                    </span>
                                </div>

                                {/* Arrow */}
                                <span
                                    className={`ml-auto text-blue-600 transition-all duration-200 ${hoveredId === category.id
                                            ? "opacity-100 translate-x-0"
                                            : "opacity-0 translate-x-2"
                                        }`}
                                >
                                    →
                                </span>

                                {/* Hover highlight (lado esquerdo tipo imagem) */}
                                <div
                                    className={`absolute left-[-12px] top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded transition-all duration-200 ${hoveredId === category.id ? "opacity-100" : "opacity-0"
                                        }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
