import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import SellerSidebar from '../../components/SellerSidebar'

export default function SellerInvoices() {
    const { profile } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="min-h-screen bg-[#F7F8FA] flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

            <SellerSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 p-8`}>
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#143D59]" style={{ fontFamily: "'Syne', sans-serif" }}>Invoices</h2>
                    <p className="text-gray-500 mt-1">View and download your invoices.</p>
                </div>

                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <p className="text-5xl mb-4">🧾</p>
                    <p className="text-gray-500 font-medium">No invoices yet</p>
                    <p className="text-gray-400 text-sm mt-1">Invoices will appear here once you start fulfilling orders</p>
                </div>
            </main>
        </div>
    )
}