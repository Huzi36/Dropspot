import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ fullName: '', phone: '', email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await signUp(form.email, form.password, form.fullName, '+91' + form.phone, 'seller')
            navigate('/seller/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex">
            {/* Left Panel */}
            <div className="hidden lg:flex w-1/2 bg-[#143D59] flex-col justify-between p-12">
                <div>
                    <h1 className="text-white text-3xl font-bold">Dropspot.</h1>
                    <p className="text-[#F5B41A] text-sm mt-1">India's Stockless B2B2C Marketplace</p>
                </div>
                <div>
                    <h2 className="text-white text-4xl font-bold leading-tight mb-4">
                        Sell without holding<br />any inventory.
                    </h2>
                    <p className="text-blue-200 text-lg">
                        Connect with verified Indian suppliers, list products, and earn margins — all without a warehouse.
                    </p>
                </div>
                <div className="flex gap-8">
                    <div>
                        <p className="text-[#F5B41A] text-2xl font-bold">500+</p>
                        <p className="text-blue-200 text-sm">Products</p>
                    </div>
                    <div>
                        <p className="text-[#F5B41A] text-2xl font-bold">100+</p>
                        <p className="text-blue-200 text-sm">Suppliers</p>
                    </div>
                    <div>
                        <p className="text-[#F5B41A] text-2xl font-bold">Free</p>
                        <p className="text-blue-200 text-sm">To join</p>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-[#143D59] mb-1">Create your account</h2>
                    <p className="text-gray-500 mb-8">Start selling on Dropspot today — free forever</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Full Name</label>
                            <input name="fullName" type="text" required value={form.fullName} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59] focus:border-transparent"
                                placeholder="John Doe" />
                        </div>

                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Phone</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-600 text-sm font-medium">
                                    🇮🇳 +91
                                </span>
                                <input name="phone" type="tel" required value={form.phone} onChange={handleChange}
                                    className="w-full border border-gray-300 text-gray-900 rounded-r-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59] focus:border-transparent"
                                    placeholder="98765 43210" />
                            </div>
                        </div>

                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Email</label>
                            <input name="email" type="email" required value={form.email} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59] focus:border-transparent"
                                placeholder="you@example.com" />
                        </div>

                        <div>
                            <label className="text-gray-700 text-sm font-medium mb-1 block">Password</label>
                            <input name="password" type="password" required value={form.password} onChange={handleChange}
                                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#143D59] focus:border-transparent"
                                placeholder="Min 6 characters" />
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold py-3 rounded-lg transition-all mt-2 disabled:opacity-50">
                            {loading ? 'Creating account...' : 'Start Selling Free'}
                        </button>
                    </form>

                    <p className="text-gray-500 text-sm text-center mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#143D59] font-semibold hover:underline">Log in</Link>
                    </p>

                    <p className="text-gray-400 text-xs text-center mt-3">
                        Are you a supplier?{' '}
                        <a href="/seller-console" className="text-[#143D59] hover:underline">Go to Supplier Console →</a>
                    </p>
                </div>
            </div>
        </div>
    )
}