import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { ArrowLeft, Star, Shield, Truck, RefreshCw, Heart, Share2, ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react'

export default function Product() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [supplierProducts, setSupplierProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [sellerProfile, setSellerProfile] = useState(null)
    const [added, setAdded] = useState(false)
    const [adding, setAdding] = useState(false)
    const [showProfitInput, setShowProfitInput] = useState(false)
    const [profit, setProfit] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [wishlisted, setWishlisted] = useState(false)
    const [selectedImage, setSelectedImage] = useState(0)
    const [openFaq, setOpenFaq] = useState(null)
    const [openSection, setOpenSection] = useState(['bullet_points', 'product_details', 'qa', 'reviews'])

    const FAQS = [
        { q: 'How long does shipping take?', a: 'Most orders are delivered within 3-7 business days across India via Shiprocket.' },
        { q: 'What is the return policy?', a: 'Returns are accepted within 7 days of delivery for damaged or wrong products.' },
        { q: 'Can I push this product to my Shopify store?', a: 'Yes! Click "Push to Shopify" and the product will be added to your connected Shopify store automatically.' },
        { q: 'How do I set my selling price?', a: 'Enter your desired profit margin and we calculate the final customer price including our fees and shipping.' },
    ]

    const SECTIONS = [
        { key: 'bullet_points', label: 'Bullet Points' },
        { key: 'product_details', label: 'Product Details' },
        { key: 'whats_included', label: "What's Included" },
        { key: 'qa', label: 'Q&A' },
        { key: 'reviews', label: 'Reviews' },
    ]

    useEffect(() => { fetchProduct() }, [id])

    async function fetchProduct() {
        try {
            const { data } = await supabase
                .from('products')
                .select('*, supplier_profiles(id, business_name, city)')
                .eq('id', id)
                .single()
            setProduct(data)

            if (data) {
                const { data: related } = await supabase
                    .from('products')
                    .select('*, supplier_profiles(business_name)')
                    .eq('category', data.category)
                    .eq('is_active', true)
                    .neq('id', id)
                    .limit(6)
                setRelatedProducts(related || [])

                const { data: fromSupplier } = await supabase
                    .from('products')
                    .select('*, supplier_profiles(business_name)')
                    .eq('supplier_id', data.supplier_id)
                    .eq('is_active', true)
                    .neq('id', id)
                    .limit(6)
                setSupplierProducts(fromSupplier || [])
            }

            if (user) {
                const { data: sp } = await supabase
                    .from('seller_profiles')
                    .select('id')
                    .eq('user_id', user.id)
                    .single()
                setSellerProfile(sp)

                if (sp) {
                    const { data: existing } = await supabase
                        .from('seller_products')
                        .select('id')
                        .eq('seller_id', sp.id)
                        .eq('product_id', id)
                        .maybeSingle()
                    setAdded(!!existing)
                }
            }
        } finally {
            setLoading(false)
        }
    }

    function calcCostPrice() {
        if (!product) return 0
        const margin = product.supplier_price * 0.1
        const shipping = product.weight_grams <= 500 ? 82.50 : 110
        return Math.ceil(product.supplier_price + margin + shipping)
    }

    function calcCustomerPrice() {
        return calcCostPrice() + (parseFloat(profit) || 0)
    }

    function calcPrice(p) {
        const margin = p.supplier_price * 0.1
        const shipping = p.weight_grams <= 500 ? 82.50 : 110
        return Math.ceil(p.supplier_price + margin + shipping)
    }

    function toggleSection(key) {
        setOpenSection(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        )
    }

    async function handleConfirmPush() {
        if (!sellerProfile) return
        setAdding(true)
        try {
            const customerPrice = calcCustomerPrice()
            const { error } = await supabase.from('seller_products').insert({
                seller_id: sellerProfile.id,
                product_id: id,
                selling_price: customerPrice || calcCostPrice(),
                is_active: true
            })
            if (!error) {
                setAdded(true)
                setShowProfitInput(false)
            }
        } finally {
            setAdding(false)
        }
    }

    function handleBuyNow() {
        if (!user) return navigate('/login')
        alert('Checkout coming soon! 🚀')
    }

    if (loading) return (
        <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-[#143D59] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Loading product...</p>
            </div>
        </div>
    )

    if (!product) return (
        <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
            <div className="text-center">
                <p className="text-5xl mb-4">😕</p>
                <p className="text-gray-500 font-medium">Product not found</p>
                <Link to="/" className="inline-block mt-4 bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2 rounded-xl">
                    Back to Home
                </Link>
            </div>
        </div>
    )

    const costPrice = calcCostPrice()
    const discount = Math.round(((product.supplier_price * 1.5 - costPrice) / (product.supplier_price * 1.5)) * 100)
    const images = product.images?.length > 0 ? product.images : [null]

    return (
        <div className="min-h-screen bg-[#F7F8FA]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
                    <button onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-[#143D59] transition-colors">
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium hidden sm:block">Back</span>
                    </button>
                    <div className="flex-1 flex justify-center">
                        <Link to="/">
                            <h1 className="text-[#143D59] text-xl font-black" style={{ fontFamily: "'Syne', sans-serif" }}>
                                Drop<span className="text-[#F5B41A]">spot.</span>
                            </h1>
                        </Link>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setWishlisted(!wishlisted)}
                            className={`p-2 rounded-xl transition-all ${wishlisted ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                            <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
                        </button>
                        <button className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                            <Share2 size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Link to="/" className="hover:text-[#143D59]">Home</Link>
                    <span>/</span>
                    <span>{product.category || 'Products'}</span>
                    <span>/</span>
                    <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-12">

                {/* Main Product Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

                    {/* Left - Images */}
                    <div className="flex gap-3">
                        {images.length > 1 && (
                            <div className="flex flex-col gap-2">
                                {images.map((img, i) => (
                                    <button key={i} onClick={() => setSelectedImage(i)}
                                        className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === i ? 'border-[#143D59]' : 'border-gray-100'}`}>
                                        {img
                                            ? <img src={img} alt="" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xl">📦</div>}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="flex-1 bg-white rounded-2xl overflow-hidden border border-gray-100 aspect-square flex items-center justify-center">
                            {images[selectedImage]
                                ? <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
                                : <div className="text-9xl">📦</div>}
                        </div>
                    </div>

                    {/* Right - Details */}
                    <div>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            {product.category && (
                                <span className="bg-[#143D59]/10 text-[#143D59] text-xs font-semibold px-3 py-1 rounded-full">
                                    {product.category}
                                </span>
                            )}
                            <span className="text-gray-400 text-xs">
                                by {product.supplier_profiles?.business_name || 'Verified Supplier'}
                                {product.supplier_profiles?.city && ` · ${product.supplier_profiles.city}`}
                            </span>
                            <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black text-[#143D59] leading-tight mb-3"
                            style={{ fontFamily: "'Syne', sans-serif" }}>
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} className="text-yellow-400" fill="currentColor" />
                                ))}
                            </div>
                            <span className="text-sm text-gray-500">4.5 · 0 reviews</span>
                            <span className="text-gray-200">|</span>
                            <span className="text-xs text-gray-400">{product.stock} units available</span>
                        </div>

                        {/* Price Box */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 mb-5">
                            <div className="flex items-end gap-3 mb-1">
                                <p className="text-3xl font-black text-[#143D59]">₹{costPrice.toLocaleString()}</p>
                                <p className="text-gray-400 text-base line-through mb-1">₹{Math.ceil(product.supplier_price * 1.5).toLocaleString()}</p>
                                {discount > 0 && (
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg mb-1">
                                        {discount}% off
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-xs mb-4">Inclusive of all taxes + shipping</p>
                            <div className="space-y-1.5 pt-3 border-t border-gray-100">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Supplier price</span>
                                    <span>₹{product.supplier_price}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Dropspot margin (10%)</span>
                                    <span>₹{(product.supplier_price * 0.1).toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Shipping ({product.weight_grams}g)</span>
                                    <span>₹{product.weight_grams <= 500 ? '82.50' : '110'}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold text-[#143D59] pt-1.5 border-t border-gray-100">
                                    <span>Your cost price</span>
                                    <span>₹{costPrice}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quantity */}
                        {user && product.stock > 0 && (
                            <div className="flex items-center gap-3 mb-5">
                                <p className="text-sm font-medium text-gray-700">Quantity:</p>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all">
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all">
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <span className="text-xs text-gray-400">{product.stock} available</span>
                            </div>
                        )}

                        {/* CTAs */}
                        <div className="space-y-3 mb-5">
                            {!user ? (
                                <>
                                    <Link to="/login"
                                        className="w-full bg-[#143D59] hover:bg-[#1a4f73] text-white font-bold py-3.5 rounded-xl transition-all text-center block">
                                        Login to Buy Now
                                    </Link>
                                    <Link to="/login"
                                        className="w-full bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold py-3.5 rounded-xl transition-all text-center block">
                                        Login to Push to Shopify
                                    </Link>
                                </>
                            ) : product.stock === 0 ? (
                                <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3.5 rounded-xl cursor-not-allowed">
                                    Out of Stock
                                </button>
                            ) : (
                                <>
                                    <button onClick={handleBuyNow}
                                        className="w-full bg-[#143D59] hover:bg-[#1a4f73] text-white font-bold py-3.5 rounded-xl transition-all">
                                        Buy Now
                                    </button>

                                    {added ? (
                                        <button disabled className="w-full bg-green-50 border-2 border-green-200 text-green-600 font-bold py-3.5 rounded-xl cursor-default">
                                            ✓ Pushed to Shopify
                                        </button>
                                    ) : showProfitInput ? (
                                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                            <p className="text-sm font-bold text-amber-800 mb-3">💰 Set Your Profit Margin</p>
                                            <div className="flex gap-3 items-center mb-3">
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        placeholder="Your desired profit e.g. ₹200"
                                                        value={profit}
                                                        onChange={e => setProfit(e.target.value)}
                                                        className="w-full border border-amber-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-400 text-gray-800 bg-white"
                                                    />
                                                </div>
                                                {profit && (
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-xs text-amber-600">Customer pays</p>
                                                        <p className="text-lg font-black text-amber-800">₹{calcCustomerPrice().toLocaleString()}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowProfitInput(false)}
                                                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
                                                    Cancel
                                                </button>
                                                <button onClick={handleConfirmPush} disabled={adding}
                                                    className="flex-1 py-2.5 rounded-xl bg-[#F5B41A] text-[#143D59] text-sm font-bold hover:bg-[#e0a218] transition-all disabled:opacity-50">
                                                    {adding ? 'Pushing...' : 'Confirm & Push'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setShowProfitInput(true)}
                                            className="w-full bg-[#F5B41A] text-[#143D59] font-bold py-3.5 rounded-xl hover:bg-[#e0a218] transition-all">
                                            Push to Shopify
                                        </button>
                                    )}

                                    <div className="flex gap-3">
                                        <button onClick={() => setWishlisted(!wishlisted)}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${wishlisted ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                                            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
                                            {wishlisted ? 'Wishlisted' : 'Wishlist'}
                                        </button>
                                        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-medium text-sm hover:border-gray-300 transition-all">
                                            <Share2 size={16} />
                                            Share
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { icon: Shield, label: 'Verified Supplier' },
                                { icon: Truck, label: 'Pan-India Delivery' },
                                { icon: RefreshCw, label: '7-Day Returns' },
                            ].map((badge, i) => (
                                <div key={i} className="flex flex-col items-center gap-1.5 p-3 bg-white rounded-xl border border-gray-100 text-center">
                                    <badge.icon size={18} className="text-[#143D59]" strokeWidth={1.5} />
                                    <p className="text-xs text-gray-500 font-medium leading-tight">{badge.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Accordion Sections */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
                    {SECTIONS.map((section, idx) => (
                        <div key={section.key} className={idx > 0 ? 'border-t border-gray-100' : ''}>
                            <button
                                onClick={() => toggleSection(section.key)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-all">
                                <span className="font-semibold text-[#143D59] text-sm">{section.label}</span>
                                {openSection.includes(section.key)
                                    ? <ChevronUp size={18} className="text-gray-400" />
                                    : <ChevronDown size={18} className="text-gray-400" />}
                            </button>

                            {openSection.includes(section.key) && (
                                <div className="px-6 pb-6">

                                    {/* Bullet Points */}
                                    {section.key === 'bullet_points' && (
                                        <div>
                                            {product.bullet_points?.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {product.bullet_points.map((point, i) => (
                                                        <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                            <span className="text-[#143D59] font-black mt-0.5">•</span>
                                                            <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="space-y-2">
                                                    {[
                                                        'High quality materials used in manufacturing',
                                                        'Compatible with all standard configurations',
                                                        'Tested and verified by our supplier quality team',
                                                        'Ships directly from verified Indian supplier',
                                                        'Pan-India delivery via Shiprocket',
                                                    ].map((point, i) => (
                                                        <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                                            <span className="text-[#143D59] font-black mt-0.5">•</span>
                                                            <span className="text-sm text-gray-700 leading-relaxed">{point}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Product Details - Long Description */}
                                    {section.key === 'product_details' && (
                                        <div>
                                            {product.long_description ? (
                                                <div
                                                    className="prose prose-sm max-w-none text-gray-600"
                                                    dangerouslySetInnerHTML={{ __html: product.long_description }}
                                                />
                                            ) : (
                                                <div className="text-center py-8 text-gray-400">
                                                    <p className="text-4xl mb-3">📝</p>
                                                    <p className="text-sm font-medium text-gray-500">No detailed description yet</p>
                                                    <p className="text-xs mt-1">The supplier will add photos, GIFs and detailed product information here</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* What's Included */}
                                    {section.key === 'whats_included' && (
                                        <div className="space-y-2">
                                            {['1x Product as shown', 'Manufacturer warranty card', 'Packaging box'].map((item, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                    <span className="text-green-500 font-bold">✓</span>
                                                    <span className="text-sm text-gray-700">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Q&A */}
                                    {section.key === 'qa' && (
                                        <div className="space-y-3">
                                            {FAQS.map((faq, i) => (
                                                <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
                                                    <button
                                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-all">
                                                        <span className="text-sm font-semibold text-gray-800">{faq.q}</span>
                                                        {openFaq === i
                                                            ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                                                            : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                                                    </button>
                                                    {openFaq === i && (
                                                        <div className="px-4 pb-4">
                                                            <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reviews */}
                                    {section.key === 'reviews' && (
                                        <div>
                                            <div className="flex items-center gap-6 mb-6 p-5 bg-gray-50 rounded-2xl">
                                                <div className="text-center">
                                                    <p className="text-5xl font-black text-[#143D59]">4.5</p>
                                                    <div className="flex items-center gap-0.5 justify-center mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} className="text-yellow-400" fill="currentColor" />
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">0 reviews</p>
                                                </div>
                                                <div className="flex-1 space-y-1.5">
                                                    {[5, 4, 3, 2, 1].map(star => (
                                                        <div key={star} className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500 w-3">{star}</span>
                                                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                                <div className="bg-yellow-400 h-1.5 rounded-full"
                                                                    style={{ width: star === 5 ? '60%' : star === 4 ? '25%' : '5%' }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-center py-8 text-gray-400">
                                                <Star size={32} className="mx-auto mb-3 text-gray-200" />
                                                <p className="text-sm font-medium">No reviews yet</p>
                                                <p className="text-xs mt-1">Be the first to review this product</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* More from this Supplier */}
                {supplierProducts.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-black text-[#143D59] mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                            More from {product.supplier_profiles?.business_name || 'this Supplier'}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {supplierProducts.map(p => (
                                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                                        {p.images?.[0]
                                            ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            : <span className="text-4xl">📦</span>}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">{p.name}</p>
                                        <p className="text-sm font-black text-[#143D59]">₹{calcPrice(p)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-black text-[#143D59] mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Related Products
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {relatedProducts.map(p => (
                                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                                        {p.images?.[0]
                                            ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            : <span className="text-4xl">📦</span>}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs text-gray-400 mb-0.5 truncate">{p.supplier_profiles?.business_name || 'Verified Supplier'}</p>
                                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">{p.name}</p>
                                        <p className="text-sm font-black text-[#143D59]">₹{calcPrice(p)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* You May Also Like */}
                {[...relatedProducts, ...supplierProducts].length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-black text-[#143D59] mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                            You May Also Like
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {[...relatedProducts, ...supplierProducts].slice(0, 6).map(p => (
                                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)}
                                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                                        {p.images?.[0]
                                            ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                            : <span className="text-4xl">📦</span>}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1">{p.name}</p>
                                        <p className="text-sm font-black text-[#143D59]">₹{calcPrice(p)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}