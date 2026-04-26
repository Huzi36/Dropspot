import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    User,
    Truck,
    MessageCircle,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

export default function SupplierSidebar({ open, setOpen }) {
    const { profile, signOut } = useAuth()
    const location = useLocation()
    const [unansweredCount, setUnansweredCount] = useState(0)

    useEffect(() => { fetchUnanswered() }, [profile])

    async function fetchUnanswered() {
        if (!profile?.id) return
        try {
            const { data: sp } = await supabase
                .from('supplier_profiles')
                .select('id')
                .eq('user_id', profile.id)
                .single()

            if (sp) {
                const { data: products } = await supabase
                    .from('products')
                    .select('id')
                    .eq('supplier_id', sp.id)

                if (products?.length > 0) {
                    const productIds = products.map(p => p.id)
                    const { count } = await supabase
                        .from('product_questions')
                        .select('id', { count: 'exact', head: true })
                        .in('product_id', productIds)
                        .is('answer', null)
                    setUnansweredCount(count || 0)
                }
            }
        } catch (e) { }
    }

    const NAV = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/seller-console/dashboard' },
        { icon: Package, label: 'My Products', path: '/seller-console/products' },
        { icon: ShoppingCart, label: 'Orders', path: '/seller-console/orders' },
        { icon: Truck, label: 'Shipping', path: '/seller-console/shipping' },
        { icon: MessageCircle, label: 'Q&A', path: '/seller-console/qa', badge: unansweredCount },
        { icon: User, label: 'Account', path: '/seller-console/account' },
        { icon: Settings, label: 'Settings', path: '/seller-console/settings' },
    ]

    return (
        <aside className={`${open ? 'w-64' : 'w-20'} transition-all duration-300 bg-[#143D59] min-h-screen flex flex-col fixed top-0 left-0 z-10`}>
            {/* Logo */}
            <div className="p-6 flex items-center justify-between border-b border-white/10">
                {open && (
                    <div>
                        <h1 className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Drop<span className="text-[#F5B41A]">spot.</span>
                        </h1>
                        <p className="text-[#F5B41A] text-xs mt-0.5">Supplier Console</p>
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
                                : 'text-white/50 hover:text-white hover:bg-white/10'}`}>
                            <div className="relative flex-shrink-0">
                                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                                {item.badge > 0 && !open && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {item.badge > 9 ? '9+' : item.badge}
                                    </span>
                                )}
                            </div>
                            {open && (
                                <span className={`text-sm flex-1 ${active ? 'font-semibold' : 'font-normal'}`}>
                                    {item.label}
                                </span>
                            )}
                            {open && item.badge > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
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
                            <p className="text-white text-sm font-medium truncate">{profile?.full_name || 'Supplier'}</p>
                            <p className="text-white/40 text-xs truncate">{profile?.email || ''}</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={async () => { await signOut(); window.location.href = '/seller-console' }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all">
                    <LogOut size={18} strokeWidth={1.5} className="flex-shrink-0" />
                    {open && <span className="text-sm">Sign out</span>}
                </button>
            </div>
        </aside>
    )
}