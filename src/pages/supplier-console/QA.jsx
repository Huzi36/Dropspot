import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../supabase'
import SupplierSidebar from '../../components/SupplierSidebar'
import { MessageCircle, Check } from 'lucide-react'

export default function SupplierQA() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState({})
    const [submitting, setSubmitting] = useState({})
    const [filter, setFilter] = useState('unanswered')

    useEffect(() => { fetchData() }, [])

    async function fetchData() {
        try {
            const { data: sp } = await supabase
                .from('supplier_profiles')
                .select('id')
                .eq('user_id', profile?.id)
                .single()

            if (sp) {
                const { data: products } = await supabase
                    .from('products')
                    .select('id')
                    .eq('supplier_id', sp.id)

                if (products?.length > 0) {
                    const productIds = products.map(p => p.id)
                    const { data: qs } = await supabase
                        .from('product_questions')
                        .select('*, products(id, name, images, category)')
                        .in('product_id', productIds)
                        .order('created_at', { ascending: false })
                    setQuestions(qs || [])
                }
            }
        } finally {
            setLoading(false)
        }
    }

    async function submitAnswer(questionId) {
        const answer = answers[questionId]?.trim()
        if (!answer) return
        setSubmitting(prev => ({ ...prev, [questionId]: true }))
        try {
            await supabase
                .from('product_questions')
                .update({ answer, answered_at: new Date().toISOString() })
                .eq('id', questionId)
            await fetchData()
            setAnswers(prev => ({ ...prev, [questionId]: '' }))
        } finally {
            setSubmitting(prev => ({ ...prev, [questionId]: false }))
        }
    }

    const filtered = questions.filter(q =>
        filter === 'all' ? true : filter === 'unanswered' ? !q.answer : !!q.answer
    )

    const unansweredCount = questions.filter(q => !q.answer).length

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
            <SupplierSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>
                            Q&A
                        </h2>
                        <p className="text-gray-500 mt-1">
                            Answer questions from customers about your products.
                            {unansweredCount > 0 && (
                                <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {unansweredCount} unanswered
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    {[
                        { key: 'unanswered', label: 'Unanswered' },
                        { key: 'answered', label: 'Answered' },
                        { key: 'all', label: 'All Questions' },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab.key
                                ? 'bg-[#143D59] text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                            {tab.label}
                            {tab.key === 'unanswered' && unansweredCount > 0 && (
                                <span className="ml-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                    {unansweredCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="bg-gray-200 rounded h-4 w-1/4 mb-3" />
                                <div className="bg-gray-200 rounded h-4 w-3/4 mb-2" />
                                <div className="bg-gray-200 rounded h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <MessageCircle size={48} className="mx-auto mb-4 text-gray-200" />
                        <p className="text-gray-500 font-medium">
                            {filter === 'unanswered' ? 'No unanswered questions' : filter === 'answered' ? 'No answered questions yet' : 'No questions yet'}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                            {filter === 'unanswered' ? "You're all caught up! 🎉" : 'Questions from customers will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(q => (
                            <div key={q.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                {/* Product info */}
                                <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 border-b border-gray-100">
                                    <div className="w-8 h-8 bg-white rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                        {q.products?.images?.[0]
                                            ? <img src={q.products.images[0]} alt="" className="w-full h-full object-cover" />
                                            : <span className="w-full h-full flex items-center justify-center text-sm">📦</span>}
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 truncate">{q.products?.name}</p>
                                    <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                                        {new Date(q.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>

                                <div className="p-6">
                                    {/* Question */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="w-8 h-8 bg-[#143D59]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-[#143D59]">Q</span>
                                        </div>
                                        <div>
                                            <p className="text-gray-800 font-medium text-sm">{q.question}</p>
                                            <p className="text-xs text-gray-400 mt-1">— {q.name} {q.email && `· ${q.email}`}</p>
                                        </div>
                                    </div>

                                    {/* Answer or Answer Form */}
                                    {q.answer ? (
                                        <div className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-white">A</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-700 text-sm">{q.answer}</p>
                                                <p className="text-xs text-green-600 mt-1 font-medium">
                                                    ✓ Answered · {q.answered_at && new Date(q.answered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs font-bold text-gray-400">A</span>
                                            </div>
                                            <div className="flex-1">
                                                <textarea
                                                    value={answers[q.id] || ''}
                                                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                                                    rows={3}
                                                    placeholder="Type your answer here..."
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#143D59] text-gray-800 resize-none" />
                                                <button
                                                    onClick={() => submitAnswer(q.id)}
                                                    disabled={submitting[q.id] || !answers[q.id]?.trim()}
                                                    className="mt-2 flex items-center gap-2 bg-[#143D59] text-white text-sm font-bold px-5 py-2 rounded-lg hover:bg-[#1a4f73] transition-all disabled:opacity-50">
                                                    <Check size={14} />
                                                    {submitting[q.id] ? 'Posting...' : 'Post Answer'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}