import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SellerSidebar from '../../components/SellerSidebar'

const STATUS_COLORS = {
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
}

export default function SellerShipments() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')

    useEffect(() => { if (profile?.id) fetchData() }, [profile?.id])

    async function fetchData() {
        try {
            const { data } = await supabase
                .from('orders')
                .select('*')
                .eq('seller_id', profile.id)
                .in('order_status', ['shipped', 'delivered'])
                .order('created_at', { ascending: false })
            setOrders(data || [])
        } finally {
            setLoading(false)
        }
    }

    const filtered = activeTab === 'all' ? orders : orders.filter(o => o.order_status === activeTab)

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
            <SellerSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Shipments</h2>
                    <p className="text-gray-500 mt-1">Track all your shipments in real time.</p>
                </div>

                <div className="flex gap-2 mb-6 flex-wrap">
                    {['all', 'shipped', 'delivered'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-[#143D59] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#143D59]'}`}>
                            {tab} ({tab === 'all' ? orders.length : orders.filter(o => o.order_status === tab).length})
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading shipments...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-16 text-center">
                            <p className="text-5xl mb-4">🚚</p>
                            <p className="text-gray-500 font-medium">No shipments yet</p>
                            <p className="text-gray-400 text-sm mt-1">Shipments appear here once orders are shipped</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4">Order</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Tracking</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-600">#{order.id.slice(0, 8).toUpperCase()}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">{order.customer_name || '—'}</td>
                                            <td className="px-6 py-4 text-sm font-mono text-gray-600">{order.tracking_number || '—'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {order.order_status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-400">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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