import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SupplierSidebar from '../../components/SupplierSidebar'
import { Plus, X, Edit2, Trash2, Eye, EyeOff, Upload } from 'lucide-react'

const CATEGORIES = ['Electronics', 'Fashion', 'Beauty', 'Home & Kitchen', 'Fitness', 'Baby & Kids', 'Automobile', 'Gifts & Decor', 'Other']
const OPTION_TYPES = ['Color', 'Size', 'Material', 'Style', 'Storage', 'Weight', 'Custom']

const EMPTY_FORM = {
    name: '',
    category: '',
    supplier_price: '',
    retail_price: '',
    weight_grams: '',
    length: '',
    breadth: '',
    height: '',
    stock: '',
    sku: '',
    bullet_points: ['', '', '', '', ''],
    long_description: '',
    whats_included: '',
    images: [],
    has_variants: false,
    variant_options: [],
    variants: [],
    payment_type: 'prepaid_cod',
}

export default function SupplierProducts() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editProduct, setEditProduct] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [supplierProfile, setSupplierProfile] = useState(null)
    const [uploadingImages, setUploadingImages] = useState(false)
    const [variantInputs, setVariantInputs] = useState({})
    const fileInputRef = useRef(null)
    const variantFileRefs = useRef([])

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: sp } = await supabase
                .from('supplier_profiles')
                .select('*')
                .eq('user_id', profile?.id)
                .single()
            setSupplierProfile(sp)
            if (sp) {
                const { data } = await supabase
                    .from('products')
                    .select('*')
                    .eq('supplier_id', sp.id)
                    .order('created_at', { ascending: false })
                setProducts(data || [])
            }
        } finally {
            setLoading(false)
        }
    }

    function openAddModal() {
        setEditProduct(null)
        setForm(EMPTY_FORM)
        setVariantInputs({})
        setError('')
        setShowModal(true)
    }

    function openEditModal(product) {
        setEditProduct(product)
        setForm({
            name: product.name || '',
            category: product.category || '',
            supplier_price: product.supplier_price || '',
            retail_price: product.retail_price || '',
            weight_grams: product.weight_grams || '',
            length: product.length || '',
            breadth: product.breadth || '',
            height: product.height || '',
            stock: product.stock || '',
            sku: product.sku || '',
            bullet_points: product.bullet_points?.length > 0 ? product.bullet_points : ['', '', '', '', ''],
            long_description: product.long_description || '',
            whats_included: product.whats_included || '',
            images: product.images || [],
            has_variants: product.has_variants || false,
            variant_options: product.variant_options || [],
            variants: product.variants || [],
            payment_type: product.payment_type || 'prepaid_cod',
        })
        setVariantInputs({})
        setError('')
        setShowModal(true)
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function handleBulletChange(i, value) {
        const updated = [...form.bullet_points]
        updated[i] = value
        setForm({ ...form, bullet_points: updated })
    }

    // Generate all combinations from options
    function generateCombinations(options) {
        const validOptions = options.filter(o => (o.values || []).length > 0)
        if (validOptions.length === 0) return []
        let combos = [[]]
        for (const option of validOptions) {
            const newCombos = []
            for (const combo of combos) {
                for (const value of option.values) {
                    newCombos.push([...combo, { option: option.name || option.customName, value }])
                }
            }
            combos = newCombos
        }
        return combos.map(combo => ({
            name: combo.map(c => c.value).join(' / '),
            options: combo,
            price: '',
            stock: '',
            imageUrl: '',
        }))
    }

    function addOption() {
        const updated = [...form.variant_options, { name: '', customName: '', values: [] }]
        setForm({ ...form, variant_options: updated })
    }

    function removeOption(optIdx) {
        const updated = form.variant_options.filter((_, i) => i !== optIdx)
        const combos = generateCombinations(updated)
        setForm({ ...form, variant_options: updated, variants: combos })
    }

    function updateOptionName(optIdx, name) {
        const updated = [...form.variant_options]
        updated[optIdx] = { ...updated[optIdx], name }
        setForm({ ...form, variant_options: updated })
    }

    function updateCustomName(optIdx, customName) {
        const updated = [...form.variant_options]
        updated[optIdx] = { ...updated[optIdx], customName }
        setForm({ ...form, variant_options: updated })
    }

    function addValueToOption(optIdx, value) {
        if (!value.trim()) return
        const updated = [...form.variant_options]
        updated[optIdx] = { ...updated[optIdx], values: [...(updated[optIdx].values || []), value.trim()] }
        const combos = generateCombinations(updated)
        setForm({ ...form, variant_options: updated, variants: combos })
    }

    function removeValueFromOption(optIdx, valIdx) {
        const updated = [...form.variant_options]
        updated[optIdx].values = updated[optIdx].values.filter((_, i) => i !== valIdx)
        const combos = generateCombinations(updated)
        setForm({ ...form, variant_options: updated, variants: combos })
    }

    function handleVariantChange(i, field, value) {
        const updated = [...form.variants]
        updated[i] = { ...updated[i], [field]: value }
        setForm({ ...form, variants: updated })
    }

    async function uploadImage(file, path) {
        const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true })
        if (error) throw error
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        return urlData.publicUrl
    }

    async function handleMainImages(e) {
        const files = Array.from(e.target.files)
        if (!files.length) return
        setUploadingImages(true)
        try {
            const urls = await Promise.all(files.map(async (file, i) =>
                uploadImage(file, `${profile.id}/${Date.now()}_${i}_${file.name}`)
            ))
            setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }))
        } catch (err) {
            setError('Image upload failed: ' + err.message)
        } finally {
            setUploadingImages(false)
        }
    }

    async function handleVariantImage(e, variantIndex) {
        const file = e.target.files[0]
        if (!file) return
        setUploadingImages(true)
        try {
            const url = await uploadImage(file, `${profile.id}/variants/${Date.now()}_${file.name}`)
            handleVariantChange(variantIndex, 'imageUrl', url)
        } catch (err) {
            setError('Image upload failed: ' + err.message)
        } finally {
            setUploadingImages(false)
        }
    }

    function removeMainImage(i) {
        setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))
    }

    function calcListingPrice() {
        const price = parseFloat(form.supplier_price) || 0
        return Math.ceil(price + price * 0.1 + (parseInt(form.weight_grams) <= 500 ? 82.50 : 110))
    }

    async function handleSave() {
        if (!form.name || !form.supplier_price) {
            setError('Product name and price are required')
            return
        }
        setSaving(true)
        setError('')
        try {
            const payload = {
                name: form.name,
                category: form.category,
                supplier_price: parseFloat(form.supplier_price),
                retail_price: parseFloat(form.retail_price) || null,
                weight_grams: parseInt(form.weight_grams) || 0,
                stock: form.has_variants
                    ? form.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
                    : parseInt(form.stock) || 0,
                sku: form.sku,
                bullet_points: form.bullet_points.filter(b => b.trim() !== ''),
                long_description: form.long_description,
                whats_included: form.whats_included,
                images: form.images,
                has_variants: form.has_variants,
                variant_options: form.has_variants ? form.variant_options : [],
                variants: form.has_variants ? form.variants : [],
                payment_type: form.payment_type,
                supplier_id: supplierProfile.id,
                is_active: true,
            }
            if (editProduct) {
                await supabase.from('products').update(payload).eq('id', editProduct.id)
            } else {
                await supabase.from('products').insert(payload)
            }
            await fetchData()
            setShowModal(false)
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function toggleActive(product) {
        await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id)
        await fetchData()
    }

    async function deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return
        await supabase.from('products').delete().eq('id', id)
        await fetchData()
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

            <SupplierSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>My Products</h2>
                        <p className="text-gray-500 mt-1">Manage your product listings.</p>
                    </div>
                    <button onClick={openAddModal}
                        className="flex items-center gap-2 bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold px-5 py-2.5 rounded-xl transition-all">
                        <Plus size={18} /> Add Product
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                                <div className="bg-gray-200 rounded-xl h-48 mb-4" />
                                <div className="bg-gray-200 rounded h-4 mb-2 w-3/4" />
                                <div className="bg-gray-200 rounded h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-5xl mb-4">📦</p>
                        <p className="text-gray-500 font-medium">No products yet</p>
                        <p className="text-gray-400 text-sm mt-1">Add your first product to start selling on Dropspot</p>
                        <button onClick={openAddModal}
                            className="inline-block mt-4 bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2 rounded-xl hover:bg-[#e0a218] transition-all">
                            + Add First Product
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                                <div className="relative h-48 bg-gray-50">
                                    {product.images?.[0]
                                        ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
                                    <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="p-5">
                                    {product.category && (
                                        <span className="text-xs text-[#143D59] font-semibold bg-[#143D59]/10 px-2 py-0.5 rounded-full">{product.category}</span>
                                    )}
                                    <h3 className="font-bold text-gray-900 mt-2 mb-1 line-clamp-2">{product.name}</h3>
                                    {product.has_variants && <p className="text-xs text-gray-400 mb-2">{product.variants?.length} variants</p>}
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-xl font-black text-[#143D59]">₹{product.supplier_price}</p>
                                            <p className="text-xs text-gray-400">Supplier price</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-700">{product.stock} units</p>
                                            <p className="text-xs text-gray-400">In stock</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEditModal(product)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
                                            <Edit2 size={14} /> Edit
                                        </button>
                                        <button onClick={() => toggleActive(product)}
                                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
                                            {product.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                                            {product.is_active ? 'Hide' : 'Show'}
                                        </button>
                                        <button onClick={() => deleteProduct(product.id)}
                                            className="p-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-3xl my-8">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
                            <h3 className="font-bold text-[#143D59] text-xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {editProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-all">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>}

                            {/* 1. PRODUCT INFO */}
                            <div>
                                <h4 className="font-bold text-[#143D59] text-base mb-4 pb-2 border-b border-gray-100">Product Information</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-gray-700 text-sm font-medium mb-1 block">Product Name *</label>
                                        <input name="name" value={form.name} onChange={handleChange}
                                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                            placeholder="e.g. Premium Wireless Earbuds" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-gray-700 text-sm font-medium mb-1 block">Category</label>
                                            <select name="category" value={form.category} onChange={handleChange}
                                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]">
                                                <option value="">Select category</option>
                                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-gray-700 text-sm font-medium mb-1 block">SKU</label>
                                            <input name="sku" value={form.sku} onChange={handleChange}
                                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                                placeholder="e.g. WE-001" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-gray-700 text-sm font-medium mb-2 block">Payment Type</label>
                                        <div className="flex gap-3">
                                            {[{ key: 'prepaid', label: 'Prepaid Only' }, { key: 'prepaid_cod', label: 'Prepaid & COD' }].map(opt => (
                                                <button key={opt.key} type="button" onClick={() => setForm({ ...form, payment_type: opt.key })}
                                                    className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.payment_type === opt.key ? 'bg-[#143D59] border-[#143D59] text-white' : 'border-gray-200 text-gray-600 hover:border-[#143D59]'}`}>
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. MEDIA */}
                            <div>
                                <h4 className="font-bold text-[#143D59] text-base mb-4 pb-2 border-b border-gray-100">Media</h4>
                                <div onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-[#143D59] transition-all mb-4">
                                    <Upload size={32} className="mx-auto mb-3 text-gray-400" />
                                    <p className="font-medium text-gray-600">Click to upload images</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — First image will be the main image</p>
                                    {uploadingImages && <p className="text-[#143D59] text-sm mt-2 font-medium">Uploading...</p>}
                                </div>
                                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleMainImages} />
                                {form.images.length > 0 && (
                                    <div className="grid grid-cols-4 gap-3">
                                        {form.images.map((img, i) => (
                                            <div key={i} className="relative aspect-square">
                                                <img src={img} alt="" className="w-full h-full object-cover rounded-xl border border-gray-200" />
                                                <button onClick={() => removeMainImage(i)}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                                                {i === 0 && <span className="absolute bottom-1 left-1 bg-[#143D59] text-white text-xs px-1.5 py-0.5 rounded-lg">Main</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* 3. PRICING */}
                            <div>
                                <h4 className="font-bold text-[#143D59] text-base mb-4 pb-2 border-b border-gray-100">Pricing</h4>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-gray-700 text-sm font-medium mb-1 block">Your Price (₹) *</label>
                                            <input name="supplier_price" type="number" value={form.supplier_price} onChange={handleChange}
                                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                                placeholder="350" />
                                            <p className="text-xs text-gray-400 mt-1">Including packaging, excluding shipping</p>
                                        </div>
                                        <div>
                                            <label className="text-gray-700 text-sm font-medium mb-1 block">MRP / Retail Price (₹)</label>
                                            <input name="retail_price" type="number" value={form.retail_price} onChange={handleChange}
                                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                                placeholder="699" />
                                        </div>
                                    </div>
                                    {!form.has_variants && (
                                        <div>
                                            <label className="text-gray-700 text-sm font-medium mb-1 block">Stock *</label>
                                            <input name="stock" type="number" value={form.stock} onChange={handleChange}
                                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                                placeholder="50" />
                                        </div>
                                    )}
                                    {form.supplier_price && (
                                        <div className="bg-[#F7F8FA] rounded-xl p-4 space-y-2">
                                            <p className="text-sm font-bold text-[#143D59] mb-2">Price Breakdown (what seller sees)</p>
                                            <div className="flex justify-between text-xs text-gray-500"><span>Your price</span><span>₹{form.supplier_price}</span></div>
                                            <div className="flex justify-between text-xs text-gray-500"><span>Dropspot margin (10%)</span><span>₹{(parseFloat(form.supplier_price) * 0.1).toFixed(0)}</span></div>
                                            <div className="flex justify-between text-xs text-gray-500"><span>Shipping</span><span>₹{parseInt(form.weight_grams) <= 500 ? '82.50' : '110'}</span></div>
                                            <div className="flex justify-between text-sm font-bold text-[#143D59] pt-2 border-t border-gray-200"><span>Final listing price</span><span>₹{calcListingPrice()}</span></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 4. VARIANTS - Shopify Style */}
                            <div>
                                <h4 className="font-bold text-[#143D59] text-base mb-4 pb-2 border-b border-gray-100">Variants</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">This product has variants</p>
                                            <p className="text-xs text-gray-400 mt-0.5">e.g. different colors, sizes, materials</p>
                                        </div>
                                        <button onClick={() => setForm({ ...form, has_variants: !form.has_variants, variant_options: [], variants: [] })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${form.has_variants ? 'bg-[#143D59]' : 'bg-gray-300'}`}>
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${form.has_variants ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>

                                    {form.has_variants && (
                                        <div className="space-y-4">
                                            {/* Option Rows */}
                                            {form.variant_options.map((option, optIdx) => (
                                                <div key={optIdx} className="border border-gray-200 rounded-2xl p-5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <p className="text-sm font-bold text-[#143D59]">Option {optIdx + 1}</p>
                                                        <button onClick={() => removeOption(optIdx)} className="text-red-400 hover:text-red-600 transition-colors">
                                                            <X size={16} />
                                                        </button>
                                                    </div>

                                                    {/* Option Name */}
                                                    <div className="mb-4">
                                                        <label className="text-xs text-gray-500 font-medium mb-1 block">Option Name</label>
                                                        <select value={option.name} onChange={e => updateOptionName(optIdx, e.target.value)}
                                                            className="w-full border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#143D59] text-sm">
                                                            <option value="">Select type</option>
                                                            {OPTION_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
                                                        </select>
                                                        {option.name === 'Custom' && (
                                                            <input value={option.customName || ''} onChange={e => updateCustomName(optIdx, e.target.value)}
                                                                className="w-full mt-2 border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                                                placeholder="Enter custom option name" />
                                                        )}
                                                    </div>

                                                    {/* Option Values */}
                                                    <div>
                                                        <label className="text-xs text-gray-500 font-medium mb-2 block">
                                                            Values {option.values?.length > 0 && <span className="text-gray-400">({option.values.length} added)</span>}
                                                        </label>

                                                        {/* Tags */}
                                                        {option.values?.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {option.values.map((val, valIdx) => (
                                                                    <span key={valIdx}
                                                                        className="flex items-center gap-1.5 bg-[#143D59] text-white text-xs font-medium px-3 py-1.5 rounded-full">
                                                                        {val}
                                                                        <button onClick={() => removeValueFromOption(optIdx, valIdx)}
                                                                            className="hover:text-red-300 transition-colors ml-0.5">×</button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* Input */}
                                                        <div className="flex gap-2">
                                                            <input
                                                                value={variantInputs[optIdx] || ''}
                                                                onChange={e => setVariantInputs(prev => ({ ...prev, [optIdx]: e.target.value }))}
                                                                onKeyDown={e => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault()
                                                                        addValueToOption(optIdx, variantInputs[optIdx] || '')
                                                                        setVariantInputs(prev => ({ ...prev, [optIdx]: '' }))
                                                                    }
                                                                }}
                                                                placeholder={`e.g. ${option.name === 'Color' ? 'Red, Blue, Green' : option.name === 'Size' ? 'S, M, L, XL' : 'Add value'}`}
                                                                className="flex-1 border border-gray-200 text-gray-900 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    addValueToOption(optIdx, variantInputs[optIdx] || '')
                                                                    setVariantInputs(prev => ({ ...prev, [optIdx]: '' }))
                                                                }}
                                                                className="px-4 py-2.5 bg-[#143D59] text-white text-sm font-medium rounded-lg hover:bg-[#1a4f73] transition-all">
                                                                Add
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-1">Press Enter or click Add after each value</p>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add Option Button */}
                                            {form.variant_options.length < 3 && (
                                                <button onClick={addOption}
                                                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 font-medium hover:border-[#143D59] hover:text-[#143D59] transition-all flex items-center justify-center gap-2">
                                                    <Plus size={16} /> Add Option
                                                </button>
                                            )}

                                            {/* Generated Variants Table */}
                                            {form.variants.length > 0 && (
                                                <div>
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h5 className="font-semibold text-gray-700 text-sm">
                                                            {form.variants.length} variant{form.variants.length > 1 ? 's' : ''} — set price, stock & image per variant
                                                        </h5>
                                                    </div>
                                                    <div className="border border-gray-200 rounded-2xl overflow-hidden">
                                                        <table className="w-full">
                                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                                <tr>
                                                                    <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Variant</th>
                                                                    <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Price (₹)</th>
                                                                    <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Stock</th>
                                                                    <th className="text-left text-xs text-gray-500 font-semibold px-4 py-3">Image</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-100">
                                                                {form.variants.map((variant, i) => (
                                                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                                        <td className="px-4 py-3">
                                                                            <span className="text-sm font-semibold text-gray-800">{variant.name}</span>
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <input type="number" value={variant.price}
                                                                                onChange={e => handleVariantChange(i, 'price', e.target.value)}
                                                                                className="w-24 border border-gray-200 text-gray-900 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                                                                placeholder={form.supplier_price || '0'} />
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <input type="number" value={variant.stock}
                                                                                onChange={e => handleVariantChange(i, 'stock', e.target.value)}
                                                                                className="w-20 border border-gray-200 text-gray-900 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                                                                placeholder="0" />
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            {variant.imageUrl ? (
                                                                                <div className="relative w-10 h-10">
                                                                                    <img src={variant.imageUrl} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                                                                    <button onClick={() => handleVariantChange(i, 'imageUrl', '')}
                                                                                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <input type="file" accept="image/*" className="hidden"
                                                                                        ref={el => variantFileRefs.current[i] = el}
                                                                                        onChange={e => handleVariantImage(e, i)} />
                                                                                    <button onClick={() => variantFileRefs.current[i]?.click()}
                                                                                        className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-[#143D59] transition-all">
                                                                                        <Upload size={12} /> Add
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 5. DIMENSIONS */}
                            <div>
                                <h4 className="font-bold text-[#143D59] text-base mb-4 pb-2 border-b border-gray-100">Dimensions & Shipping</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-gray-700 text-sm font-medium mb-1 block">Weight (grams)</label>
                                        <input name="weight_grams" type="number" value={form.weight_grams} onChange={handleChange}
                                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                            placeholder="200" />
                                        <p className="text-xs text-gray-400 mt-1">Under 500g = ₹82.50 shipping · Over 500g = ₹110 shipping</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-700 text-sm font-medium mb-2 block">Package Dimensions (cm)</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {[{ name: 'length', label: 'Length' }, { name: 'breadth', label: 'Breadth' }, { name: 'height', label: 'Height' }].map(dim => (
                                                <div key={dim.name}>
                                                    <label className="text-xs text-gray-400 mb-1 block">{dim.label}</label>
                                                    <input name={dim.name} type="number" value={form[dim.name]} onChange={handleChange}
                                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                                        placeholder="0" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 6. DESCRIPTION */}
                            <div>
                                <h4 className="font-bold text-[#143D59] text-base mb-4 pb-2 border-b border-gray-100">Description & Details</h4>
                                <div className="space-y-5">
                                    <div>
                                        <label className="text-gray-700 text-sm font-medium mb-2 block">Bullet Points / Key Features</label>
                                        <div className="space-y-2">
                                            {form.bullet_points.map((point, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="text-[#143D59] font-bold text-sm w-4">•</span>
                                                    <input value={point} onChange={e => handleBulletChange(i, e.target.value)}
                                                        className="flex-1 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                                        placeholder={`Feature ${i + 1}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-gray-700 text-sm font-medium mb-1 block">Product Details (Long Description)</label>
                                        <textarea name="long_description" value={form.long_description} onChange={handleChange} rows={6}
                                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                            placeholder="Add detailed product description, specifications, usage instructions..." />
                                        <p className="text-xs text-gray-400 mt-1">You can use HTML for rich formatting</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-700 text-sm font-medium mb-1 block">What's Included</label>
                                        <textarea name="whats_included" value={form.whats_included} onChange={handleChange} rows={3}
                                            className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                            placeholder="1x Product&#10;1x Charging cable&#10;1x User manual" />
                                    </div>
                                </div>
                            </div>

                            {/* Save */}
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving || uploadingImages}
                                    className="flex-1 py-3 rounded-xl bg-[#F5B41A] text-[#143D59] font-bold hover:bg-[#e0a218] transition-all disabled:opacity-50">
                                    {saving ? 'Saving...' : uploadingImages ? 'Uploading...' : editProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}