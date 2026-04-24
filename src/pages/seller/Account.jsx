import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SellerSidebar from '../../components/SellerSidebar'

const TABS = ['Profile Information', 'Password', 'Business Details', 'Bank Details', 'KYC Details']

export default function SellerAccount() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState('Profile Information')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        full_name: '',
        phone: '',
        store_name: '',
        store_slug: '',
        upi: '',
        gstin: '',
        business_name: '',
        address: '',
        city: '',
        pincode: '',
        bank_name: '',
        account_number: '',
        ifsc: '',
        account_holder: '',
        pan: '',
        aadhaar: '',
        new_password: '',
        confirm_password: '',
    })

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: sp } = await supabase
                .from('seller_profiles')
                .select('*')
                .eq('user_id', profile?.id)
                .single()

            setForm(prev => ({
                ...prev,
                full_name: profile?.full_name || '',
                phone: profile?.phone?.replace('+91', '') || '',
                store_name: sp?.store_name || '',
                store_slug: sp?.store_slug || '',
                upi: sp?.payment_method?.upi || '',
                bank_name: sp?.payment_method?.bank_name || '',
                account_number: sp?.payment_method?.account_number || '',
                ifsc: sp?.payment_method?.ifsc || '',
                account_holder: sp?.payment_method?.account_holder || '',
            }))
        } finally {
            setLoading(false)
        }
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSave() {
        setSaving(true)
        setError('')
        try {
            if (activeTab === 'Profile Information') {
                await supabase.from('profiles').update({
                    full_name: form.full_name,
                    phone: '+91' + form.phone
                }).eq('id', profile?.id)
                await supabase.from('seller_profiles').update({
                    store_name: form.store_name,
                    store_slug: form.store_slug,
                }).eq('user_id', profile?.id)
            }
            if (activeTab === 'Bank Details') {
                await supabase.from('seller_profiles').update({
                    payment_method: {
                        upi: form.upi,
                        bank_name: form.bank_name,
                        account_number: form.account_number,
                        ifsc: form.ifsc,
                        account_holder: form.account_holder,
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

            <SellerSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Account Details</h2>
                    <p className="text-gray-500 mt-1">Manage your personal, business and payment information.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100">
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                        {TABS.map(tab => (
                            <button key={tab} onClick={() => { setActiveTab(tab); setSaved(false); setError('') }}
                                className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${activeTab === tab
                                    ? 'border-[#143D59] text-[#143D59]'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
                        {saved && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">✅ Saved successfully!</div>}

                        {activeTab === 'Profile Information' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Full Name</label>
                                    <input name="full_name" value={form.full_name} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Your full name" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Email</label>
                                    <input value={profile?.email || ''} disabled
                                        className="w-full border border-gray-200 text-gray-400 rounded-lg px-4 py-3 bg-gray-50 cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Phone Number</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 text-sm">🇮🇳 +91</span>
                                        <input name="phone" value={form.phone} onChange={handleChange}
                                            className="w-full border border-gray-300 text-gray-900 rounded-r-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                            placeholder="98765 43210" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Store Name</label>
                                    <input name="store_name" value={form.store_name} onChange={handleChange}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="My Awesome Store" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Store URL</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500 text-sm">dropspot.in/store/</span>
                                        <input name="store_slug" value={form.store_slug} onChange={handleChange}
                                            className="w-full border border-gray-300 text-gray-900 rounded-r-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                            placeholder="mystore" />
                                    </div>
                                </div>
                            </div>
                        )}

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
                            </div>
                        )}

                        {activeTab === 'Business Details' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
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
                                    <label className="text-gray-700 text-sm font-medium mb-1 block">Business Address</label>
                                    <textarea name="address" value={form.address} onChange={handleChange} rows={3}
                                        className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                        placeholder="Full business address" />
                                </div>
                            </div>
                        )}

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
                                        placeholder="Full name as per bank" />
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
                            </div>
                        )}

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
                                    <p className="text-yellow-700 text-xs mt-1">Your KYC details are used for verification and payouts. This information is kept secure and private.</p>
                                </div>
                            </div>
                        )}

                        <button onClick={handleSave} disabled={saving || loading}
                            className="mt-8 bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                            {saving ? 'Saving...' : 'Update'}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}