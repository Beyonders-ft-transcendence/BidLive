import Link from 'next/link'
import Image from 'next/image'
import {
    Search, Bell, Mail, ChevronDown,
    LayoutDashboard, Users, Settings, Factory,
    Gavel, TrendingUp, AlertCircle
}
    from 'lucide-react';
import icon from '@/assets/images/icon2.png';

export default function Header() {

    const NAV = [
        { name: 'Dashboard', href: '/backoffice/dashboard', icon: LayoutDashboard },
        { name: 'Usuários', href: '/backoffice/users', icon: Users },
        { name: 'Empresas', href: '/backoffice/companies', icon: Factory },
        { name: 'Leilões', href: '/backoffice/auctions', icon: Gavel },
        { name: 'Lances', href: '/backoffice/bids', icon: TrendingUp },
        { name: 'Denúncias', href: '/backoffice/reports', icon: AlertCircle },
        { name: 'Configurações', href: '/backoffice/settings', icon: Settings },
    ]

    return (
        <header className="w-full shadow-sm">
            <div className='bg-[#0B1F3B] text-white'>
                <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-3">

                    {/* LEFT */}
                    <div className="flex items-center gap-6">

                        {/* Logo */}
                        <Link href="/backoffice" className="flex items-center gap-2">
                            <Image src={icon} alt="logo" width={130} height={40} />
                        </Link>
                    </div>

                    {/* Search */}
                    <div className="relative hidden md:block w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Buscar usuários, leilões..."
                            className="w-full pl-9 pr-4 py-1 rounded-md bg-white/10 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                    </div>

                    {/* RIGHT */}
                    <div className="flex items-center gap-4">

                        <button className="hover:bg-white/10 p-2 rounded-full">
                            <Mail size={18} />
                        </button>

                        <button className="hover:bg-white/10 p-2 rounded-full">
                            <Bell size={18} />
                        </button>

                        {/* User */}
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded-md">
                            <span className="text-sm hidden sm:block">Super Admin</span>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>
            </div>

            {/* NAV ADMIN */}
            <nav className='max-w-7xl mx-auto px-6 py-3'>
                <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
                    {
                        NAV.map((item) => {
                            const IconComponent = item.icon
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="hover:text-gray-400 flex items-center gap-1"
                                >
                                    <IconComponent size={16} />
                                    {item.name}
                                </Link>
                            )
                        })
                    }
                </div>
            </nav>
        </header>
    )
}