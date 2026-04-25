import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { Search, ShoppingCart, User, ChevronRight, Star } from 'lucide-react'

const CATEGORIES = [
    { name: 'All', icon: '🛍️' },
    { name: 'Fashion', icon: '👗' },
    { name: 'Electronics', icon: '📱' },
    { name: 'Beauty', icon: '💄' },
    { name: 'Home', icon: '🏠' },
    { name: 'Fitness', icon: '💪' },
    { name: 'Kids', icon: '🧸' },
    { name: 'Automobile', icon: '🚗' },
    { name: 'Gifts', icon: '🎁' },
]

const HOW_IT_WORKS = [
    { icon: '🔍', title: 'Browse', desc: 'Explore verified products' },
    { icon: '💰', title: 'Set Price', desc: 'Add your profit margin' },
    { icon: '🚚', title: 'We Ship', desc: 'Supplier packs & delivers' },
]

export default function Home() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [filtered, setFiltered] = useState([])
    const [category, setCategory] = useState('All')
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchProducts() }, [])

    useEffect(() => {
        let result = products
        if (category !== 'All') result = result.filter(p =>
            p.category?.toLowerCase().includes(category.toLowerCase()))
        if (search) result = result.filter(p =>
            p.name.toLowerCase().includes(search.toLowerCase()))
        setFiltered(result)
    }, [category, search, products])

    async function fetchProducts() {
        try {
            const { data } = await supabase
                .from('products')
                .select('*, supplier_profiles(business_name)')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
            setProducts(data || [])
            setFiltered(data || [])
        } finally {
            setLoading(false)
        }
    }

    function calcPrice(product) {
        const margin = product.supplier_price * 0.1
        const shipping = product.weight_grams <= 500 ? 82.50 : 110
        return Math.ceil(product.supplier_price + margin + shipping)
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />

            {/* Announcement Bar */}
            <div className="bg-[#143D59] text-white text-xs text-center py-2 px-4">
                🚀 Sell on Dropspot — Zero inventory, set your own margins.{' '}
                <Link to="/signup" className="text-[#F5B41A] font-semibold underline">Join free →</Link>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0">
                        <h1 className="text-[#143D59] text-xl font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Drop<span className="text-[#F5B41A]">spot.</span>
                        </h1>
                    </Link>

                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {user ? (
                            <Link to={profile?.role === 'supplier' ? '/supplier/dashboard' : '/seller/dashboard'}
                                className="flex items-center gap-1.5 bg-[#143D59] text-white text-xs font-semibold px-3 py-2 rounded-xl">
                                <User size={14} />
                                <span className="hidden sm:block">Dashboard</span>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login"
                                    className="text-sm text-gray-600 font-medium px-3 py-2 hidden sm:block">
                                    Sign in
                                </Link>
                                <Link to="/signup"
                                    className="bg-[#F5B41A] text-[#143D59] text-xs font-bold px-3 py-2 rounded-xl">
                                    Start Selling
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Banner */}
            <div className="bg-[#143D59] relative overflow-hidden">
                <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #F5B41A 0%, transparent 60%)' }} />
                <div className="max-w-7xl mx-auto px-4 py-8 md:py-10 flex items-center justify-between relative">
                    <div className="max-w-lg">
                        <p className="text-[#F5B41A] text-xs font-semibold uppercase tracking-widest mb-2">New Arrivals</p>
                        <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-3"
                            style={{ fontFamily: "'Syne', sans-serif" }}>
                            Sell Without<br />Holding Stock
                        </h2>
                        <p className="text-blue-200 text-sm mb-5 hidden md:block">
                            Browse verified Indian suppliers. Set your price. We ship directly to your customers.
                        </p>
                        <Link to="/signup"
                            className="inline-block bg-[#F5B41A] text-[#143D59] font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#e0a218] transition-all">
                            Start Selling Free →
                        </Link>
                    </div>
                    <div className="hidden md:flex gap-4">
                        {['📦', '🚚', '💰'].map((icon, i) => (
                            <div key={i} className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20">
                                {icon}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Category Pills */}
            <div className="bg-white border-b border-gray-100 sticky top-14 z-40">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
                        {CATEGORIES.map(cat => (
                            <button key={cat.name} onClick={() => setCategory(cat.name)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${category === cat.name
                                    ? 'bg-[#143D59] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">

                {/* How it works strip */}
                <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        {HOW_IT_WORKS.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 flex-1">
                                <span className="text-2xl">{item.icon}</span>
                                <div className="hidden sm:block">
                                    <p className="text-xs font-bold text-[#143D59]">{item.title}</p>
                                    <p className="text-xs text-gray-400">{item.desc}</p>
                                </div>
                                {i < HOW_IT_WORKS.length - 1 && (
                                    <ChevronRight size={16} className="text-gray-300 ml-auto flex-shrink-0" />
                                )}
                            </div>
                        ))}
                        <Link to="/signup"
                            className="ml-4 bg-[#F5B41A] text-[#143D59] text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap flex-shrink-0">
                            Join Free
                        </Link>
                    </div>
                </div>

                {/* Products Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-[#143D59] text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                            {category === 'All' ? 'All Products' : category}
                        </h3>
                        <p className="text-gray-400 text-xs mt-0.5">{filtered.length} products available</p>
                    </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                                <div className="bg-gray-200 h-44" />
                                <div className="p-3">
                                    <div className="bg-gray-200 rounded h-3 mb-2 w-3/4" />
                                    <div className="bg-gray-200 rounded h-3 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-4xl mb-3">🔍</p>
                        <p className="text-gray-500 font-medium">No products found</p>
                        <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {filtered.map(product => (
                            <div key={product.id}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all group cursor-pointer">
                                {/* Image */}
                                <div className="relative h-44 bg-gray-50 overflow-hidden">
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                                    )}
                                    {product.stock <= 10 && product.stock > 0 && (
                                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            Only {product.stock} left
                                        </span>
                                    )}
                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                            <span className="text-gray-500 text-xs font-bold">Out of Stock</span>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3">
                                    <p className="text-xs text-gray-400 mb-1 truncate">{product.supplier_profiles?.business_name || 'Verified Supplier'}</p>
                                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-2">{product.name}</h4>

                                    {/* Price */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[#143D59] font-black text-base">₹{calcPrice(product).toLocaleString()}</p>
                                            <p className="text-gray-400 text-xs line-through">₹{Math.ceil(product.supplier_price * 1.5).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-0.5 text-yellow-400">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-xs text-gray-500">4.5</span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    {user && profile?.role === 'seller' ? (
                                        <button
                                            onClick={() => navigate('/seller/catalog')}
                                            className="w-full mt-3 bg-[#F5B41A] text-[#143D59] text-xs font-bold py-2 rounded-xl hover:bg-[#e0a218] transition-all">
                                            + Add to Store
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => navigate('/signup')}
                                            className="w-full mt-3 bg-[#143D59] text-white text-xs font-bold py-2 rounded-xl hover:bg-[#1a4f73] transition-all">
                                            Sell This Product
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-[#143D59] mt-12 py-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        <div className="col-span-2 md:col-span-1">
                            <h3 className="text-white text-xl font-black mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Drop<span className="text-[#F5B41A]">spot.</span>
                            </h3>
                            <p className="text-white/40 text-xs leading-relaxed">
                                India's stockless B2B2C marketplace.
                            </p>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Platform</p>
                            <div className="space-y-2">
                                {['How it works', 'Categories', 'Pricing'].map(item => (
                                    <p key={item} className="text-white/40 text-xs hover:text-white cursor-pointer transition-colors">{item}</p>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Sellers</p>
                            <div className="space-y-2">
                                {['Shopify Sellers', 'Influencers', 'WhatsApp Sellers'].map(item => (
                                    <p key={item} className="text-white/40 text-xs hover:text-white cursor-pointer transition-colors">{item}</p>
                                ))}
                            </div>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Company</p>
                            <div className="space-y-2">
                                {['About Us', 'Contact', 'Privacy Policy', 'Terms'].map(item => (
                                    <p key={item} className="text-white/40 text-xs hover:text-white cursor-pointer transition-colors">{item}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="text-white/30 text-xs">© 2025 Dropspot. All rights reserved.</p>
                        <a href="/seller-console" className="text-white/30 text-xs hover:text-white transition-colors">
                            Supplier Console →
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    )
}