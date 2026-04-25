import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SupplierSidebar from '../../components/SupplierSidebar'
import { MessageCircle } from 'lucide-react'

export default function SupplierQA() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: sp } = await supabase
                .from('supplier_profiles')
                .select('id')
                .eq('user_id', profile?.id)
                .single()

            if (sp) {
                const { data } = await supabase
                    .from('products')
                    .select('id, name, images, category')
                    .eq('supplier_id', sp.id)
                    .eq('is_active', true)
                setProducts(data || [])
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
            <SupplierSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Q&A</h2>
                    <p className="text-gray-500 mt-1">Answer questions from sellers and customers about your products.</p>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="bg-gray-200 rounded h-4 w-1/4 mb-3" />
                                <div className="bg-gray-200 rounded h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <MessageCircle size={48} className="mx-auto mb-4 text-gray-200" />
                        <p className="text-gray-500 font-medium">No products to show Q&A for</p>
                        <p className="text-gray-400 text-sm mt-1">Add products first to start receiving questions</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {products.map(product => (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                        {product.images?.[0]
                                            ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                            : <span className="text-2xl">📦</span>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800">{product.name}</p>
                                        <p className="text-xs text-gray-400">{product.category}</p>
                                    </div>
                                </div>

                                <div className="text-center py-6 bg-gray-50 rounded-xl">
                                    <MessageCircle size={24} className="mx-auto mb-2 text-gray-300" />
                                    <p className="text-sm text-gray-400">No questions yet for this product</p>
                                    <p className="text-xs text-gray-400 mt-1">Questions from sellers will appear here</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}