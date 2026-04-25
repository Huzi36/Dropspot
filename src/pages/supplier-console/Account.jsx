import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SupplierSidebar from '../../components/SupplierSidebar'
import { Plus, X, Edit2, Trash2, Star } from 'lucide-react'

const TABS = ['Business Details', 'Warehouses', 'Bank Details', 'KYC Details', 'Password']

const EMPTY_WAREHOUSE = {
    name: '',
    contact_name: '',
    contact_phone: '',
    address: '',
    city: '',
    pincode: '',
    state: '',
    is_default: false,
}

export default function SupplierAccount() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState('Business Details')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [supplierProfile, setSupplierProfile] = useState(null)

    // Warehouses state
    const [warehouses, setWarehouses] = useState([])
    const [showWarehouseModal, setShowWarehouseModal] = useState(false)
    const [editWarehouse, setEditWarehouse] = useState(null)
    const [warehouseForm, setWarehouseForm] = useState(EMPTY_WAREHOUSE)
    const [savingWarehouse, setSavingWarehouse] = useState(false)

    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        business_name: '',
        gstin: '',
        address: '',
        city: '',
        pincode: '',
        bank_name: '',
        account_number: '',
        ifsc: '',
        account_holder: '',
        upi: '',
        pan: '',
        aadhaar: '',
        new_password: '',
        confirm_password: '',
    })

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: sp } = await supabase
                .from('supplier_profiles')
                .select('*')
                .eq('user_id', profile?.id)
                .single()
            setSupplierProfile(sp)

            setForm(prev => ({
                ...prev,
                full_name: profile?.full_name || '',
                phone: profile?.phone?.replace('+91', '') || '',
                business_name: sp?.business_name || '',
                gstin: sp?.gstin || '',
                address: sp?.address || '',
                city: sp?.city || '',
                pincode: sp?.pincode || '',
                bank_name: sp?.bank_account?.bank_name || '',
                account_number: sp?.bank_account?.account_number || '',
                ifsc: sp?.bank_account?.ifsc || '',
                account_holder: sp?.bank_account?.account_holder || '',
                upi: sp?.bank_account?.upi || '',
            }))

            if (sp) {
                const { data: wh } = await supabase
                    .from('warehouses')
                    .select('*')
                    .eq('supplier_id', sp.id)
                    .order('is_default', { ascending: false })
                setWarehouses(wh || [])
            }
        } finally {
            setLoading(false)
        }
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    function handleWarehouseChange(e) {
        setWarehouseForm({ ...warehouseForm, [e.target.name]: e.target.value })
    }

    function openAddWarehouse() {
        setEditWarehouse(null)
        setWarehouseForm(EMPTY_WAREHOUSE)
        setShowWarehouseModal(true)
    }

    function openEditWarehouse(warehouse) {
        setEditWarehouse(warehouse)
        setWarehouseForm({
            name: warehouse.name || '',
            contact_name: warehouse.contact_name || '',
            contact_phone: warehouse.contact_phone || '',
            address: warehouse.address || '',
            city: warehouse.city || '',
            pincode: warehouse.pincode || '',
            state: warehouse.state || '',
            is_default: warehouse.is_default || false,
        })
        setShowWarehouseModal(true)
    }

    async function handleSaveWarehouse() {
        if (!warehouseForm.name || !warehouseForm.address) {
            alert('Warehouse name and address are required')
            return
        }
        setSavingWarehouse(true)
        try {
            if (warehouseForm.is_default) {
                await supabase.from('warehouses')
                    .update({ is_default: false })
                    .eq('supplier_id', supplierProfile.id)
            }

            if (editWarehouse) {
                await supabase.from('warehouses')
                    .update({ ...warehouseForm })
                    .eq('id', editWarehouse.id)
            } else {
                await supabase.from('warehouses')
                    .insert({ ...warehouseForm, supplier_id: supplierProfile.id })
            }
            await fetchData()
            setShowWarehouseModal(false)
        } finally {
            setSavingWarehouse(false)
        }
    }

    async function deleteWarehouse(id) {
        if (!confirm('Delete this warehouse?')) return
        await supabase.from('warehouses').delete().eq('id', id)
        await fetchData()
    }

    async function setDefaultWarehouse(id) {
        await supabase.from('warehouses').update({ is_default: false }).eq('supplier_id', supplierProfile.id)
        await supabase.from('warehouses').update({ is_default: true }).eq('id', id)
        await fetchData()
    }

    async function handleSave() {
        setSaving(true)
        setError('')
        try {
            if (activeTab === 'Business Details') {
                await supabase.from('profiles').update({
                    full_name: form.full_name,
                    phone: '+91' + form.phone
                }).eq('id', profile?.id)

                await supabase.from('supplier_profiles').update({
                    business_name: form.business_name,
                    gstin: form.gstin,
                    address: form.address,
                    city: form.city,
                    pincode: form.pincode,
                }).eq('user_id', profile?.id)
            }

            if (activeTab === 'Bank Details') {
                await supabase.from('supplier_profiles').update({
                    bank_account: {
                        bank_name: form.bank_name,
                        account_number: form.account_number,
                        ifsc: form.ifsc,
                        account_holder: form.account_holder,
                        upi: form.upi,
                    }
                }).eq('user_id', profile?.id)
            }

            if (activeTab === 'Password') {
                if (form.new_password !== form.confirm_password) {
                    setError('Passwords do not match')
                    return
                }
                const { error } = await supabase.auth.updateUser({ password: form.new_password })
                if (error) throw error
            }

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (err) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

            <SupplierSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Account</h2>
                    <p className="text-gray-500 mt-1">Manage your supplier account details.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        {TABS.map(tab => (
                            <button key={tab} onClick={() => { setActiveTab(tab); setSaved(false); setError('') }}
                                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab
                                    ? 'border-[#143D59] text-[#143D59]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                {tab}
                                {tab === 'Warehouses' && warehouses.length > 0 && (
                                    <span className="ml-2 text-xs bg-[#143D59] text-white px-2 py-0.5 rounded-full">
                                        {warehouses.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
                        {saved && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">✅ Saved successfully!</div>}

                        {/* Business Details */}
                        {activeTab === 'Business Details' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Full Name</label>
                                    <input name="full_name" value={form.full_name} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Your full name" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Phone</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 text-sm">🇮🇳 +91</span>
                                        <input name="phone" value={form.phone} onChange={handleChange}
                                            className="w-full border border-gray-300 text-gray-900 rounded-r-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                            placeholder="98765 43210" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Email</label>
                                    <input value={profile?.email || ''} disabled
                                        className="w-full border border-gray-200 text-gray-400 rounded-lg px-4 py-3 bg-gray-50 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Business Name</label>
                                    <input name="business_name" value={form.business_name} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Your Business Pvt Ltd" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">GSTIN</label>
                                    <input name="gstin" value={form.gstin} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="22AAAAA0000A1Z5" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">City</label>
                                    <input name="city" value={form.city} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Mumbai" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Pincode</label>
                                    <input name="pincode" value={form.pincode} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="400001" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Address</label>
                                    <textarea name="address" value={form.address} onChange={handleChange} rows={3}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Full business address" />
                                </div>

                                <div className="md:col-span-2">
                                    <button onClick={handleSave} disabled={saving}
                                        className="bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* WAREHOUSES */}
                        {activeTab === 'Warehouses' && (
                            <div>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-gray-600 text-sm">Add pickup locations for your products. Each product can be assigned to a specific warehouse.</p>
                                    </div>
                                    <button onClick={openAddWarehouse}
                                        className="flex items-center gap-2 bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold px-4 py-2.5 rounded-xl transition-all text-sm">
                                        <Plus size={16} /> Add Warehouse
                                    </button>
                                </div>

                                {/* Info Banner */}
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex gap-3">
                                    <span className="text-xl">💡</span>
                                    <div>
                                        <p className="text-blue-800 text-sm font-semibold">Collaborate with other suppliers</p>
                                        <p className="text-blue-600 text-xs mt-0.5">Add any pickup address — your own warehouse, a partner's factory, or a friend's store. When an order comes in, Shiprocket picks up from that address automatically.</p>
                                    </div>
                                </div>

                                {warehouses.length === 0 ? (
                                    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-4xl mb-3">🏭</p>
                                        <p className="text-gray-500 font-medium">No warehouses yet</p>
                                        <p className="text-gray-400 text-sm mt-1">Add your first pickup location to start fulfilling orders</p>
                                        <button onClick={openAddWarehouse}
                                            className="inline-block mt-4 bg-[#F5B41A] text-[#143D59] font-bold px-6 py-2 rounded-xl hover:bg-[#e0a218] transition-all text-sm">
                                            + Add First Warehouse
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {warehouses.map(warehouse => (
                                            <div key={warehouse.id}
                                                className={`border-2 rounded-2xl p-5 transition-all ${warehouse.is_default ? 'border-[#143D59] bg-[#143D59]/5' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-gray-800">{warehouse.name}</h4>
                                                        {warehouse.is_default && (
                                                            <span className="flex items-center gap-1 text-xs bg-[#143D59] text-white px-2 py-0.5 rounded-full">
                                                                <Star size={10} fill="currentColor" /> Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openEditWarehouse(warehouse)}
                                                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-all text-gray-500">
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button onClick={() => deleteWarehouse(warehouse.id)}
                                                            className="p-1.5 rounded-lg hover:bg-red-50 transition-all text-red-400">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5 mb-4">
                                                    {warehouse.contact_name && (
                                                        <p className="text-sm text-gray-600">👤 {warehouse.contact_name} {warehouse.contact_phone && `· +91 ${warehouse.contact_phone}`}</p>
                                                    )}
                                                    <p className="text-sm text-gray-600">📍 {warehouse.address}</p>
                                                    <p className="text-sm text-gray-500">{warehouse.city}{warehouse.state && `, ${warehouse.state}`} - {warehouse.pincode}</p>
                                                </div>

                                                {!warehouse.is_default && (
                                                    <button onClick={() => setDefaultWarehouse(warehouse.id)}
                                                        className="text-xs text-[#143D59] font-semibold hover:underline">
                                                        Set as default →
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bank Details */}
                        {activeTab === 'Bank Details' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                                <div className="md:col-span-2">
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">UPI ID</label>
                                    <input name="upi" value={form.upi} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="yourname@upi" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Account Holder Name</label>
                                    <input name="account_holder" value={form.account_holder} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Name as per bank" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Bank Name</label>
                                    <input name="bank_name" value={form.bank_name} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="HDFC Bank" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Account Number</label>
                                    <input name="account_number" value={form.account_number} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="XXXXXXXXXXXX" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">IFSC Code</label>
                                    <input name="ifsc" value={form.ifsc} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="HDFC0001234" />
                                </div>
                                <div className="md:col-span-2">
                                    <button onClick={handleSave} disabled={saving}
                                        className="bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* KYC Details */}
                        {activeTab === 'KYC Details' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">PAN Number</label>
                                    <input name="pan" value={form.pan} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="ABCDE1234F" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Aadhaar Number</label>
                                    <input name="aadhaar" value={form.aadhaar} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="XXXX XXXX XXXX" />
                                </div>
                                <div className="md:col-span-2 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <p className="text-yellow-800 text-sm font-medium">⚠️ KYC Verification</p>
                                    <p className="text-yellow-700 text-xs mt-1">Your KYC details are used for verification and payouts. Kept secure and private.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <button onClick={handleSave} disabled={saving}
                                        className="bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        {activeTab === 'Password' && (
                            <div className="space-y-5 max-w-md">
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">New Password</label>
                                    <input name="new_password" type="password" value={form.new_password} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Enter new password" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Confirm Password</label>
                                    <input name="confirm_password" type="password" value={form.confirm_password} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Confirm new password" />
                                </div>
                                <button onClick={handleSave} disabled={saving}
                                    className="bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                                    {saving ? 'Saving...' : 'Update Password'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Warehouse Modal */}
            {showWarehouseModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="font-bold text-[#143D59] text-lg" style={{ fontFamily: "'Syne', sans-serif" }}>
                                {editWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
                            </h3>
                            <button onClick={() => setShowWarehouseModal(false)}
                                className="p-2 rounded-xl hover:bg-gray-100 transition-all">
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Warehouse Name *</label>
                                <input name="name" value={warehouseForm.name} onChange={handleWarehouseChange}
                                    className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                    placeholder="e.g. Mumbai Main, Delhi Warehouse, Rajan's Factory" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Contact Name</label>
                                    <input name="contact_name" value={warehouseForm.contact_name} onChange={handleWarehouseChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Person at pickup" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Contact Phone</label>
                                    <input name="contact_phone" value={warehouseForm.contact_phone} onChange={handleWarehouseChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="98765 43210" />
                                </div>
                            </div>
                            <div>
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Pickup Address *</label>
                                <textarea name="address" value={warehouseForm.address} onChange={handleWarehouseChange} rows={2}
                                    className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                    placeholder="Full address with landmark" />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">City</label>
                                    <input name="city" value={warehouseForm.city} onChange={handleWarehouseChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Mumbai" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">State</label>
                                    <input name="state" value={warehouseForm.state} onChange={handleWarehouseChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Maharashtra" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Pincode</label>
                                    <input name="pincode" value={warehouseForm.pincode} onChange={handleWarehouseChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="400001" />
                                </div>
                            </div>

                            {/* Set as Default */}
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                <button onClick={() => setWarehouseForm({ ...warehouseForm, is_default: !warehouseForm.is_default })}
                                    className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${warehouseForm.is_default ? 'bg-[#143D59]' : 'bg-gray-300'}`}>
                                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${warehouseForm.is_default ? 'left-5' : 'left-0.5'}`} />
                                </button>
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Set as default warehouse</p>
                                    <p className="text-xs text-gray-400">Used for products without a specific warehouse assigned</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setShowWarehouseModal(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all">
                                    Cancel
                                </button>
                                <button onClick={handleSaveWarehouse} disabled={savingWarehouse}
                                    className="flex-1 py-3 rounded-xl bg-[#F5B41A] text-[#143D59] font-bold hover:bg-[#e0a218] transition-all disabled:opacity-50">
                                    {savingWarehouse ? 'Saving...' : editWarehouse ? 'Update Warehouse' : 'Add Warehouse'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}