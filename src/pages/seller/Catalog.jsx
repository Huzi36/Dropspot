import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SellerSidebar from '../../components/SellerSidebar'

export default function SellerCatalog() {
    const { profile } = useAuth()
    const [products, setProducts] = useState([])
    const [filtered, setFiltered] = useState([])
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('All')
    const [categories, setCategories] = useState(['All'])
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [sellerPrices, setSellerPrices] = useState({})

    useEffect(() => { if (profile?.id) fetchData() }, [profile?.id])

    useEffect(() => {
        let result = products
        if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
        if (category !== 'All') result = result.filter(p => p.category === category)
        setFiltered(result)
    }, [search, category, products])

    async function fetchData() {
        try {
            const { data: prods } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
            if (prods) {
                setProducts(prods)
                setFiltered(prods)
                const cats = ['All', ...new Set(prods.map(p => p.category).filter(Boolean))]
                setCategories(cats)
            }
        } finally {
            setLoading(false)
        }
    }

    function calcCostPrice(product) {
        const margin = (product.supplier_price || 0) * 0.1
        const shipping = (product.weight_grams || 0) <= 500 ? 82.50 : 110
        return Math.ceil((product.supplier_price || 0) + margin + shipping)
    }

    function calcCustomerPrice(product, sellerProfit) {
        return calcCostPrice(product) + (parseFloat(sellerProfit) || 0)
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
            <SellerSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Product Catalog</h2>
                    <p className="text-gray-500 mt-1">Browse products from verified Indian suppliers.</p>
                </div>

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

                <div className="mb-6 text-sm text-gray-500">
                    <span className="font-semibold text-[#143D59]">{filtered.length}</span> products found
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
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
                                    )}
                                    {product.category && (
                                        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[#143D59] text-xs font-semibold px-3 py-1 rounded-full">
                                            {product.category}
                                        </span>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-semibold text-gray-900 mb-3 line-clamp-2 leading-snug">{product.name}</h3>
                                    <div className="bg-[#F7F8FA] rounded-xl p-3 mb-4 space-y-1">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Supplier price</span><span>₹{product.supplier_price}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Dropspot margin (10%)</span><span>₹{((product.supplier_price || 0) * 0.1).toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Shipping</span><span>₹{(product.weight_grams || 0) <= 500 ? '82.50' : '110'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-bold text-[#143D59] border-t border-gray-200 pt-1 mt-1">
                                            <span>Your cost price</span><span>₹{calcCostPrice(product)}</span>
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="text-xs text-gray-500 font-medium mb-1 block">Your desired profit (₹)</label>
                                        <input type="number" min="0" placeholder="e.g. 200"
                                            value={sellerPrices[product.id] || ''}
                                            onChange={e => setSellerPrices(prev => ({ ...prev, [product.id]: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800" />
                                        {sellerPrices[product.id] && (
                                            <div className="flex justify-between text-xs mt-2 font-semibold">
                                                <span className="text-gray-500">Customer pays</span>
                                                <span className="text-green-600">₹{calcCustomerPrice(product, sellerPrices[product.id]).toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs text-gray-400">{product.weight_grams ? `${product.weight_grams}g` : 'Weight N/A'}</span>
                                        <span className={`text-xs font-medium ${(product.stock || 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {(product.stock || 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                        </span>
                                    </div>
                                    <button disabled={(product.stock || 0) === 0}
                                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${(product.stock || 0) === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] hover:shadow-md'}`}>
                                        {(product.stock || 0) === 0 ? 'Out of Stock' : '+ Add to My Store'}
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