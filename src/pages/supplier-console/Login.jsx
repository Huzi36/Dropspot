import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function SupplierLogin() {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
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
            await signIn(form.email, form.password)
            navigate('/seller-console/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800;900&display=swap" rel="stylesheet" />

            {/* Left Panel */}
            <div className="hidden lg:flex w-1/2 bg-[#143D59] flex-col justify-between p-12">
                <div>
                    <h1 className="text-white text-3xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                        Drop<span className="text-[#F5B41A]">spot.</span>
                    </h1>
                    <p className="text-[#F5B41A] text-sm mt-1">Supplier Console</p>
                </div>
                <div>
                    <h2 className="text-white text-4xl font-black leading-tight mb-4"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        Reach thousands<br />of sellers across<br />India.
                    </h2>
                    <p className="text-blue-200 text-lg">
                        List your products once. Let sellers do the marketing. You focus on fulfillment.
                    </p>
                </div>
                <div className="flex gap-8">
                    {[
                        { value: '1000+', label: 'Active Sellers' },
                        { value: '₹0', label: 'Listing Fee' },
                        { value: 'Fast', label: 'Payouts' },
                    ].map((stat, i) => (
                        <div key={i}>
                            <p className="text-[#F5B41A] text-2xl font-bold">{stat.value}</p>
                            <p className="text-blue-200 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    <div className="lg:hidden mb-8">
                        <h1 className="text-[#143D59] text-2xl font-bold" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Drop<span className="text-[#F5B41A]">spot.</span>
                        </h1>
                        <p className="text-gray-500 text-sm">Supplier Console</p>
                    </div>

                    <h2 className="text-3xl font-bold text-[#143D59] mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>Welcome back</h2>
                    <p className="text-gray-500 mb-8">Log in to your supplier account</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                placeholder="Your password" />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold py-3 rounded-lg transition-all disabled:opacity-50">
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    <p className="text-gray-500 text-sm text-center mt-6">
                        New supplier?{' '}
                        <Link to="/seller-console/signup" className="text-[#143D59] font-semibold hover:underline">
                            Create an account
                        </Link>
                    </p>
                    <p className="text-gray-400 text-xs text-center mt-3">
                        Are you a seller?{' '}
                        <Link to="/login" className="text-[#143D59] hover:underline">Go to Seller Login →</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}