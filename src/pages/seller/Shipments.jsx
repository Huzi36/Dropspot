import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SellerSidebar from '../../components/SellerSidebar'

const STATUS_COLORS = {
    booked: 'bg-blue-100 text-blue-700',
    pending_pickup: 'bg-yellow-100 text-yellow-700',
    in_transit: 'bg-purple-100 text-purple-700',
    out_for_delivery: 'bg-orange-100 text-orange-700',
    delivered: 'bg-green-100 text-green-700',
    rto: 'bg-red-100 text-red-700',
}

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'booked', label: 'Booked' },
    { key: 'pending_pickup', label: 'Pending Pickup' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out For Delivery' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'rto', label: 'RTO' },
]

export default function SellerShipments() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [shipments, setShipments] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('all')

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: sp } = await supabase
                .from('seller_profiles')
                .select('id')
                .eq('user_id', profile?.id)
                .single()

            if (sp) {
                const { data } = await supabase
                    .from('shipments')
                    .select('*, orders(customer_name, customer_city, seller_id)')
                    .order('created_at', { ascending: false })
                setShipments(data || [])
            }
        } finally {
            setLoading(false)
        }
    }

    const filtered = activeTab === 'all'
        ? shipments
        : shipments.filter(s => s.status === activeTab)

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
                    {TABS.map(tab => (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                                ? 'bg-[#143D59] text-white'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-[#143D59]'}`}>
                            {tab.label}
                            {tab.key === 'all'
                                ? <span className="ml-2 text-xs">({shipments.length})</span>
                                : <span className="ml-2 text-xs">({shipments.filter(s => s.status === tab.key).length})</span>
                            }
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
                            <p className="text-gray-400 text-sm mt-1">Shipments will appear here once orders are fulfilled</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4">Order No</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Carrier</th>
                                        <th className="px-6 py-4">AWB</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filtered.map(shipment => (
                                        <tr key={shipment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                                #{shipment.orders?.id?.slice(0, 8).toUpperCase() || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(shipment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                                {shipment.orders?.customer_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {shipment.courier_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                                {shipment.awb_code || '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[shipment.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {shipment.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {shipment.tracking_url ? (
                                                    <a href={shipment.tracking_url} target="_blank" rel="noreferrer"
                                                        className="text-sm text-blue-600 font-medium hover:underline">
                                                        Track →
                                                    </a>
                                                ) : (
                                                    <span className="text-sm text-gray-400">—</span>
                                                )}
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