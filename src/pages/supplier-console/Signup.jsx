import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'

export default function SupplierSignup() {
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        fullName: '', phone: '', email: '', password: '',
        businessName: '', city: '', pincode: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit() {
        setLoading(true)
        setError('')
        try {
            const data = await signUp(form.email, form.password, form.fullName, '+91' + form.phone, 'supplier')

            // Store extra supplier details on the profile
            await supabase.from('profiles').update({
                business_name: form.businessName,
                city: form.city,
                pincode: form.pincode,
            }).eq('id', data.user.id)

            navigate('/supplier-console/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />

            <div className="hidden lg:flex w-1/2 bg-[#143D59] flex-col justify-between p-12">
                <div>
                    <h1 className="text-white text-3xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Drop<span className="text-[#F5B41A]">spot.</span>
                    </h1>
                    <p className="text-[#F5B41A] text-sm mt-1">Supplier Console</p>
                </div>
                <div>
                    <h2 className="text-white text-4xl font-black leading-tight mb-4" style={{ fontFamily: "'Syne', sans-serif" }}>
                        List once.<br />Sell everywhere.<br />Get paid fast.
                    </h2>
                    <p className="text-blue-200 text-lg">
                        Join India's growing dropshipping network. Zero listing fees. Instant access to thousands of sellers.
                    </p>
                </div>
                <div className="flex gap-8">
                    {[{ value: '1000+', label: 'Active Sellers' }, { value: '₹0', label: 'Listing Fee' }, { value: 'Fast', label: 'Payouts' }].map((stat, i) => (
                        <div key={i}>
                            <p className="text-[#F5B41A] text-2xl font-bold">{stat.value}</p>
                            <p className="text-blue-200 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8">
                        <h1 className="text-[#143D59] text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Drop<span className="text-[#F5B41A]">spot.</span>
                        </h1>
                        <p className="text-gray-500 text-sm">Supplier Console</p>
                    </div>

                    <h2 className="text-3xl font-bold text-[#143D59] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Become a Supplier</h2>
                    <p className="text-gray-500 mb-8">Create your supplier account — free forever</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Full Name</label>
                            <input name="fullName" type="text" value={form.fullName} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Business Name</label>
                            <input name="businessName" type="text" value={form.businessName} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                placeholder="Your Business Pvt Ltd" />
                        </div>
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Phone</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 text-sm font-medium">🇮🇳 +91</span>
                                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                                    className="w-full border border-gray-300 text-gray-900 rounded-r-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                    placeholder="98765 43210" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-700 text-sm font-medium mb-1 block">City</label>
                                <input name="city" type="text" value={form.city} onChange={handleChange}
                                    className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                    placeholder="Mumbai" />
                            </div>
                            <div>
                                <label className="text-gray-700 text-sm font-medium mb-1 block">Pincode</label>
                                <input name="pincode" type="text" value={form.pincode} onChange={handleChange}
                                    className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                    placeholder="400001" />
                            </div>
                        </div>
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Email</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                placeholder="you@example.com" />
                        </div>
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Password</label>
                            <input name="password" type="password" value={form.password} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59]"
                                placeholder="Min 6 characters" />
                        </div>
                        <button onClick={handleSubmit} disabled={loading}
                            className="w-full bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold py-3 rounded-lg transition-all disabled:opacity-50">
                            {loading ? 'Creating account...' : 'Create Supplier Account'}
                        </button>
                    </div>

                    <p className="text-gray-500 text-sm text-center mt-6">
                        Already have an account?{' '}
                        <Link to="/supplier-console" className="text-[#143D59] font-semibold hover:underline">Log in</Link>
                    </p>
                    <p className="text-gray-400 text-xs text-center mt-3">
                        Are you a seller?{' '}
                        <Link to="/signup" className="text-[#143D59] hover:underline">Go to Seller Signup →</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}