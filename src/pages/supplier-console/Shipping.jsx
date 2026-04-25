import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SupplierSidebar from '../../components/SupplierSidebar'

export default function SupplierShipping() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        pickup_name: '',
        pickup_phone: '',
        pickup_address: '',
        pickup_city: '',
        pickup_pincode: '',
        pickup_state: '',
    })

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        const { data: sp } = await supabase
            .from('supplier_profiles')
            .select('*')
            .eq('user_id', profile?.id)
            .single()

        if (sp) {
            setForm({
                pickup_name: sp.pickup_name || profile?.full_name || '',
                pickup_phone: sp.pickup_phone || profile?.phone?.replace('+91', '') || '',
                pickup_address: sp.address || '',
                pickup_city: sp.city || '',
                pickup_pincode: sp.pincode || '',
                pickup_state: sp.pickup_state || '',
            })
        }
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSave() {
        setSaving(true)
        setError('')
        try {
            await supabase.from('supplier_profiles').update({
                address: form.pickup_address,
                city: form.pickup_city,
                pincode: form.pickup_pincode,
            }).eq('user_id', profile?.id)
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
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Shipping</h2>
                    <p className="text-gray-500 mt-1">Manage your pickup address for Shiprocket.</p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex gap-4">
                    <span className="text-2xl">🚚</span>
                    <div>
                        <p className="font-semibold text-blue-800 text-sm">How shipping works</p>
                        <p className="text-blue-600 text-xs mt-1">Once a seller pays for an order, Dropspot notifies Shiprocket who will send a delivery partner to your pickup address. Make sure your address is accurate and complete.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-8 max-w-2xl">
                    <h3 className="font-bold text-[#143D59] text-lg mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
                        📍 Pickup Address
                    </h3>

                    {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
                    {saved && <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6 text-sm">✅ Pickup address saved!</div>}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Contact Name</label>
                            <input name="pickup_name" value={form.pickup_name} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                placeholder="Name of person at pickup location" />
                        </div>
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Contact Phone</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 text-sm">🇮🇳 +91</span>
                                <input name="pickup_phone" value={form.pickup_phone} onChange={handleChange}
                                    className="w-full border border-gray-300 text-gray-900 rounded-r-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                    placeholder="98765 43210" />
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Pickup Address</label>
                            <textarea name="pickup_address" value={form.pickup_address} onChange={handleChange} rows={3}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                placeholder="Full address with landmark" />
                        </div>
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">City</label>
                            <input name="pickup_city" value={form.pickup_city} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                placeholder="Mumbai" />
                        </div>
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Pincode</label>
                            <input name="pickup_pincode" value={form.pickup_pincode} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                placeholder="400001" />
                        </div>
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">State</label>
                            <input name="pickup_state" value={form.pickup_state} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                placeholder="Maharashtra" />
                        </div>
                    </div>

                    <button onClick={handleSave} disabled={saving}
                        className="mt-8 bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold px-8 py-3 rounded-xl transition-all disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Pickup Address'}
                    </button>
                </div>
            </main>
        </div>
    )
}