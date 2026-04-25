import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SupplierSidebar from '../../components/SupplierSidebar'

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    packed: 'bg-purple-100 text-purple-700',
    ready_for_pickup: 'bg-green-100 text-green-700',
}

const TABS = [
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'packed', label: 'Packed' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup' },
]

export default function SupplierOrders() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('pending')
    const [updating, setUpdating] = useState(null)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: sp } = await supabase
                .from('supplier_profiles')
                .select('id')
                .eq('user_id', profile?.id)
                .single()

            if (sp) {
                const { data } = await supabase
                    .from('order_items')
                    .select('*, products(name, images), orders(customer_name, customer_phone, customer_address, customer_city, customer_pincode, order_status, created_at)')
                    .eq('supplier_id', sp.id)
                    .order('created_at', { ascending: false })
                setOrders(data || [])
            }
        } finally {
            setLoading(false)
        }
    }

    async function updateStatus(itemId, newStatus) {
        setUpdating(itemId)
        try {
            await supabase
                .from('order_items')
                .update({ supplier_status: newStatus })
                .eq('id', itemId)
            await fetchData()
        } finally {
            setUpdating(null)
        }
    }

    const filtered = orders.filter(o => o.supplier_status === activeTab)

    const nextStatus = {
        pending: 'confirmed',
        confirmed: 'packed',
        packed: 'ready_for_pickup',
    }

    const nextStatusLabel = {
        pending: 'Confirm Order',
        confirmed: 'Mark as Packed',
        packed: 'Ready for Pickup',
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

            <SupplierSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Orders</h2>
                    <p className="text-gray-500 mt-1">Manage and fulfill incoming orders.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === tab.key
                                ? 'border-[#143D59] text-[#143D59]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {tab.label}
                            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#143D59] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {orders.filter(o => o.supplier_status === tab.key).length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Orders */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="bg-gray-200 rounded h-4 w-1/4 mb-3" />
                                <div className="bg-gray-200 rounded h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-5xl mb-4">📭</p>
                        <p className="text-gray-500 font-medium">No {activeTab} orders</p>
                        <p className="text-gray-400 text-sm mt-1">Orders will appear here as they come in</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(item => (
                            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                            {item.products?.images?.[0]
                                                ? <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                                                : <span className="text-2xl">📦</span>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{item.products?.name || 'Product'}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Order #{item.order_id?.slice(0, 8).toUpperCase()} · Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[item.supplier_status] || 'bg-gray-100 text-gray-600'}`}>
                                        {item.supplier_status?.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-400 font-medium mb-2">SHIP TO</p>
                                        <p className="font-semibold text-gray-800 text-sm">{item.orders?.customer_name || '—'}</p>
                                        <p className="text-xs text-gray-500 mt-1">{item.orders?.customer_phone || '—'}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {item.orders?.customer_address}, {item.orders?.customer_city} - {item.orders?.customer_pincode}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <p className="text-xs text-gray-400 font-medium mb-2">ORDER INFO</p>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Your earnings</span>
                                                <span className="font-bold text-[#143D59]">₹{(item.base_price * item.quantity).toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Quantity</span>
                                                <span className="font-semibold text-gray-700">{item.quantity} units</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Order date</span>
                                                <span className="text-gray-500">
                                                    {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Button */}
                                {nextStatus[item.supplier_status] && (
                                    <button
                                        onClick={() => updateStatus(item.id, nextStatus[item.supplier_status])}
                                        disabled={updating === item.id}
                                        className="w-full bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">
                                        {updating === item.id ? 'Updating...' : nextStatusLabel[item.supplier_status]}
                                    </button>
                                )}

                                {item.supplier_status === 'ready_for_pickup' && (
                                    <div className="w-full bg-green-50 border border-green-200 text-green-700 font-bold py-2.5 rounded-xl text-center text-sm">
                                        ✅ Ready — Awaiting Shiprocket Pickup
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}