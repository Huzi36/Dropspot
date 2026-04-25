import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SupplierSidebar from '../../components/SupplierSidebar'
import { Plus, X, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'

const CATEGORIES = ['Electronics', 'Fashion', 'Beauty', 'Home & Kitchen', 'Fitness', 'Baby & Kids', 'Automobile', 'Gifts & Decor', 'Other']

const EMPTY_FORM = {
    name: '',
    category: '',
    supplier_price: '',
    weight_grams: '',
    stock: '',
    sku: '',
    description: '',
    bullet_points: ['', '', '', '', ''],
    long_description: '',
    images: [],
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
    const [imageUrl, setImageUrl] = useState('')

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
        setError('')
        setShowModal(true)
    }

    function openEditModal(product) {
        setEditProduct(product)
        setForm({
            name: product.name || '',
            category: product.category || '',
            supplier_price: product.supplier_price || '',
            weight_grams: product.weight_grams || '',
            stock: product.stock || '',
            sku: product.sku || '',
            description: product.description || '',
            bullet_points: product.bullet_points?.length > 0 ? product.bullet_points : ['', '', '', '', ''],
            long_description: product.long_description || '',
            images: product.images || [],
        })
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

    function addImageUrl() {
        if (!imageUrl.trim()) return
        setForm({ ...form, images: [...form.images, imageUrl.trim()] })
        setImageUrl('')
    }

    function removeImage(i) {
        const updated = form.images.filter((_, idx) => idx !== i)
        setForm({ ...form, images: updated })
    }

    async function handleSave() {
        if (!form.name || !form.supplier_price || !form.stock) {
            setError('Name, price and stock are required')
            return
        }
        setSaving(true)
        setError('')
        try {
            const payload = {
                name: form.name,
                category: form.category,
                supplier_price: parseFloat(form.supplier_price),
                weight_grams: parseInt(form.weight_grams) || 0,
                stock: parseInt(form.stock),
                sku: form.sku,
                description: form.description,
                bullet_points: form.bullet_points.filter(b => b.trim() !== ''),
                long_description: form.long_description,
                images: form.images,
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
                        <Plus size={18} />
                        Add Product
                    </button>
                </div>

                {/* Products Grid */}
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
                                    {product.images?.[0] ? (
                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                                    )}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5">
                                    {product.category && (
                                        <span className="text-xs text-[#143D59] font-semibold bg-[#143D59]/10 px-2 py-0.5 rounded-full">
                                            {product.category}
                                        </span>
                                    )}
                                    <h3 className="font-bold text-gray-900 mt-2 mb-3 line-clamp-2">{product.name}</h3>
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
                                            <Edit2 size={14} />
                                            Edit
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
                            <h3 className="font-bold text-[#143D59] text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {editProduct ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <button onClick={() => setShowModal(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-all">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
                            )}

                            {/* Basic Info */}
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

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Price (₹) *</label>
                                    <input name="supplier_price" type="number" value={form.supplier_price} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="350" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Stock *</label>
                                    <input name="stock" type="number" value={form.stock} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="50" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Weight (grams)</label>
                                    <input name="weight_grams" type="number" value={form.weight_grams} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="200" />
                                </div>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="text-gray-700 text-sm font-medium mb-2 block">Product Images (URLs)</label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        value={imageUrl}
                                        onChange={e => setImageUrl(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addImageUrl()}
                                        className="flex-1 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                        placeholder="Paste image URL and press Add" />
                                    <button onClick={addImageUrl}
                                        className="bg-[#143D59] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1a4f73] transition-all">
                                        Add
                                    </button>
                                </div>
                                {form.images.length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {form.images.map((img, i) => (
                                            <div key={i} className="relative">
                                                <img src={img} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                                                <button onClick={() => removeImage(i)}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Bullet Points */}
                            <div>
                                <label className="text-gray-700 text-sm font-medium mb-2 block">Bullet Points (Key Features)</label>
                                <div className="space-y-2">
                                    {form.bullet_points.map((point, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-[#143D59] font-bold text-sm w-4">•</span>
                                            <input
                                                value={point}
                                                onChange={e => handleBulletChange(i, e.target.value)}
                                                className="flex-1 border border-gray-200 text-gray-900 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                                placeholder={`Feature ${i + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Long Description */}
                            <div>
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Product Details (Long Description)</label>
                                <textarea name="long_description" value={form.long_description} onChange={handleChange} rows={5}
                                    className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59] text-sm"
                                    placeholder="Add detailed product description, specifications, usage instructions..." />
                                <p className="text-xs text-gray-400 mt-1">You can use HTML for rich formatting (bold, images, etc.)</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className="flex-1 py-3 rounded-xl bg-[#F5B41A] text-[#143D59] font-bold hover:bg-[#e0a218] transition-all disabled:opacity-50">
                                    {saving ? 'Saving...' : editProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}