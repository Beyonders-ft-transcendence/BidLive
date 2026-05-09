"use client";

import Image from 'next/image';
import Link from 'next/dist/client/link';
import icon from '@/assets/images/icon.png'
import search from '@/assets/images/search.png';
import { Bell, MessageSquare, Settings, User, Heart } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const [isSigninOpen, setIsSigninOpen] = useState(false);

    const openSignin = () => setIsSigninOpen(true);
    const closeSignin = () => setIsSigninOpen(false);

    return (
        <>
            <header className="bg-white shadow-sm border-b border-gray-200 py-4 sticky top-0 z-50">
                <nav className='max-w-7xl mx-auto px-4 flex items-center justify-between' >

                    <div className='flex items-center space-x-10' >
                        <Link href="/" className="hover:opacity-90 transition-opacity">
                            <Image
                                src={icon}
                                width={120}
                                height={36}
                                alt="BidLive Logo"
                                className="inline-block"
                            />
                        </Link>

                        <ul className='hidden md:flex items-center space-x-6' >
                            <li>
                                <Link
                                    href="/user/"
                                    className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/user/auctions"
                                    className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                                >
                                    Meus Leilões
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/user/bids"
                                    className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
                                >
                                    Meus Lances
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className='hidden lg:flex bg-gray-200 p-2 items-center rounded-md w-96' >
                        <input type="text"
                            placeholder="Buscar leilões, categorias, vendedores..."
                            className='flex-1 bg-transparent outline-none'
                        />
                        <button className='bg-transparent cursor-pointer' >
                            <Image
                                src={search}
                                width={20}
                                height={20}
                                alt="Search Icon"
                            />
                        </button>
                    </div>

                    <div className='flex items-center space-x-2' >
                        <div className="flex items-center space-x-1 pr-4 border-r border-gray-100">
                            <button className='p-2 text-gray-500 hover:bg-gray-50 hover:text-primary rounded-full transition-all group' title="Favoritos">
                                <Heart size={20} />
                            </button>
                            <button className='p-2 text-gray-500 hover:bg-gray-50 hover:text-primary rounded-full transition-all relative group' title="Mensagens">
                                <MessageSquare size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
                            </button>
                            <button className='p-2 text-gray-500 hover:bg-gray-50 hover:text-primary rounded-full transition-all relative group' title="Notificações">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform"></span>
                            </button>
                            <button className='p-2 text-gray-500 hover:bg-gray-50 hover:text-primary rounded-full transition-all group' title="Configurações">
                                <Settings size={20} className="group-hover:rotate-45 transition-transform duration-300" />
                            </button>
                        </div>

                        <div className="flex items-center space-x-3 pl-2">
                            <button className="w-10 h-10 rounded-sm bg-primary/5 flex items-center justify-center border border-primary/10 overflow-hidden cursor-pointer hover:ring-4 hover:ring-primary/10 transition-all group">
                                <User className="text-primary group-hover:scale-110 transition-transform" size={22} />
                            </button>
                        </div>
                    </div>

                </nav>
            </header>
        </>
    );
}