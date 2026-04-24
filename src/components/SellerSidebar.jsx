import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    LayoutDashboard,
    User,
    Store,
    PackageSearch,
    ShoppingCart,
    Truck,
    Heart,
    FileText,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

const NAV = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/seller/dashboard' },
    { icon: User, label: 'Account Details', path: '/seller/account' },
    { icon: Store, label: 'Linked Stores', path: '/seller/stores' },
    { icon: PackageSearch, label: 'Exported Products', path: '/seller/catalog' },
    { icon: ShoppingCart, label: 'Imported Orders', path: '/seller/orders' },
    { icon: Truck, label: 'Shipments', path: '/seller/shipments' },
    { icon: Heart, label: 'Wishlist', path: '/seller/wishlist' },
    { icon: FileText, label: 'Invoices', path: '/seller/invoices' },
]

export default function SellerSidebar({ open, setOpen }) {
    const { profile, signOut } = useAuth()
    const location = useLocation()

    return (
        <aside className={`${open ? 'w-64' : 'w-20'} transition-all duration-300 bg-[#143D59] min-h-screen flex flex-col fixed top-0 left-0 z-10`}>
            {/* Logo */}
            <div className="p-6 flex items-center justify-between border-b border-white/10">
                {open && (
                    <div>
                        <h1 className="text-white font-bold text-xl tracking-tight">Dropspot.</h1>
                        <p className="text-[#F5B41A] text-xs mt-0.5">Seller Portal</p>
                    </div>
                )}
                <button
                    onClick={() => setOpen(!open)}
                    className="text-white/40 hover:text-white transition-colors ml-auto p-1 rounded-lg hover:bg-white/10">
                    {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5">
                {NAV.map(item => {
                    const Icon = item.icon
                    const active = location.pathname === item.path
                    return (
                        <Link key={item.path} to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${active
                                ? 'bg-white/15 text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/8'}`}>
                            <Icon size={18} strokeWidth={active ? 2 : 1.5} className="flex-shrink-0" />
                            {open && <span className={`text-sm ${active ? 'font-semibold' : 'font-normal'}`}>{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* User */}
            <div className="p-3 border-t border-white/10">
                {open && (
                    <div className="flex items-center gap-3 px-3 py-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-[#F5B41A] flex items-center justify-center text-[#143D59] font-bold text-sm flex-shrink-0">
                            {profile?.full_name?.[0]?.toUpperCase() || 'S'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{profile?.full_name || 'Seller'}</p>
                            <p className="text-white/40 text-xs truncate">{profile?.email || ''}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={async () => { await signOut(); window.location.href = '/login' }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/8 transition-all">
                    <LogOut size={18} strokeWidth={1.5} className="flex-shrink-0" />
                    {open && <span className="text-sm">Sign out</span>}
                </button>
            </div>
        </aside>
    )
}