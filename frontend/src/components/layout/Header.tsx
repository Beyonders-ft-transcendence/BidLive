"use client";

import Image from 'next/image';
import Link from 'next/dist/client/link';
import icon from '@/assets/images/icon.png'
import law from '@/assets/images/law.png';
import search from '@/assets/images/search.png';
import Signin from "@/components/layout/Signin";
import CategoriesDropdown from "@/components/common/CategoriesDropdown";
import { useState } from 'react';

export default function Header() {
    const [isSigninOpen, setIsSigninOpen] = useState(false);

    const openSignin = () => setIsSigninOpen(true);
    const closeSignin = () => setIsSigninOpen(false);

    return (
        <>
            <header className="bg-white border-b border-gray-200 py-4">
            <nav className='max-w-7xl mx-auto flex items-center justify-between' >

                <div className='flex items-center space-x-8' >
                    <Image
                        src={icon}
                        width={130}
                        height={40}
                        alt="BidLive Logo"
                        className="inline-block "
                    />

                    <ul className='flex items-center space-x-4' >
                        <li>
                            <Link
                                href="/"
                            >
                                Leilões
                            </Link>
                        </li>
                        <li>
                            <CategoriesDropdown />
                        </li>
                        <li>
                            <Link
                                href="/"
                            >
                                Vendedor
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className='bg-gray-200 p-2 flex items-center rounded-md w-96' >
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

                <ul className='flex items-center space-x-4' >
                    <li>
                        <button
                            onClick={openSignin}
                            className='cursor-pointer hover:text-[#2563eb] transition-colors'
                        >
                            Entrar
                        </button>
                    </li>
                    <li>
                        <button 
                            onClick={openSignin}
                            className='bg-[#2563eb] text-white px-4 py-2 rounded-md hover:bg-[#1d4ed8] transition-colors' 
                        >            
                            Registrar
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={openSignin}
                            className='flex items-center cursor-pointer hover:text-[#2563eb] transition-colors'
                        >
                            Favoritos
                            <Image
                                src={law}
                                width={25}
                                height={20}
                                alt="BidLive Logo"
                                className="inline-block ml-1"
                            />
                        </button>
                    </li>
                </ul>

            </nav>
        </header>
        {isSigninOpen && <Signin onClose={closeSignin} />}
        </>
    );
}