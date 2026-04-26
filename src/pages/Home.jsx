import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { Search, Heart, User, ShoppingBag, Package, Zap, TrendingUp, Shield, ChevronRight, ChevronLeft, X } from 'lucide-react'

const CATEGORIES = [
    { name: 'Fashion', emoji: '👗' },
    { name: 'Electronics', emoji: '📱' },
    { name: 'Beauty', emoji: '💄' },
    { name: 'Home & Kitchen', emoji: '🏠' },
    { name: 'Fitness', emoji: '💪' },
    { name: 'Baby & Kids', emoji: '🧸' },
    { name: 'Automobile', emoji: '🚗' },
    { name: 'Gifts & Decor', emoji: '🎁' },
]

const HOW_IT_WORKS = [
    { icon: Package, title: 'Find Products That Sell', desc: 'Browse verified products from trusted Indian suppliers' },
    { icon: Zap, title: 'Connect Your Store', desc: 'Link your Shopify store and sync orders automatically' },
    { icon: TrendingUp, title: 'Focus on Marketing', desc: 'Suppliers handle packaging and dispatch for you' },
    { icon: Shield, title: 'Earn Profits, Hassle-Free', desc: 'You pay only supplier price + shipping. Keep the rest' },
]

export default function Home() {
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [category, setCategory] = useState('All')
    const [search, setSearch] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [loading, setLoading] = useState(true)
    const [searching, setSearching] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const [wishlist, setWishlist] = useState([])
    const [searchCategory, setSearchCategory] = useState('All Category')

    useEffect(() => { fetchProducts() }, [])

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput.trim()) {
                handleSearch(searchInput)
            } else {
                setSearch('')
                setSearchResults([])
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchInput, searchCategory])

    async function fetchProducts() {
        try {
            const { data } = await supabase
                .from('products')
                .select('*, supplier_profiles(business_name)')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
            setProducts(data || [])
        } finally {
            setLoading(false)
        }
    }

    async function handleSearch(query) {
        setSearching(true)
        setSearch(query)
        try {
            let q = supabase
                .from('products')
                .select('*, supplier_profiles(business_name)')
                .eq('is_active', true)
                .ilike('name', `%${query}%`)

            if (searchCategory !== 'All Category') {
                q = q.eq('category', searchCategory)
            }

            const { data } = await q.limit(20)
            setSearchResults(data || [])
        } finally {
            setSearching(false)
        }
    }

    function handleCategoryClick(catName) {
        // If same category clicked, deselect
        const newCat = catName === category ? 'All' : catName
        setCategory(newCat)
        // Scroll to products
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
    }

    function clearSearch() {
        setSearchInput('')
        setSearch('')
        setSearchResults([])
    }

    function calcPrice(product) {
        const margin = product.supplier_price * 0.1
        const shipping = product.weight_grams <= 500 ? 82.50 : 110
        return Math.ceil(product.supplier_price + margin + shipping)
    }

    function toggleWishlist(e, id) {
        e.stopPropagation()
        setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    // Filter products by category
    const filteredProducts = category === 'All'
        ? products
        : products.filter(p => p.category === category)

    const newArrivals = filteredProducts.slice(0, 10)
    const bestSellers = [...filteredProducts].slice(0, 10)
    const trending = [...filteredProducts].reverse().slice(0, 10)

    function ProductCard({ product }) {
        const price = calcPrice(product)
        const mrp = product.retail_price || Math.ceil(product.supplier_price * 1.5)
        const discount = Math.round(((mrp - price) / mrp) * 100)

        return (
            <div
                onClick={() => navigate(`/product/${product.id}`)}
                className="cursor-pointer group flex-shrink-0 border border-gray-100 hover:shadow-md transition-all duration-200 bg-white"
                style={{ width: '220px' }}>
                <div className="relative overflow-hidden bg-gray-50" style={{ height: '220px' }}>
                    {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <Package size={40} className="text-gray-200" />
                        </div>
                    )}
                    {product.payment_type && (
                        <span className={`absolute top-0 left-0 text-white text-[10px] font-bold px-2 py-1 ${product.payment_type === 'prepaid_cod' ? 'bg-teal-500' : 'bg-blue-500'}`}>
                            {product.payment_type === 'prepaid_cod' ? 'Prepaid & COD' : 'Prepaid'}
                        </span>
                    )}
                    <button
                        onClick={e => toggleWishlist(e, product.id)}
                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                        <Heart size={13} className={wishlist.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                    </button>
                </div>
                <div className="p-3">
                    <p className="text-[13px] text-gray-800 font-medium line-clamp-2 leading-snug mb-1.5" style={{ minHeight: '36px' }}>
                        {product.name}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">0 reviews</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[#143D59] font-bold text-sm">₹{price.toLocaleString()}</span>
                        <span className="text-gray-400 text-xs line-through">₹{mrp.toLocaleString()}</span>
                        {discount > 0 && <span className="text-green-600 text-xs font-semibold">{discount}% Off</span>}
                    </div>
                </div>
            </div>
        )
    }

    function Carousel({ title, items }) {
        const scrollRef = useRef(null)
        function scroll(dir) {
            if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 460, behavior: 'smooth' })
        }
        if (items.length === 0) return null
        return (
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#143D59]">{title}</h2>
                    <button className="text-sm text-[#143D59] font-medium hover:underline">View All</button>
                </div>
                <div className="relative">
                    <button onClick={() => scroll(-1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all">
                        <ChevronLeft size={16} className="text-gray-600" />
                    </button>
                    <div ref={scrollRef}
                        className="flex gap-0 overflow-x-auto border border-gray-100"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {items.map((product, i) => (
                            <div key={product.id} className={i > 0 ? 'border-l border-gray-100' : ''}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                    <button onClick={() => scroll(1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all">
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-4">
                    <button className="w-6 h-1.5 bg-[#143D59] rounded-full" />
                    <button className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                    <button className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                </div>
            </div>
        )
    }

    function HotNewArrivals({ items }) {
        if (items.length < 3) return null
        return (
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#143D59]">Hot New Arrivals</h2>
                    <button className="text-sm text-[#143D59] font-medium hover:underline">View All</button>
                </div>
                <div className="border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {[0, 1, 2].map(col => (
                            <div key={col} className="divide-y divide-gray-100">
                                {items.slice(col * 3, col * 3 + 3).map(product => {
                                    const price = calcPrice(product)
                                    const mrp = product.retail_price || Math.ceil(product.supplier_price * 1.5)
                                    return (
                                        <div key={product.id}
                                            onClick={() => navigate(`/product/${product.id}`)}
                                            className="flex items-center gap-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                                            <div className="w-16 h-16 bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                                                {product.images?.[0]
                                                    ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                                                    : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-gray-200" /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-snug">{product.name}</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[#143D59] font-bold text-sm">₹{price.toLocaleString()}</span>
                                                    <span className="text-gray-400 text-xs line-through">₹{mrp.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Search Results Grid
    function SearchResults() {
        if (!search) return null
        return (
            <div id="products-section" className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-[#143D59]">
                            {searching ? 'Searching...' : `${searchResults.length} results for "${search}"`}
                        </h2>
                        {searchCategory !== 'All Category' && (
                            <p className="text-sm text-gray-400 mt-1">in {searchCategory}</p>
                        )}
                    </div>
                    <button onClick={clearSearch}
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#143D59] border border-gray-200 px-3 py-1.5 rounded-lg">
                        <X size={14} /> Clear search
                    </button>
                </div>
                {searching ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 border border-gray-100">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse border-r border-gray-100 last:border-0">
                                <div className="bg-gray-100 h-52" />
                                <div className="p-3">
                                    <div className="bg-gray-100 rounded h-3 mb-2" />
                                    <div className="bg-gray-100 rounded h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl">
                        <Package size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No products found for "{search}"</p>
                        <p className="text-gray-400 text-sm mt-1">Try a different search term or category</p>
                        <button onClick={clearSearch} className="mt-4 bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2 rounded-lg text-sm">
                            Browse All Products
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-0 border border-gray-100">
                        {searchResults.map((product, i) => (
                            <div key={product.id} className="border-r border-b border-gray-100">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

            {/* Announcement Bar */}
            <div className="bg-[#143D59] text-white text-xs text-center py-2 px-4">
                Customer access coming soon — Currently onboarding sellers & suppliers.{' '}
                <Link to="/signup" className="text-[#F5B41A] font-semibold underline ml-1">Join free →</Link>
            </div>

            {/* Top Navbar */}
            <div className="border-b border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-4 h-16">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#143D59] rounded-lg flex items-center justify-center">
                                <ShoppingBag size={16} className="text-[#F5B41A]" />
                            </div>
                            <span className="text-[#143D59] text-xl font-black tracking-tight">
                                DROP<span className="text-[#F5B41A]">SPOT</span>
                            </span>
                        </Link>

                        <div className="flex-1 flex items-center border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                            <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)}
                                className="px-3 py-2.5 text-sm text-gray-600 border-r border-gray-200 bg-gray-50 outline-none cursor-pointer hidden md:block">
                                <option>All Category</option>
                                {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
                            </select>
                            <input
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && searchInput.trim() && handleSearch(searchInput)}
                                placeholder="Search products..."
                                className="flex-1 px-4 py-2.5 text-sm outline-none text-gray-800 bg-white" />
                            {searchInput && (
                                <button onClick={clearSearch} className="px-2 text-gray-400 hover:text-gray-600">
                                    <X size={14} />
                                </button>
                            )}
                            <button
                                onClick={() => searchInput.trim() && handleSearch(searchInput)}
                                className="bg-[#F5B41A] px-5 py-2.5 flex items-center justify-center hover:bg-[#e0a218] transition-colors">
                                <Search size={16} className="text-[#143D59]" />
                            </button>
                        </div>

                        <div className="flex items-center gap-5 flex-shrink-0">
                            <button className="flex flex-col items-center text-gray-500 hover:text-[#143D59] transition-colors">
                                <Heart size={20} />
                                <span className="text-xs mt-0.5 hidden sm:block">My Items</span>
                            </button>
                            {user ? (
                                <Link to={profile?.role === 'supplier' ? '/seller-console/dashboard' : '/seller/dashboard'}
                                    className="flex flex-col items-center text-gray-500 hover:text-[#143D59] transition-colors">
                                    <User size={20} />
                                    <span className="text-xs mt-0.5 hidden sm:block">Account</span>
                                </Link>
                            ) : (
                                <Link to="/login"
                                    className="flex flex-col items-center text-gray-500 hover:text-[#143D59] transition-colors">
                                    <User size={20} />
                                    <span className="text-xs mt-0.5 hidden sm:block">Sign In</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Navbar */}
            <div className="bg-[#143D59] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
                    <div className="flex items-center gap-6">
                        <button className="flex items-center gap-2 text-white text-sm font-medium">
                            <span>☰</span> Browse Categories
                        </button>
                        <Link to="/" className="text-white/70 text-sm hover:text-white transition-colors">Home</Link>
                        <Link to="/" className="text-white/70 text-sm hover:text-white transition-colors">Shop</Link>
                    </div>
                    <Link to="/seller-console" className="text-white/70 text-sm hover:text-white transition-colors">
                        Become A Supplier
                    </Link>
                </div>
            </div>

            {/* Show search results OR normal homepage */}
            {search ? (
                <SearchResults />
            ) : (
                <>
                    {/* Hero Banner */}
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="relative bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 overflow-hidden" style={{ height: '340px' }}>
                            <div className="absolute inset-0 flex items-center">
                                <div className="px-12 max-w-xl">
                                    <span className="inline-block bg-[#F5B41A] text-[#143D59] text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
                                        New Arrivals
                                    </span>
                                    <h1 className="text-4xl md:text-5xl font-black text-[#143D59] leading-tight mb-3">
                                        Sell Without<br />Holding Stock
                                    </h1>
                                    <p className="text-gray-500 text-sm mb-5 leading-relaxed">
                                        Browse verified Indian suppliers. Set your price.<br />
                                        We ship directly to your customers.
                                    </p>
                                    <div className="flex gap-3">
                                        <Link to="/signup"
                                            className="bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2.5 hover:bg-[#e0a218] transition-all text-sm">
                                            Start Selling Free
                                        </Link>
                                        <button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                                            className="bg-white border border-gray-200 text-[#143D59] font-semibold px-6 py-2.5 hover:border-[#143D59] transition-all text-sm">
                                            Browse Products
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:flex items-center justify-center">
                                <div className="text-9xl opacity-10">📦</div>
                            </div>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className={`rounded-full transition-all cursor-pointer ${i === 0 ? 'w-5 h-1.5 bg-[#143D59]' : 'w-1.5 h-1.5 bg-gray-300'}`} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* How it Works */}
                    <div className="max-w-7xl mx-auto px-4 py-6 border-b border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {HOW_IT_WORKS.map((item, i) => {
                                const Icon = item.icon
                                return (
                                    <div key={i} className="flex items-start gap-3">
                                        <Icon size={32} className="text-[#143D59] flex-shrink-0" strokeWidth={1} />
                                        <div>
                                            <p className="text-sm font-semibold text-[#143D59]">{item.title}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div id="products-section" className="max-w-7xl mx-auto px-4 py-8">
                        {loading ? (
                            <div className="flex gap-0 overflow-hidden mb-10 border border-gray-100">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex-shrink-0 animate-pulse border-r border-gray-100 last:border-0" style={{ width: '220px' }}>
                                        <div className="bg-gray-100" style={{ height: '220px' }} />
                                        <div className="p-3">
                                            <div className="bg-gray-100 rounded h-3 mb-2 w-full" />
                                            <div className="bg-gray-100 rounded h-3 w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-24">
                                <Package size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-500 font-medium">No products yet</p>
                                <p className="text-gray-400 text-sm mt-1">Check back soon — suppliers are onboarding now</p>
                            </div>
                        ) : (
                            <>
                                {/* Active category indicator */}
                                {category !== 'All' && (
                                    <div className="flex items-center gap-2 mb-6">
                                        <span className="text-sm text-gray-500">Showing:</span>
                                        <span className="flex items-center gap-1.5 bg-[#143D59] text-white text-sm font-medium px-3 py-1 rounded-full">
                                            {CATEGORIES.find(c => c.name === category)?.emoji} {category}
                                            <button onClick={() => setCategory('All')} className="ml-1 hover:text-red-300">
                                                <X size={12} />
                                            </button>
                                        </span>
                                        <span className="text-sm text-gray-400">({filteredProducts.length} products)</span>
                                    </div>
                                )}

                                <Carousel title={category !== 'All' ? `${category} Products` : 'New Arrivals'} items={newArrivals} />

                                {/* Shop by Category */}
                                <div className="mb-10">
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-xl font-bold text-[#143D59]">Shop by Category</h2>
                                        {category !== 'All' && (
                                            <button onClick={() => setCategory('All')}
                                                className="text-sm text-gray-500 hover:text-[#143D59]">
                                                Clear filter
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                                        {CATEGORIES.map(cat => (
                                            <button key={cat.name}
                                                onClick={() => handleCategoryClick(cat.name)}
                                                className="flex flex-col items-center gap-2">
                                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 transition-all
                                                    ${category === cat.name
                                                        ? 'border-[#143D59] bg-[#143D59]/10 scale-110'
                                                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                                                    {cat.emoji}
                                                </div>
                                                <span className={`text-[11px] font-medium text-center leading-tight ${category === cat.name ? 'text-[#143D59] font-bold' : 'text-gray-600'}`}>
                                                    {cat.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {filteredProducts.length === 0 && category !== 'All' ? (
                                    <div className="text-center py-16 bg-gray-50 rounded-2xl">
                                        <p className="text-4xl mb-3">{CATEGORIES.find(c => c.name === category)?.emoji}</p>
                                        <p className="text-gray-500 font-medium">No {category} products yet</p>
                                        <p className="text-gray-400 text-sm mt-1">Suppliers are adding products in this category</p>
                                        <button onClick={() => setCategory('All')}
                                            className="mt-4 bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2 rounded-lg text-sm">
                                            Browse All Products
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Carousel title="Best Sellers" items={bestSellers} />
                                        <Carousel title="Trending Products" items={trending} />
                                        {filteredProducts.length >= 9 && <HotNewArrivals items={filteredProducts.slice(0, 9)} />}
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Newsletter */}
                    <div className="border-t border-gray-100 py-12 bg-gray-50">
                        <div className="max-w-xl mx-auto px-4 text-center">
                            <h3 className="text-xl font-bold text-[#143D59] mb-2">Subscribe To Our Newsletter</h3>
                            <p className="text-gray-400 text-sm mb-6">Get updates on new products, suppliers and platform news</p>
                            <div className="flex gap-3">
                                <input type="email" placeholder="Your email address"
                                    className="flex-1 border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#143D59] text-gray-800" />
                                <button className="bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2.5 hover:bg-[#e0a218] transition-all text-sm">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="bg-white border-t border-gray-100 py-12">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-7 h-7 bg-[#143D59] rounded-lg flex items-center justify-center">
                                            <ShoppingBag size={13} className="text-[#F5B41A]" />
                                        </div>
                                        <span className="text-[#143D59] text-lg font-black">DROP<span className="text-[#F5B41A]">SPOT</span></span>
                                    </div>
                                    <div className="space-y-1.5 text-sm text-gray-500">
                                        <p>Monday-Friday: 08am-9pm</p>
                                        <p>+(91) 78923 04194</p>
                                        <p>support@dropspot.in</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#143D59] text-sm mb-4">About Us</p>
                                    <div className="space-y-2">
                                        {['How Dropspot Works', 'Supplier Terms', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map(item => (
                                            <p key={item} className="text-sm text-gray-500 hover:text-[#143D59] cursor-pointer transition-colors">{item}</p>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#143D59] text-sm mb-4">Customer Support</p>
                                    <div className="space-y-2">
                                        {['Help Centre', 'Returns & Exchanges', 'Shipping Policy', 'Refund Policy', 'Order Tracking'].map(item => (
                                            <p key={item} className="text-sm text-gray-500 hover:text-[#143D59] cursor-pointer transition-colors">{item}</p>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#143D59] text-sm mb-4">Follow Us</p>
                                    <div className="flex gap-2 mb-5">
                                        {['f', 'in', 'ig', 'li'].map((s, i) => (
                                            <button key={i} className="w-8 h-8 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-[#143D59] hover:text-white transition-all">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="font-bold text-[#143D59] text-sm mb-3">We Accept</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {['VISA', 'MC', 'UPI', 'PayPal'].map(card => (
                                            <span key={card} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 font-medium">{card}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                                <p className="text-xs text-gray-400">© 2025 Dropspot. All rights reserved.</p>
                                <a href="/seller-console" className="text-xs text-gray-400 hover:text-[#143D59] transition-colors">
                                    Supplier Console →
                                </a>
                            </div>
                        </div>
                    </footer>
                </>
            )}
        </div>
    )
}