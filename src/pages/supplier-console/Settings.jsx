import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import SupplierSidebar from '../../components/SupplierSidebar'
import { Bell, Shield, Globe, Trash2 } from 'lucide-react'

export default function SupplierSettings() {
    const { profile, signOut } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [notifications, setNotifications] = useState({
        new_order: true,
        order_update: true,
        payment: true,
        marketing: false,
    })

    function toggleNotification(key) {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
            <SupplierSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Settings</h2>
                    <p className="text-gray-500 mt-1">Manage your account preferences.</p>
                </div>

                <div className="space-y-6 max-w-2xl">

                    {/* Notifications */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Bell size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#143D59]">Notifications</h3>
                                <p className="text-xs text-gray-400">Choose what you want to be notified about</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { key: 'new_order', label: 'New Order', desc: 'When a seller places a new order for your product' },
                                { key: 'order_update', label: 'Order Updates', desc: 'Status changes on your orders' },
                                { key: 'payment', label: 'Payments', desc: 'When a payout is processed to your account' },
                                { key: 'marketing', label: 'Marketing Tips', desc: 'Tips to improve your product listings' },
                            ].map(item => (
                                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{item.label}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                    </div>
                                    <button
                                        onClick={() => toggleNotification(item.key)}
                                        className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${notifications[item.key] ? 'bg-[#143D59]' : 'bg-gray-200'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${notifications[item.key] ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                <Shield size={18} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#143D59]">Security</h3>
                                <p className="text-xs text-gray-400">Manage your account security</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-3 border-b border-gray-50">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Email</p>
                                    <p className="text-xs text-gray-400">{profile?.email}</p>
                                </div>
                                <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">Verified</span>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Password</p>
                                    <p className="text-xs text-gray-400">Last changed recently</p>
                                </div>
                                <a href="/seller-console/account"
                                    className="text-xs text-[#143D59] font-semibold hover:underline">
                                    Change →
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Store Info */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                                <Globe size={18} className="text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#143D59]">Store Visibility</h3>
                                <p className="text-xs text-gray-400">Control how your products appear on Dropspot</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-sm text-gray-600">Your products are currently <span className="font-bold text-green-600">visible</span> to all sellers on Dropspot.</p>
                            <p className="text-xs text-gray-400 mt-1">To hide individual products, go to My Products and toggle visibility.</p>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white rounded-2xl border border-red-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                                <Trash2 size={18} className="text-red-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-600">Danger Zone</h3>
                                <p className="text-xs text-gray-400">Irreversible actions — proceed with caution</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-3 border border-red-100 rounded-xl px-4">
                            <div>
                                <p className="text-sm font-medium text-gray-800">Delete Account</p>
                                <p className="text-xs text-gray-400">Permanently delete your supplier account and all products</p>
                            </div>
                            <button className="text-xs text-red-500 font-semibold border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-all">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}