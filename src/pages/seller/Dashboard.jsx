import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'

const NAV = [
    { icon: '⚡', label: 'Dashboard', path: '/seller/dashboard' },
    { icon: '🛍️', label: 'Catalog', path: '/seller/catalog' },
    { icon: '📦', label: 'Orders', path: '/seller/orders' },
]

export default function SellerDashboard() {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({ total_orders: 0, pending_orders: 0, total_earnings: 0, pending_payment: 0 })
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: sellerProfile } = await supabase
                .from('seller_profiles')
                .select('id')
                .eq('user_id', profile?.id)
                .single()

            if (!sellerProfile) return

            const { data: orders } = await supabase
                .from('orders')
                .select('*')
                .eq('seller_id', sellerProfile.id)
                .order('created_at', { ascending: false })
                .limit(5)

            if (orders) {
                setRecentOrders(orders)
                setStats({
                    total_orders: orders.length,
                    pending_orders: orders.filter(o => o.order_status === 'new').length,
                    total_earnings: orders.reduce((sum, o) => sum + (o.seller_earnings || 0), 0),
                    pending_payment: orders.filter(o => o.payment_status === 'pending').reduce((sum, o) => sum + (o.total_amount || 0), 0),
                })
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleSignOut() {
        await signOut()
        navigate('/login')
    }

    const statusColors = {
        new: 'bg-blue-100 text-blue-700',
        seller_paid: 'bg-yellow-100 text-yellow-700',
        routed: 'bg-purple-100 text-purple-700',
        packed: 'bg-orange-100 text-orange-700',
        shipped: 'bg-indigo-100 text-indigo-700',
        delivered: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-[#143D59] min-h-screen flex flex-col`}>
                {/* Logo */}
                <div className="p-6 flex items-center justify-between border-b border-white/10">
                    {sidebarOpen && (
                        <div>
                            <h1 className="text-white font-bold text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>Dropspot.</h1>
                            <p className="text-[#F5B41A] text-xs mt-0.5">Seller Portal</p>
                        </div>
                    )}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/60 hover:text-white transition-colors ml-auto">
                        {sidebarOpen ? '◀' : '▶'}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-4 space-y-1">
                    {NAV.map(item => (
                        <Link key={item.path} to={item.path}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all group">
                            <span className="text-xl">{item.icon}</span>
                            {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* User */}
                <div className="p-4 border-t border-white/10">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3 mb-3 px-3">
                            <div className="w-8 h-8 rounded-full bg-[#F5B41A] flex items-center justify-center text-[#143D59] font-bold text-sm">
                                {profile?.full_name?.[0] || 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{profile?.full_name || 'Seller'}</p>
                                <p className="text-white/40 text-xs">Seller</p>
                            </div>
                        </div>
                    )}
                    <button onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                        <span>🚪</span>
                        {sidebarOpen && <span className="text-sm">Sign out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-auto">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Good morning{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
                    </h2>
                    <p className="text-gray-500 mt-1">Here's what's happening with your store today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                    {[
                        { label: 'Total Orders', value: stats.total_orders, icon: '📦', color: 'bg-blue-50 text-blue-600', trend: 'All time' },
                        { label: 'Pending Orders', value: stats.pending_orders, icon: '⏳', color: 'bg-yellow-50 text-yellow-600', trend: 'Needs payment' },
                        { label: 'Total Earnings', value: `₹${stats.total_earnings.toLocaleString()}`, icon: '💰', color: 'bg-green-50 text-green-600', trend: 'All time' },
                        { label: 'Pending Payment', value: `₹${stats.pending_payment.toLocaleString()}`, icon: '🔔', color: 'bg-red-50 text-red-600', trend: 'Pay to fulfill' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center text-lg`}>{stat.icon}</span>
                                <span className="text-xs text-gray-400">{stat.trend}</span>
                            </div>
                            <p className="text-2xl font-bold text-[#143D59]">{loading ? '—' : stat.value}</p>
                            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <Link to="/seller/catalog"
                        className="bg-[#143D59] hover:bg-[#1a4f73] text-white rounded-2xl p-6 flex items-center gap-4 transition-all hover:shadow-lg group">
                        <span className="text-3xl">🛍️</span>
                        <div>
                            <p className="font-bold">Browse Catalog</p>
                            <p className="text-white/60 text-sm">Find products to sell</p>
                        </div>
                        <span className="ml-auto text-white/40 group-hover:text-white transition-colors">→</span>
                    </Link>

                    <Link to="/seller/orders"
                        className="bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] rounded-2xl p-6 flex items-center gap-4 transition-all hover:shadow-lg group">
                        <span className="text-3xl">📋</span>
                        <div>
                            <p className="font-bold">Manage Orders</p>
                            <p className="text-[#143D59]/60 text-sm">Pay & fulfill orders</p>
                        </div>
                        <span className="ml-auto text-[#143D59]/40 group-hover:text-[#143D59] transition-colors">→</span>
                    </Link>

                    <button
                        className="bg-white hover:bg-gray-50 text-[#143D59] rounded-2xl p-6 flex items-center gap-4 transition-all hover:shadow-lg border border-gray-100 group w-full">
                        <span className="text-3xl">🔗</span>
                        <div className="text-left">
                            <p className="font-bold">Connect Shopify</p>
                            <p className="text-gray-400 text-sm">Sync your store</p>
                        </div>
                        <span className="ml-auto text-gray-300 group-hover:text-[#143D59] transition-colors">→</span>
                    </button>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h3 className="font-bold text-[#143D59] text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Recent Orders</h3>
                        <Link to="/seller/orders" className="text-sm text-[#F5B41A] font-semibold hover:underline">View all →</Link>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading...</div>
                    ) : recentOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-4xl mb-3">📭</p>
                            <p className="text-gray-500 font-medium">No orders yet</p>
                            <p className="text-gray-400 text-sm mt-1">Start by browsing the catalog and connecting your Shopify store</p>
                            <Link to="/seller/catalog"
                                className="inline-block mt-4 bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2 rounded-xl hover:bg-[#e0a218] transition-all">
                                Browse Catalog
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-3">Order</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {recentOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-500">#{order.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.customer_name || '—'}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-[#143D59]">₹{order.total_amount?.toLocaleString() || '0'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[order.order_status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {order.order_status?.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(order.created_at).toLocaleDateString('en-IN')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}