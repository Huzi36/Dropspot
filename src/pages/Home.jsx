import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { Search, Heart, User, Package, Zap, TrendingUp, Shield, ChevronRight, ChevronLeft, X, Menu } from 'lucide-react'

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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => { fetchProducts() }, [])

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
                .select('*')
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
                .select('*')
                .eq('is_active', true)
                .ilike('name', `%${query}%`)
            if (searchCategory !== 'All Category') q = q.eq('category', searchCategory)
            const { data } = await q.limit(20)
            setSearchResults(data || [])
        } finally {
            setSearching(false)
        }
    }

    function handleCategoryClick(catName) {
        const newCat = catName === category ? 'All' : catName
        setCategory(newCat)
        setMobileMenuOpen(false)
        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
    }

    function clearSearch() {
        setSearchInput('')
        setSearch('')
        setSearchResults([])
    }

    function calcPrice(product) {
        const margin = (product.supplier_price || 0) * 0.1
        const shipping = (product.weight_grams || 0) <= 500 ? 82.50 : 110
        return Math.ceil((product.supplier_price || 0) + margin + shipping)
    }

    function toggleWishlist(e, id) {
        e.stopPropagation()
        setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
    }

    const filteredProducts = category === 'All' ? products : products.filter(p => p.category === category)
    const newArrivals = filteredProducts.slice(0, 10)
    const bestSellers = [...filteredProducts].slice(0, 10)
    const trending = [...filteredProducts].reverse().slice(0, 10)

    function ProductCard({ product }) {
        const price = calcPrice(product)
        const mrp = product.retail_price || Math.ceil((product.supplier_price || 0) * 1.5)
        const discount = Math.round(((mrp - price) / mrp) * 100)
        return (
            <div onClick={() => navigate(`/product/${product.id}`)}
                className="cursor-pointer group flex-shrink-0 border border-gray-100 hover:shadow-md transition-all duration-200 bg-white"
                style={{ width: 'calc(50vw - 20px)', maxWidth: '160px' }}>
                <div className="relative overflow-hidden bg-gray-50" style={{ height: '160px' }}>
                    {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <Package size={32} className="text-gray-200" />
                        </div>
                    )}
                    {product.payment_type && (
                        <span className={`absolute top-0 left-0 text-white text-[9px] font-bold px-1.5 py-0.5 ${product.payment_type === 'prepaid_cod' ? 'bg-teal-500' : 'bg-blue-500'}`}>
                            {product.payment_type === 'prepaid_cod' ? 'Prepaid & COD' : 'Prepaid'}
                        </span>
                    )}
                    <button onClick={e => toggleWishlist(e, product.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                        <Heart size={11} className={wishlist.includes(product.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                    </button>
                </div>
                <div className="p-2.5">
                    <p className="text-[12px] text-gray-800 font-medium line-clamp-2 leading-snug mb-1" style={{ minHeight: '32px' }}>
                        {product.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mb-1">0 reviews</p>
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[#143D59] font-bold text-xs">₹{price.toLocaleString()}</span>
                        <span className="text-gray-400 text-[10px] line-through">₹{mrp.toLocaleString()}</span>
                        {discount > 0 && <span className="text-green-600 text-[10px] font-semibold">{discount}% Off</span>}
                    </div>
                </div>
            </div>
        )
    }

    function Carousel({ title, items }) {
        const scrollRef = useRef(null)
        function scroll(dir) {
            if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 320, behavior: 'smooth' })
        }
        if (items.length === 0) return null
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base md:text-xl font-bold text-[#143D59]">{title}</h2>
                    <button className="text-xs md:text-sm text-[#143D59] font-medium hover:underline">View All</button>
                </div>
                <div className="relative">
                    <button onClick={() => scroll(-1)}
                        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm">
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
                        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm">
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                    <button className="w-5 h-1 bg-[#143D59] rounded-full" />
                    <button className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                    <button className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                </div>
            </div>
        )
    }

    function HotNewArrivals({ items }) {
        if (items.length < 3) return null
        return (
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base md:text-xl font-bold text-[#143D59]">Hot New Arrivals</h2>
                    <button className="text-xs md:text-sm text-[#143D59] font-medium hover:underline">View All</button>
                </div>
                <div className="border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {[0, 1, 2].map(col => (
                            <div key={col} className="divide-y divide-gray-100">
                                {items.slice(col * 3, col * 3 + 3).map(product => {
                                    const price = calcPrice(product)
                                    const mrp = product.retail_price || Math.ceil((product.supplier_price || 0) * 1.5)
                                    return (
                                        <div key={product.id} onClick={() => navigate(`/product/${product.id}`)}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors">
                                            <div className="w-14 h-14 bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                                                {product.images?.[0]
                                                    ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                                                    : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-200" /></div>}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-snug">{product.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[#143D59] font-bold text-xs">₹{price.toLocaleString()}</span>
                                                    <span className="text-gray-400 text-[10px] line-through">₹{mrp.toLocaleString()}</span>
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

    function SearchResults() {
        if (!search) return null
        return (
            <div id="products-section" className="max-w-7xl mx-auto px-3 md:px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base md:text-xl font-bold text-[#143D59]">
                            {searching ? 'Searching...' : `${searchResults.length} results for "${search}"`}
                        </h2>
                        {searchCategory !== 'All Category' && (
                            <p className="text-xs text-gray-400 mt-0.5">in {searchCategory}</p>
                        )}
                    </div>
                    <button onClick={clearSearch}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#143D59] border border-gray-200 px-2.5 py-1.5 rounded-lg">
                        <X size={12} /> Clear
                    </button>
                </div>
                {searching ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0 border border-gray-100">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse border-r border-gray-100 last:border-0">
                                <div className="bg-gray-100 h-40" />
                                <div className="p-2.5">
                                    <div className="bg-gray-100 rounded h-3 mb-2" />
                                    <div className="bg-gray-100 rounded h-3 w-2/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searchResults.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl">
                        <Package size={40} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-500 font-medium text-sm">No products found for "{search}"</p>
                        <button onClick={clearSearch} className="mt-3 bg-[#F5B41A] text-[#143D59] font-bold px-5 py-2 rounded-lg text-sm">
                            Browse All
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-0 border border-gray-100">
                        {searchResults.map((product) => (
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
                <div className="max-w-7xl mx-auto px-3 md:px-4">
                    <div className="flex items-center gap-3 h-14 md:h-16">
                        <Link to="/" className="flex-shrink-0">
                            <img src="/logo.png" alt="Dropspot" className="h-8 md:h-10 w-auto" />
                        </Link>
                        <div className="flex-1 flex items-center border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors rounded-lg md:rounded-none">
                            <select value={searchCategory} onChange={e => setSearchCategory(e.target.value)}
                                className="px-2 py-2 text-xs text-gray-600 border-r border-gray-200 bg-gray-50 outline-none cursor-pointer hidden md:block">
                                <option>All Category</option>
                                {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
                            </select>
                            <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && searchInput.trim() && handleSearch(searchInput)}
                                placeholder="Search products..."
                                className="flex-1 px-3 py-2.5 text-sm outline-none text-gray-800 bg-white min-w-0" />
                            {searchInput && (
                                <button onClick={clearSearch} className="px-2 text-gray-400 hover:text-gray-600 flex-shrink-0">
                                    <X size={13} />
                                </button>
                            )}
                            <button onClick={() => searchInput.trim() && handleSearch(searchInput)}
                                className="bg-[#F5B41A] px-3 md:px-5 py-2.5 flex items-center justify-center hover:bg-[#e0a218] transition-colors flex-shrink-0">
                                <Search size={15} className="text-[#143D59]" />
                            </button>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <button className="text-gray-500 hover:text-[#143D59] transition-colors">
                                <Heart size={20} />
                            </button>
                            {user ? (
                                <Link to={profile?.role === 'supplier' ? '/supplier-console/dashboard' : '/dashboard'}
                                    className="text-gray-500 hover:text-[#143D59] transition-colors">
                                    <User size={20} />
                                </Link>
                            ) : (
                                <Link to="/login" className="text-gray-500 hover:text-[#143D59] transition-colors">
                                    <User size={20} />
                                </Link>
                            )}
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden text-gray-500 hover:text-[#143D59]">
                                <Menu size={22} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 shadow-lg z-40 relative">
                    <div className="px-4 py-3 space-y-2">
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700 hover:text-[#143D59]">Home</Link>
                        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-gray-700 hover:text-[#143D59]">Shop</Link>
                        <Link to="/supplier-console" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-medium text-[#143D59] font-bold">Become A Supplier</Link>
                        <div className="border-t border-gray-100 pt-2">
                            <p className="text-xs text-gray-400 font-medium mb-2">Categories</p>
                            <div className="grid grid-cols-2 gap-1">
                                {CATEGORIES.map(cat => (
                                    <button key={cat.name} onClick={() => handleCategoryClick(cat.name)}
                                        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm text-left transition-all ${category === cat.name ? 'bg-[#143D59]/10 text-[#143D59] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                                        <span>{cat.emoji}</span> {cat.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub Navbar */}
            <div className="bg-[#143D59] sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
                    <div className="flex items-center gap-4 md:gap-6">
                        <button className="hidden md:flex items-center gap-2 text-white text-sm font-medium">
                            <span>☰</span> Browse Categories
                        </button>
                        <Link to="/" className="text-white/70 text-xs md:text-sm hover:text-white transition-colors">Home</Link>
                        <Link to="/" className="text-white/70 text-xs md:text-sm hover:text-white transition-colors">Shop</Link>
                    </div>
                    <Link to="/supplier-console" className="text-white/70 text-xs md:text-sm hover:text-white transition-colors">
                        Become A Supplier
                    </Link>
                </div>
            </div>

            {search ? (
                <SearchResults />
            ) : (
                <>
                    {/* Hero Banner */}
                    <div className="w-full" style={{ height: '380px', minHeight: '380px', background: '#143D59', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                            <div style={{ padding: '0 48px', maxWidth: '560px' }}>
                                <span style={{ display: 'inline-block', background: '#F5B41A', color: '#143D59', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    New Arrivals
                                </span>
                                <h1 style={{ fontSize: 'clamp(28px, 5vw, 56px)', fontWeight: 900, color: 'white', lineHeight: 1.1, marginBottom: '12px' }}>
                                    Sell Without<br />Holding Stock
                                </h1>
                                <p style={{ color: '#93c5fd', fontSize: '14px', marginBottom: '24px' }}>
                                    Browse verified Indian suppliers. Set your price.
                                </p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link to="/signup" style={{ background: '#F5B41A', color: '#143D59', fontWeight: 700, padding: '10px 24px', fontSize: '14px', textDecoration: 'none' }}>
                                        Start Selling Free
                                    </Link>
                                    <button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
                                        style={{ background: 'white', color: '#143D59', fontWeight: 600, padding: '10px 24px', fontSize: '14px', border: '1px solid #e5e7eb', cursor: 'pointer' }}>
                                        Browse
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{ borderRadius: '999px', background: i === 0 ? 'white' : 'rgba(255,255,255,0.3)', width: i === 0 ? '16px' : '6px', height: '4px' }} />
                            ))}
                        </div>
                    </div>

                    {/* How it Works */}
                    <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-6 border-b border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            {HOW_IT_WORKS.map((item, i) => {
                                const Icon = item.icon
                                return (
                                    <div key={i} className="flex items-start gap-2 md:gap-3">
                                        <Icon size={24} className="text-[#143D59] flex-shrink-0 mt-0.5" strokeWidth={1} />
                                        <div>
                                            <p className="text-xs md:text-sm font-semibold text-[#143D59]">{item.title}</p>
                                            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 leading-relaxed hidden sm:block">{item.desc}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div id="products-section" className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-8">
                        {loading ? (
                            <div className="flex gap-0 overflow-hidden mb-8 border border-gray-100">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex-shrink-0 animate-pulse border-r border-gray-100 last:border-0" style={{ width: '160px' }}>
                                        <div className="bg-gray-100" style={{ height: '160px' }} />
                                        <div className="p-2.5">
                                            <div className="bg-gray-100 rounded h-3 mb-2 w-full" />
                                            <div className="bg-gray-100 rounded h-3 w-2/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20">
                                <Package size={40} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-500 font-medium">No products yet</p>
                                <p className="text-gray-400 text-sm mt-1">Check back soon</p>
                            </div>
                        ) : (
                            <>
                                {category !== 'All' && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-xs text-gray-500">Showing:</span>
                                        <span className="flex items-center gap-1.5 bg-[#143D59] text-white text-xs font-medium px-2.5 py-1 rounded-full">
                                            {CATEGORIES.find(c => c.name === category)?.emoji} {category}
                                            <button onClick={() => setCategory('All')} className="ml-1 hover:text-red-300">
                                                <X size={11} />
                                            </button>
                                        </span>
                                        <span className="text-xs text-gray-400">({filteredProducts.length})</span>
                                    </div>
                                )}
                                <Carousel title={category !== 'All' ? `${category} Products` : 'New Arrivals'} items={newArrivals} />
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-base md:text-xl font-bold text-[#143D59]">Shop by Category</h2>
                                        {category !== 'All' && (
                                            <button onClick={() => setCategory('All')} className="text-xs text-gray-500 hover:text-[#143D59]">Clear filter</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-4">
                                        {CATEGORIES.map(cat => (
                                            <button key={cat.name} onClick={() => handleCategoryClick(cat.name)} className="flex flex-col items-center gap-1.5">
                                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-xl md:text-2xl border-2 transition-all ${category === cat.name ? 'border-[#143D59] bg-[#143D59]/10 scale-110' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}>
                                                    {cat.emoji}
                                                </div>
                                                <span className={`text-[10px] md:text-[11px] font-medium text-center leading-tight ${category === cat.name ? 'text-[#143D59] font-bold' : 'text-gray-600'}`}>
                                                    {cat.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {filteredProducts.length === 0 && category !== 'All' ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                                        <p className="text-3xl mb-2">{CATEGORIES.find(c => c.name === category)?.emoji}</p>
                                        <p className="text-gray-500 font-medium text-sm">No {category} products yet</p>
                                        <button onClick={() => setCategory('All')} className="mt-3 bg-[#F5B41A] text-[#143D59] font-bold px-5 py-2 rounded-lg text-sm">Browse All</button>
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
                    <div className="border-t border-gray-100 py-10 bg-gray-50">
                        <div className="max-w-xl mx-auto px-4 text-center">
                            <h3 className="text-lg md:text-xl font-bold text-[#143D59] mb-2">Subscribe To Our Newsletter</h3>
                            <p className="text-gray-400 text-xs md:text-sm mb-5">Get updates on new products, suppliers and platform news</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Your email address"
                                    className="flex-1 border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-[#143D59] text-gray-800 rounded-lg md:rounded-none" />
                                <button className="bg-[#F5B41A] text-[#143D59] font-bold px-4 md:px-6 py-2.5 hover:bg-[#e0a218] transition-all text-sm rounded-lg md:rounded-none">
                                    Subscribe
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="bg-white border-t border-gray-100 py-10">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
                                <div className="col-span-2 md:col-span-1">
                                    <img src="/logo.png" alt="Dropspot" className="h-10 w-auto mb-3" />
                                    <div className="space-y-1 text-xs md:text-sm text-gray-500">
                                        <p>Monday-Friday: 08am-9pm</p>
                                        <p>+(91) 78923 04194</p>
                                        <p>support@dropspot.in</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#143D59] text-xs md:text-sm mb-3">About Us</p>
                                    <div className="space-y-1.5">
                                        {['How Dropspot Works', 'Supplier Terms', 'Privacy Policy', 'Terms of Service', 'Contact Us'].map(item => (
                                            <p key={item} className="text-xs md:text-sm text-gray-500 hover:text-[#143D59] cursor-pointer">{item}</p>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#143D59] text-xs md:text-sm mb-3">Support</p>
                                    <div className="space-y-1.5">
                                        {['Help Centre', 'Returns & Exchanges', 'Shipping Policy', 'Refund Policy', 'Order Tracking'].map(item => (
                                            <p key={item} className="text-xs md:text-sm text-gray-500 hover:text-[#143D59] cursor-pointer">{item}</p>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-[#143D59] text-xs md:text-sm mb-3">Follow Us</p>
                                    <div className="flex gap-2 mb-4">
                                        {['f', 'in', 'ig', 'li'].map((s, i) => (
                                            <button key={i} className="w-7 h-7 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-[#143D59] hover:text-white transition-all">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="font-bold text-[#143D59] text-xs md:text-sm mb-2">We Accept</p>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {['VISA', 'MC', 'UPI', 'PayPal'].map(card => (
                                            <span key={card} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 font-medium">{card}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-5 flex flex-col md:flex-row items-center justify-between gap-2">
                                <p className="text-xs text-gray-400">© 2025 Dropspot. All rights reserved.</p>
                                <a href="/supplier-console" className="text-xs text-gray-400 hover:text-[#143D59]">Supplier Console →</a>
                            </div>
                        </div>
                    </footer>
                </>
            )}
        </div>
    )
}