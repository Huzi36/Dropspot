import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SupplierSidebar from '../../components/SupplierSidebar'

export default function SupplierDashboard() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [stats, setStats] = useState({
        total_products: 0,
        active_products: 0,
        total_orders: 0,
        pending_orders: 0,
        total_earnings: 0,
    })
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: products } = await supabase
                .from('products')
                .select('id, in_stock')
                .eq('supplier_id', profile?.id)

            const { data: orderItems } = await supabase
                .from('order_items')
                .select('*, orders(order_status, created_at, customer_name, customer_city)')
                .eq('supplier_id', profile?.id)
                .order('created_at', { ascending: false })
                .limit(5)

            if (products) {
                setStats(prev => ({
                    ...prev,
                    total_products: products.length,
                    active_products: products.filter(p => p.in_stock).length,
                }))
            }

            if (orderItems) {
                setRecentOrders(orderItems)
                setStats(prev => ({
                    ...prev,
                    total_orders: orderItems.length,
                    pending_orders: orderItems.filter(o => o.supplier_status === 'pending').length,
                    total_earnings: orderItems.reduce((sum, o) => sum + (o.base_price * o.quantity || 0), 0),
                }))
            }
        } finally {
            setLoading(false)
        }
    }

    const STATUS_COLORS = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        packed: 'bg-purple-100 text-purple-700',
        ready_for_pickup: 'bg-green-100 text-green-700',
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

            <SupplierSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
                    </h2>
                    <p className="text-gray-500 mt-1">Here's what's happening with your products today.</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
                    {[
                        { label: 'Total Products', value: stats.total_products, icon: '📦', color: 'bg-blue-50 text-blue-600', trend: 'Listed' },
                        { label: 'In Stock', value: stats.active_products, icon: '✅', color: 'bg-green-50 text-green-600', trend: 'Available' },
                        { label: 'Pending Orders', value: stats.pending_orders, icon: '⏳', color: 'bg-yellow-50 text-yellow-600', trend: 'Needs action' },
                        { label: 'Total Earnings', value: `₹${stats.total_earnings.toLocaleString()}`, icon: '💰', color: 'bg-purple-50 text-purple-600', trend: 'All time' },
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <Link to="/supplier-console/products"
                        className="bg-[#143D59] hover:bg-[#1a4f73] text-white rounded-2xl p-6 flex items-center gap-4 transition-all hover:shadow-lg group">
                        <span className="text-3xl">➕</span>
                        <div>
                            <p className="font-bold">Add New Product</p>
                            <p className="text-white/60 text-sm">List a product for sellers to sell</p>
                        </div>
                        <span className="ml-auto text-white/40 group-hover:text-white transition-colors">→</span>
                    </Link>
                    <Link to="/supplier-console/orders"
                        className="bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] rounded-2xl p-6 flex items-center gap-4 transition-all hover:shadow-lg group">
                        <span className="text-3xl">📋</span>
                        <div>
                            <p className="font-bold">View Orders</p>
                            <p className="text-[#143D59]/60 text-sm">Pack and prepare shipments</p>
                        </div>
                        <span className="ml-auto text-[#143D59]/40 group-hover:text-[#143D59] transition-colors">→</span>
                    </Link>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h3 className="font-bold text-[#143D59] text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>Recent Orders</h3>
                        <Link to="/supplier-console/orders" className="text-sm text-[#F5B41A] font-semibold hover:underline">View all →</Link>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading...</div>
                    ) : recentOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-4xl mb-3">📭</p>
                            <p className="text-gray-500 font-medium">No orders yet</p>
                            <p className="text-gray-400 text-sm mt-1">Orders will appear here once sellers start selling your products</p>
                            <Link to="/supplier-console/products"
                                className="inline-block mt-4 bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2 rounded-xl hover:bg-[#e0a218] transition-all">
                                Add Products
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
                                    {recentOrders.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-500">#{item.order_id?.slice(0, 8)}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.orders?.customer_name || '—'}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-[#143D59]">₹{(item.base_price * item.quantity).toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[item.supplier_status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {item.supplier_status?.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(item.created_at).toLocaleDateString('en-IN')}
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