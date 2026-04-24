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

export default function SellerCatalog() {
    const { profile, signOut } = useAuth()
    const [products, setProducts] = useState([])
    const [filtered, setFiltered] = useState([])
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [categories, setCategories] = useState(['All'])
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [addedProducts, setAddedProducts] = useState({})
    const [sellerProfile, setSellerProfile] = useState(null)
    const [sellerPrices, setSellerPrices] = useState({})

    useEffect(() => { fetchData() }, [])

    useEffect(() => {
        let result = products
        if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        if (category !== 'All') result = result.filter(p => p.category === category)
        setFiltered(result)
    }, [search, category, products])

    async function fetchData() {
        try {
            const { data: sp } = await supabase
                .from('seller_profiles')
                .select('id')
                .eq('user_id', profile?.id)
                .single()
            setSellerProfile(sp)

            const { data: prods } = await supabase
                .from('products')
                .select('*, supplier_profiles(business_name)')
                .eq('is_active', true)

            if (prods) {
                setProducts(prods)
                setFiltered(prods)
                const cats = ['All', ...new Set(prods.map(p => p.category).filter(Boolean))]
                setCategories(cats)
            }

            if (sp) {
                const { data: sellerProds } = await supabase
                    .from('seller_products')
                    .select('product_id')
                    .eq('seller_id', sp.id)
                if (sellerProds) {
                    const added = {}
                    sellerProds.forEach(sp => added[sp.product_id] = true)
                    setAddedProducts(added)
                }
            }
        } finally {
            setLoading(false)
        }
    }

    function calcCostPrice(product) {
        const margin = product.supplier_price * 0.1
        const shipping = product.weight_grams <= 500 ? 82.50 : 110
        return Math.ceil(product.supplier_price + margin + shipping)
    }

    function calcCustomerPrice(product, sellerProfit) {
        return calcCostPrice(product) + (parseFloat(sellerProfit) || 0)
    }

    async function addToStore(product) {
        if (!sellerProfile) return
        const profit = parseFloat(sellerPrices[product.id]) || 0
        const customerPrice = calcCustomerPrice(product, profit)
        const { error } = await supabase.from('seller_products').insert({
            seller_id: sellerProfile.id,
            product_id: product.id,
            selling_price: customerPrice,
            is_active: true
        })
        if (!error) setAddedProducts(prev => ({ ...prev, [product.id]: true }))
    }

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
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${item.path === '/seller/catalog' ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
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
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Exported Products</h2>
                    <p className="text-gray-500 mt-1">Browse products from verified Indian suppliers and add them to your store.</p>
                </div>

                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800"
                            placeholder="Search products..." />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {categories.map(cat => (
                            <button key={cat} onClick={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${category === cat ? 'bg-[#143D59] text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-[#143D59]'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-semibold text-[#143D59]">{filtered.length}</span> products found
                    {search && <span>for "<span className="font-medium">{search}</span>"</span>}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="bg-gray-200 rounded-xl h-48 mb-4" />
                                <div className="bg-gray-200 rounded h-4 mb-2 w-3/4" />
                                <div className="bg-gray-200 rounded h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-5xl mb-4">🔍</p>
                        <p className="text-gray-500 font-medium">No products found</p>
                        <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map(product => (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                                <div className="relative h-52 bg-gray-50 overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                                    )}
                                    {product.category && (
                                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#143D59] text-xs font-semibold px-3 py-1 rounded-full">
                                            {product.category}
                                        </span>
                                    )}
                                    {addedProducts[product.id] && (
                                        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                            ✓ Added
                                        </span>
                                    )}
                                </div>

                                <div className="p-5">
                                    <p className="text-xs text-gray-400 mb-1">{product.supplier_profiles?.business_name || 'Verified Supplier'}</p>
                                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">{product.name}</h3>

                                    <div className="bg-[#F7F8FA] rounded-xl p-3 mb-4 space-y-1">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Supplier price</span>
                                            <span>₹{product.supplier_price}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Dropspot margin (10%)</span>
                                            <span>₹{(product.supplier_price * 0.1).toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Shipping</span>
                                            <span>₹{product.weight_grams <= 500 ? '82.50' : '110'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-[#143D59] border-t border-gray-200 pt-1 mt-1">
                                            <span>Your cost price</span>
                                            <span>₹{calcCostPrice(product)}</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <label className="text-xs text-gray-500 font-medium mb-1 block">Your desired profit (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="e.g. 200"
                                            value={sellerPrices[product.id] || ''}
                                            onChange={e => setSellerPrices(prev => ({ ...prev, [product.id]: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800"
                                        />
                                        {sellerPrices[product.id] && (
                                            <div className="flex justify-between text-xs mt-2 font-semibold">
                                                <span className="text-gray-500">Customer pays</span>
                                                <span className="text-green-600">₹{calcCustomerPrice(product, sellerPrices[product.id]).toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs text-gray-400">
                                            {product.weight_grams ? `${product.weight_grams}g` : 'Weight N/A'}
                                        </span>
                                        <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => addToStore(product)}
                                        disabled={addedProducts[product.id] || product.stock === 0}
                                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${addedProducts[product.id]
                                            ? 'bg-green-50 text-green-600 cursor-default'
                                            : product.stock === 0
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] hover:shadow-md'}`}>
                                        {addedProducts[product.id] ? '✓ Added to Store' : product.stock === 0 ? 'Out of Stock' : '+ Add to My Store'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}