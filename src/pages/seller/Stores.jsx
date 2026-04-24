import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'

const NAV = [
    { icon: '⚡', label: 'Dashboard', path: '/seller/dashboard' },
    { icon: '👤', label: 'Account Details', path: '/seller/account' },
    { icon: '🔗', label: 'Linked Stores', path: '/seller/stores' },
    { icon: '📤', label: 'Exported Products', path: '/seller/catalog' },
    { icon: '📥', label: 'Imported Orders', path: '/seller/orders' },
    { icon: '🚚', label: 'Shipments', path: '/seller/shipments' },
]

export default function SellerStores() {
    const { profile, signOut } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [sellerProfile, setSellerProfile] = useState(null)
    const [shopifyUrl, setShopifyUrl] = useState('')
    const [shopifyToken, setShopifyToken] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: sp } = await supabase
                .from('seller_profiles')
                .select('*')
                .eq('user_id', profile?.id)
                .single()
            setSellerProfile(sp)
            if (sp?.shopify_store_url) setShopifyUrl(sp.shopify_store_url)
            if (sp?.shopify_access_token) setShopifyToken(sp.shopify_access_token)
        } finally {
            setLoading(false)
        }
    }

    async function handleSave() {
        setSaving(true)
        setError('')
        try {
            const { error } = await supabase
                .from('seller_profiles')
                .update({
                    shopify_store_url: shopifyUrl,
                    shopify_access_token: shopifyToken
                })
                .eq('user_id', profile?.id)
            if (error) throw error
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function handleDisconnect() {
        if (!confirm('Are you sure you want to disconnect your Shopify store?')) return
        await supabase
            .from('seller_profiles')
            .update({ shopify_store_url: null, shopify_access_token: null })
            .eq('user_id', profile?.id)
        setShopifyUrl('')
        setShopifyToken('')
        setSaved(false)
    }

    const isConnected = sellerProfile?.shopify_store_url && sellerProfile?.shopify_access_token

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-[#143D59] min-h-screen flex flex-col fixed top-0 left-0 z-10`}>
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
                <nav className="flex-1 p-4 space-y-1">
                    {NAV.map(item => (
                        <Link key={item.path} to={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${item.path === '/seller/stores' ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                            <span className="text-xl">{item.icon}</span>
                            {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                        </Link>
                    ))}
                </nav>
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
                    <button onClick={async () => { await signOut(); window.location.href = '/login' }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                        <span>🚪</span>
                        {sidebarOpen && <span className="text-sm">Sign out</span>}
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Linked Stores</h2>
                    <p className="text-gray-500 mt-1">Connect your Shopify store to automatically import orders into Dropspot.</p>
                </div>

                {/* Connection Status */}
                <div className={`rounded-2xl p-6 mb-6 flex items-center gap-4 ${isConnected ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isConnected ? 'bg-green-100' : 'bg-yellow-100'}`}>
                        {isConnected ? '✅' : '⚠️'}
                    </div>
                    <div>
                        <p className={`font-bold ${isConnected ? 'text-green-800' : 'text-yellow-800'}`}>
                            {isConnected ? 'Shopify Store Connected' : 'No Store Connected'}
                        </p>
                        <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                            {isConnected ? sellerProfile.shopify_store_url : 'Connect your Shopify store to start importing orders automatically'}
                        </p>
                    </div>
                    {isConnected && (
                        <button onClick={handleDisconnect}
                            className="ml-auto text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 px-4 py-2 rounded-xl hover:bg-red-50 transition-all">
                            Disconnect
                        </button>
                    )}
                </div>

                {/* How it works */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                    <h3 className="font-bold text-[#143D59] text-lg mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>How it works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { step: '1', title: 'Connect Store', desc: 'Enter your Shopify store URL and access token below', icon: '🔗' },
                            { step: '2', title: 'Customer Orders', desc: 'When a customer orders on your Shopify store, we pull it in automatically', icon: '📥' },
                            { step: '3', title: 'Pay & Fulfill', desc: 'Pay for the order on Dropspot and we route it to the supplier for shipping', icon: '🚚' },
                        ].map(item => (
                            <div key={item.step} className="flex gap-4 p-4 bg-[#F7F8FA] rounded-xl">
                                <div className="w-10 h-10 bg-[#143D59] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800 mb-1">{item.icon} {item.title}</p>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Connect Form */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <h3 className="font-bold text-[#143D59] text-lg mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
                        {isConnected ? 'Update Store Connection' : 'Connect Your Shopify Store'}
                    </h3>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    {saved && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            ✅ Store connected successfully!
                        </div>
                    )}

                    <div className="space-y-5 max-w-lg">
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Shopify Store URL</label>
                            <input
                                type="text"
                                value={shopifyUrl}
                                onChange={e => setShopifyUrl(e.target.value)}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59] focus:border-transparent"
                                placeholder="yourstore.myshopify.com"
                            />
                            <p className="text-xs text-gray-400 mt-1">Enter your Shopify store URL without https://</p>
                        </div>

                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Access Token</label>
                            <input
                                type="password"
                                value={shopifyToken}
                                onChange={e => setShopifyToken(e.target.value)}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59] focus:border-transparent"
                                placeholder="shpat_xxxxxxxxxxxx"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Find this in your Shopify Admin → Settings → Apps → Develop apps → Create an app
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || !shopifyUrl || !shopifyToken}
                            className="bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                            {saving ? 'Connecting...' : isConnected ? 'Update Connection' : 'Connect Shopify Store'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}