import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
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
                        Your store.<br />Your margins.<br />Zero inventory.
                    </h2>
                    <p className="text-blue-200 text-lg">
                        Thousands of products ready to sell. You market, we handle the rest.
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
                    <h2 className="text-3xl font-bold text-[#143D59] mb-1">Welcome back</h2>
                    <p className="text-gray-500 mb-8">Log in to your Dropspot account</p>

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
                            className="w-full bg-[#F5B41A] hover:bg-[#e0a218] text-[#143D59] font-bold py-3 rounded-lg transition-all mt-2 disabled:opacity-50">
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    <p className="text-gray-500 text-sm text-center mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#143D59] font-semibold hover:underline">Sign up free</Link>
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