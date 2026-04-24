import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SellerSidebar from '../../components/SellerSidebar'

const STATUS_COLORS = {
    new: 'bg-blue-100 text-blue-700',
    seller_paid: 'bg-yellow-100 text-yellow-700',
    routed: 'bg-purple-100 text-purple-700',
    packed: 'bg-orange-100 text-orange-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
}

export default function SellerOrders() {
    const { profile } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [sellerProfile, setSellerProfile] = useState(null)
    const [selected, setSelected] = useState({})
    const [activeTab, setActiveTab] = useState('new')
    const [paying, setPaying] = useState(false)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: sp } = await supabase
                .from('seller_profiles')
                .select('id')
                .eq('user_id', profile?.id)
                .single()
            setSellerProfile(sp)

            if (sp) {
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('*, order_items(*, products(name, images, weight_grams))')
                    .eq('seller_id', sp.id)
                    .order('created_at', { ascending: false })
                setOrders(ordersData || [])
            }
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { key: 'new', label: 'Pending Payment', count: orders.filter(o => o.order_status === 'new').length },
        { key: 'seller_paid', label: 'Processing', count: orders.filter(o => ['seller_paid', 'routed', 'packed'].includes(o.order_status)).length },
        { key: 'shipped', label: 'Shipped', count: orders.filter(o => o.order_status === 'shipped').length },
        { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.order_status === 'delivered').length },
    ]

    const filteredOrders = orders.filter(o => {
        if (activeTab === 'new') return o.order_status === 'new'
        if (activeTab === 'seller_paid') return ['seller_paid', 'routed', 'packed'].includes(o.order_status)
        if (activeTab === 'shipped') return o.order_status === 'shipped'
        if (activeTab === 'delivered') return o.order_status === 'delivered'
        return true
    })

    const selectedOrders = orders.filter(o => selected[o.id])
    const totalToPay = selectedOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)

    function toggleSelect(orderId) {
        setSelected(prev => ({ ...prev, [orderId]: !prev[orderId] }))
    }

    function selectAll() {
        const newOrders = filteredOrders.filter(o => o.order_status === 'new')
        const allSelected = newOrders.every(o => selected[o.id])
        const next = {}
        newOrders.forEach(o => next[o.id] = !allSelected)
        setSelected(prev => ({ ...prev, ...next }))
    }

    async function handleBatchPay() {
        if (selectedOrders.length === 0) return
        setPaying(true)
        try {
            for (const order of selectedOrders) {
                await supabase
                    .from('orders')
                    .update({ order_status: 'seller_paid', payment_status: 'paid' })
                    .eq('id', order.id)
            }
            await fetchData()
            setSelected({})
            alert(`✅ Payment successful for ${selectedOrders.length} order(s)! They have been routed to suppliers.`)
        } finally {
            setPaying(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

            <SellerSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Imported Orders</h2>
                        <p className="text-gray-500 mt-1">Manage and fulfill your customer orders.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-[#143D59] hover:bg-[#1a4f73] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all">
                        <span>🔗</span> Import from Shopify
                    </button>
                </div>

                {selectedOrders.length > 0 && (
                    <div className="bg-[#143D59] rounded-2xl p-5 mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-white font-semibold">{selectedOrders.length} order(s) selected</p>
                            <p className="text-blue-200 text-sm mt-0.5">Total: <span className="text-[#F5B41A] font-bold">₹{totalToPay.toLocaleString()}</span></p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setSelected({})} className="text-white/60 hover:text-white text-sm px-4 py-2 rounded-xl border border-white/20 transition-all">
                                Clear
                            </button>
                            <button onClick={handleBatchPay} disabled={paying}
                                className="bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold px-6 py-2 rounded-xl transition-all disabled:opacity-50">
                                {paying ? 'Processing...' : `Pay ₹${totalToPay.toLocaleString()} & Fulfill`}
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex gap-2 mb-6 border-b border-gray-200">
                    {tabs.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === tab.key
                                ? 'border-[#143D59] text-[#143D59]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-[#143D59] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {activeTab === 'new' && filteredOrders.length > 0 && (
                    <div className="flex items-center gap-3 mb-4">
                        <button onClick={selectAll} className="text-sm text-[#143D59] font-medium hover:underline">
                            {filteredOrders.every(o => selected[o.id]) ? 'Deselect All' : 'Select All'}
                        </button>
                        <span className="text-gray-300">|</span>
                        <span className="text-sm text-gray-500">{filteredOrders.length} orders pending payment</span>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="bg-gray-200 rounded h-4 w-1/4 mb-3" />
                                <div className="bg-gray-200 rounded h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-5xl mb-4">📭</p>
                        <p className="text-gray-500 font-medium">No orders here yet</p>
                        <p className="text-gray-400 text-sm mt-1">
                            {activeTab === 'new' ? 'Connect your Shopify store to start pulling in orders' : 'Orders will appear here once they progress'}
                        </p>
                        {activeTab === 'new' && (
                            <Link to="/seller/stores"
                                className="inline-block mt-4 bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2 rounded-xl hover:bg-[#e0a218] transition-all">
                                🔗 Connect Shopify
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <div key={order.id}
                                className={`bg-white rounded-2xl border transition-all ${selected[order.id] ? 'border-[#143D59] shadow-md' : 'border-gray-100 hover:shadow-sm'}`}>
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {order.order_status === 'new' && (
                                                <input type="checkbox" checked={!!selected[order.id]}
                                                    onChange={() => toggleSelect(order.id)}
                                                    className="w-4 h-4 accent-[#143D59] cursor-pointer" />
                                            )}
                                            <div>
                                                <p className="font-bold text-[#143D59]">#{order.id.slice(0, 8).toUpperCase()}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {order.shopify_order_id && <span className="ml-2 text-blue-400">· Shopify #{order.shopify_order_id}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.order_status] || 'bg-gray-100 text-gray-600'}`}>
                                            {order.order_status?.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-xs text-gray-400 font-medium mb-2">CUSTOMER</p>
                                            <p className="font-semibold text-gray-800">{order.customer_name || '—'}</p>
                                            <p className="text-sm text-gray-500">{order.customer_phone || '—'}</p>
                                            <p className="text-sm text-gray-500 mt-1">{order.customer_address}, {order.customer_city} - {order.customer_pincode}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <p className="text-xs text-gray-400 font-medium mb-2">ORDER SUMMARY</p>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Total amount</span>
                                                    <span className="font-bold text-[#143D59]">₹{order.total_amount?.toLocaleString() || '0'}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Your earnings</span>
                                                    <span className="font-semibold text-green-600">₹{order.seller_earnings?.toLocaleString() || '0'}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Shipping</span>
                                                    <span className="text-gray-700">₹{order.shipping_cost?.toLocaleString() || '0'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {order.order_items?.length > 0 && (
                                        <div className="border-t border-gray-100 pt-4">
                                            <p className="text-xs text-gray-400 font-medium mb-3">ITEMS</p>
                                            <div className="space-y-2">
                                                {order.order_items.map(item => (
                                                    <div key={item.id} className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                                                            {item.products?.images?.[0]
                                                                ? <img src={item.products.images[0]} className="w-full h-full object-cover rounded-lg" alt="" />
                                                                : '📦'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-800 truncate">{item.products?.name || 'Product'}</p>
                                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                        </div>
                                                        <p className="text-sm font-semibold text-gray-700">₹{item.selling_price?.toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {order.order_status === 'shipped' && (
                                        <div className="mt-4 border-t border-gray-100 pt-4">
                                            <button className="text-sm text-blue-600 font-medium hover:underline">
                                                🚚 Track shipment →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}