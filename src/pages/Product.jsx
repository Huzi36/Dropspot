import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabase'
import { Star, Heart, Share2, ChevronDown, ChevronUp, Plus, Minus, Truck, RefreshCw, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Product() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [product, setProduct] = useState(null)
    const [relatedProducts, setRelatedProducts] = useState([])
    const [supplierProducts, setSupplierProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [wishlisted, setWishlisted] = useState(false)
    const [selectedImage, setSelectedImage] = useState(0)
    const [openSections, setOpenSections] = useState(['description', 'whats_included'])
    const [questions, setQuestions] = useState([])
    const [qaForm, setQaForm] = useState({ name: '', email: '', question: '' })
    const [submittingQ, setSubmittingQ] = useState(false)
    const [qSubmitted, setQSubmitted] = useState(false)
    const [reviewForm, setReviewForm] = useState({ name: '', email: '', review: '', rating: 0 })
    const [submittingReview, setSubmittingReview] = useState(false)
    const [reviewSubmitted, setReviewSubmitted] = useState(false)

    useEffect(() => { fetchProduct() }, [id])

    async function fetchProduct() {
        try {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('id', id)
                .single()
            setProduct(data)

            if (data) {
                const { data: related } = await supabase
                    .from('products')
                    .select('*')
                    .eq('category', data.category)
                    .eq('is_active', true)
                    .neq('id', id)
                    .limit(8)
                setRelatedProducts(related || [])

                const { data: fromSupplier } = await supabase
                    .from('products')
                    .select('*')
                    .eq('supplier_id', data.supplier_id)
                    .eq('is_active', true)
                    .neq('id', id)
                    .limit(8)
                setSupplierProducts(fromSupplier || [])
            }

            fetchQuestions()
        } finally {
            setLoading(false)
        }
    }

    async function fetchQuestions() {
        const { data } = await supabase
            .from('product_questions')
            .select('*')
            .eq('product_id', id)
            .order('created_at', { ascending: false })
        setQuestions(data || [])
    }

    async function submitQuestion() {
        if (!qaForm.name || !qaForm.question) return
        setSubmittingQ(true)
        try {
            await supabase.from('product_questions').insert({
                product_id: id,
                name: qaForm.name,
                email: qaForm.email,
                question: qaForm.question,
            })
            setQaForm({ name: '', email: '', question: '' })
            setQSubmitted(true)
            fetchQuestions()
        } finally {
            setSubmittingQ(false)
        }
    }

    async function submitReview() {
        if (!reviewForm.name || !reviewForm.email || !reviewForm.review || !reviewForm.rating) return
        setSubmittingReview(true)
        try {
            setReviewSubmitted(true)
            setReviewForm({ name: '', email: '', review: '', rating: 0 })
        } finally {
            setSubmittingReview(false)
        }
    }

    function calcCostPrice() {
        if (!product) return 0
        const margin = (product.supplier_price || 0) * 0.1
        const shipping = (product.weight_grams || 0) <= 500 ? 82.50 : 110
        return Math.ceil((product.supplier_price || 0) + margin + shipping)
    }

    function calcPrice(p) {
        const margin = (p.supplier_price || 0) * 0.1
        const shipping = (p.weight_grams || 0) <= 500 ? 82.50 : 110
        return Math.ceil((p.supplier_price || 0) + margin + shipping)
    }

    function toggleSection(key) {
        setOpenSections(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
    }

    if (loading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#143D59] border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!product) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
                <p className="text-gray-500 font-medium mb-4">Product not found</p>
                <Link to="/" className="bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2 rounded-lg">Back to Home</Link>
            </div>
        </div>
    )

    const costPrice = calcCostPrice()
    const mrp = product.retail_price || Math.ceil((product.supplier_price || 0) * 1.5)
    const discount = Math.round(((mrp - costPrice) / mrp) * 100)
    const images = product.images?.length > 0 ? product.images : [null]

    return (
        <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

            <div className="bg-[#143D59] text-white text-xs text-center py-2 px-4">
                Customer access coming soon — Currently onboarding sellers & suppliers.{' '}
                <Link to="/signup" className="text-[#F5B41A] font-semibold underline ml-1">Join free →</Link>
            </div>
            <div className="border-b border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#143D59] rounded-lg flex items-center justify-center text-[#F5B41A] font-black text-sm">D</div>
                        <span className="text-[#143D59] text-xl font-black">DROP<span className="text-[#F5B41A]">SPOT</span></span>
                    </Link>
                    <div className="flex items-center gap-4">
                        {user
                            ? <Link to="/dashboard" className="text-sm text-[#143D59] font-medium hover:underline">Dashboard</Link>
                            : <Link to="/login" className="text-sm text-[#143D59] font-medium hover:underline">Sign In</Link>}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Link to="/" className="hover:text-[#143D59]">Home</Link>
                    <span>/</span>
                    <span>{product.category || 'Products'}</span>
                    <span>/</span>
                    <span className="text-gray-600 truncate max-w-xs">{product.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 pb-16">
                <div className="flex gap-10">
                    <div className="flex-1 min-w-0">
                        <div className="flex gap-4 mb-8">
                            <div className="flex flex-col gap-2">
                                {images.map((img, i) => (
                                    <button key={i} onClick={() => setSelectedImage(i)}
                                        className={`w-14 h-14 border-2 overflow-hidden flex-shrink-0 transition-all ${selectedImage === i ? 'border-[#143D59]' : 'border-gray-200 hover:border-gray-300'}`}>
                                        {img ? <img src={img} alt="" className="w-full h-full object-contain p-1" /> : <div className="w-full h-full bg-gray-100" />}
                                    </button>
                                ))}
                            </div>
                            <div className="flex-1 relative bg-gray-50 overflow-hidden" style={{ aspectRatio: '1', maxHeight: '500px' }}>
                                {images[selectedImage]
                                    ? <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-contain p-4" />
                                    : <div className="w-full h-full flex items-center justify-center text-gray-200 text-8xl">📦</div>}
                                <button onClick={() => setWishlisted(!wishlisted)}
                                    className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <Heart size={16} className={wishlisted ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
                                </button>
                            </div>
                        </div>

                        {product.bullet_points?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-base font-bold text-[#143D59] mb-3">Key Features</h3>
                                <ul className="space-y-1.5">
                                    {product.bullet_points.map((point, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <span className="text-gray-400 mt-0.5">·</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="divide-y divide-gray-100">
                            {product.long_description && (
                                <div>
                                    <button onClick={() => toggleSection('description')} className="w-full flex items-center justify-between py-4 text-left">
                                        <span className="font-semibold text-[#143D59]">Description</span>
                                        {openSections.includes('description') ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                    </button>
                                    {openSections.includes('description') && (
                                        <div className="pb-6 prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.long_description }} />
                                    )}
                                </div>
                            )}

                            <div>
                                <button onClick={() => toggleSection('whats_included')} className="w-full flex items-center justify-between py-4 text-left">
                                    <span className="font-semibold text-[#143D59]">What's Included</span>
                                    {openSections.includes('whats_included') ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                </button>
                                {openSections.includes('whats_included') && (
                                    <div className="pb-6 space-y-1.5">
                                        {(product.whats_included ? product.whats_included.split('\n').filter(Boolean) : ['1x Product as shown', 'Packaging box']).map((item, i) => (
                                            <p key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                                <span className="text-green-500">✓</span> {item}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <button onClick={() => toggleSection('qa')} className="w-full flex items-center justify-between py-4 text-left">
                                    <span className="font-semibold text-[#143D59]">Questions and Answers</span>
                                    {openSections.includes('qa') ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                </button>
                                {openSections.includes('qa') && (
                                    <div className="pb-6">
                                        {questions.length === 0 ? (
                                            <p className="text-sm text-gray-400 mb-6">No questions yet.</p>
                                        ) : (
                                            <div className="space-y-4 mb-6">
                                                {questions.map(q => (
                                                    <div key={q.id} className="border-b border-gray-100 pb-4">
                                                        <div className="flex items-start gap-2 mb-1">
                                                            <span className="text-xs font-bold text-[#143D59] bg-[#143D59]/10 px-2 py-0.5 rounded flex-shrink-0">Q</span>
                                                            <p className="text-sm text-gray-800 font-medium">{q.question}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mb-2 ml-7">— {q.name}</p>
                                                        {q.answer ? (
                                                            <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 ml-2">
                                                                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded flex-shrink-0">A</span>
                                                                <p className="text-sm text-gray-600">{q.answer}</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-gray-400 italic ml-7">Awaiting supplier response...</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {qSubmitted ? (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                                <p className="text-green-700 font-medium text-sm">✅ Question submitted!</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-[#143D59]">Ask A Question</h4>
                                                <textarea value={qaForm.question} onChange={e => setQaForm(prev => ({ ...prev, question: e.target.value }))} rows={4}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800 resize-none"
                                                    placeholder="Type your question here..." />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input value={qaForm.name} onChange={e => setQaForm(prev => ({ ...prev, name: e.target.value }))}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800"
                                                        placeholder="Your name" />
                                                    <input type="email" value={qaForm.email} onChange={e => setQaForm(prev => ({ ...prev, email: e.target.value }))}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800"
                                                        placeholder="your@email.com" />
                                                </div>
                                                <button onClick={submitQuestion} disabled={submittingQ}
                                                    className="bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2.5 rounded-lg hover:bg-[#e0a218] transition-all disabled:opacity-50 text-sm">
                                                    {submittingQ ? 'Submitting...' : 'Submit'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div>
                                <button onClick={() => toggleSection('reviews')} className="w-full flex items-center justify-between py-4 text-left">
                                    <span className="font-semibold text-[#143D59]">Customer Reviews</span>
                                    {openSections.includes('reviews') ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                </button>
                                {openSections.includes('reviews') && (
                                    <div className="pb-6">
                                        <p className="text-sm text-gray-400 mb-6">No reviews yet.</p>
                                        {reviewSubmitted ? (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                                <p className="text-green-700 font-medium text-sm">✅ Review submitted! Thank you.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button key={star} onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}>
                                                            <Star size={22} className={reviewForm.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea value={reviewForm.review} onChange={e => setReviewForm(prev => ({ ...prev, review: e.target.value }))} rows={4}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800 resize-none"
                                                    placeholder="Write your review here..." />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input value={reviewForm.name} onChange={e => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800"
                                                        placeholder="Your name" />
                                                    <input type="email" value={reviewForm.email} onChange={e => setReviewForm(prev => ({ ...prev, email: e.target.value }))}
                                                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800"
                                                        placeholder="your@email.com" />
                                                </div>
                                                <button onClick={submitReview} disabled={submittingReview}
                                                    className="border-2 border-[#F5B41A] text-[#143D59] font-bold px-6 py-2.5 rounded-lg hover:bg-amber-50 transition-all disabled:opacity-50 text-sm">
                                                    {submittingReview ? 'Submitting...' : 'Write Your Review'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-80 flex-shrink-0">
                        <div className="sticky top-4">
                            <div className="flex items-center gap-3 mb-3">
                                {product.payment_type === 'prepaid_cod' && <span className="bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded">Prepaid & COD</span>}
                                {product.payment_type === 'prepaid' && <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded">Prepaid Only</span>}
                            </div>
                            <h1 className="text-xl font-bold text-[#143D59] leading-snug mb-4">{product.name}</h1>
                            <div className="flex items-baseline gap-2 mb-1">
                                <span className="text-2xl font-bold text-[#143D59]">₹{costPrice.toLocaleString()}</span>
                                <span className="text-gray-400 text-sm line-through">₹{mrp.toLocaleString()}</span>
                                {discount > 0 && <span className="text-green-600 text-sm font-semibold">{discount}% Off</span>}
                            </div>
                            <p className="text-xs text-gray-400 mb-5">Inclusive of all taxes + shipping</p>

                            <div className="border-t border-gray-100 pt-4">
                                {(product.stock || 0) > 0 && (
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50"><Minus size={14} /></button>
                                            <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                                            <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50"><Plus size={14} /></button>
                                        </div>
                                        <span className="text-xs text-gray-400">{product.stock} available</span>
                                    </div>
                                )}

                                {(product.stock || 0) === 0 ? (
                                    <button disabled className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-lg mb-3 cursor-not-allowed">Out of Stock</button>
                                ) : !user ? (
                                    <Link to="/login" className="w-full bg-[#F5B41A] text-[#143D59] font-bold py-3 rounded-lg mb-3 text-center block hover:bg-[#e0a218] transition-all">
                                        Sign in to Buy
                                    </Link>
                                ) : (
                                    <button onClick={() => alert('Checkout coming soon! 🚀')}
                                        className="w-full bg-[#F5B41A] text-[#143D59] font-bold py-3 rounded-lg mb-3 hover:bg-[#e0a218] transition-all">
                                        Add to Cart
                                    </button>
                                )}

                                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                                    <button onClick={() => setWishlisted(!wishlisted)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#143D59] transition-colors">
                                        <Heart size={15} className={wishlisted ? 'fill-red-500 text-red-500' : ''} /> Wishlist
                                    </button>
                                    <button onClick={() => setOpenSections(prev => prev.includes('qa') ? prev : [...prev, 'qa'])} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#143D59] transition-colors">
                                        <MessageCircle size={15} /> Ask a Question
                                    </button>
                                    <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#143D59] transition-colors">
                                        <Share2 size={15} /> Share
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 pt-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <Truck size={18} className="text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                        <p className="text-sm text-gray-600">Arrives within <strong>3 to 10 working days</strong> from dispatch</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <RefreshCw size={18} className="text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                                        <p className="text-sm text-gray-600">Free 7-Day returns</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {supplierProducts.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-lg font-bold text-[#143D59] mb-4">More from this supplier</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {supplierProducts.slice(0, 4).map(p => (
                                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="border border-gray-100 cursor-pointer hover:shadow-sm transition-all">
                                    <div className="h-44 bg-gray-50 overflow-hidden">
                                        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-2" /> : <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl">📦</div>}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{p.name}</p>
                                        <span className="text-[#143D59] font-bold text-sm">₹{calcPrice(p).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h3 className="text-lg font-bold text-[#143D59] mb-4">Related Products</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {relatedProducts.slice(0, 4).map(p => (
                                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} className="border border-gray-100 cursor-pointer hover:shadow-sm transition-all">
                                    <div className="h-44 bg-gray-50 overflow-hidden">
                                        {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain p-2" /> : <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl">📦</div>}
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-2 mb-1">{p.name}</p>
                                        <span className="text-[#143D59] font-bold text-sm">₹{calcPrice(p).toLocaleString()}</span>
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