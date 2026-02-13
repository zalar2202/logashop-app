"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import AccountingStats from '@/components/accounting/AccountingStats';
import TransactionsTable from '@/components/accounting/TransactionsTable';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { Loader2 } from "lucide-react";

export default function UserAccountingPage() {
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await axios.get("/api/invoices");
                if (data.success) {
                    setInvoices(data.data);
                    
                    const totalSpent = data.data
                        .filter(inv => inv.status === 'paid')
                        .reduce((sum, inv) => sum + (inv.total || 0), 0);
                    
                    const activeServicesCount = data.data.filter(inv => inv.status === 'paid').length;
                    
                    const pendingInvoice = data.data.find(inv => ['sent', 'overdue'].includes(inv.status));

                    setStats([
                        { title: "Total Spent", value: `$${totalSpent.toLocaleString()}`, percentage: "", trend: "up", description: "Lifetime investment" },
                        { 
                            title: "Pending Balance", 
                            value: pendingInvoice ? `$${pendingInvoice.total.toLocaleString()}` : "$0.00", 
                            percentage: "", 
                            trend: pendingInvoice ? "down" : "neutral", 
                            description: pendingInvoice ? `Next due: ${new Date(pendingInvoice.dueDate).toLocaleDateString()}` : "No outstanding bills" 
                        },
                        { title: "Active Services", value: activeServicesCount.toString(), percentage: "", trend: "neutral", description: "Current active plans" },
                    ]);
                }
            } catch (error) {
                console.error("Failed to fetch billing data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px', color: 'var(--color-text-primary)' }}>Billing & Invoices</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>View your payment history and manage your subscriptions.</p>
                </div>
                <button className="loga-btn">
                    <CreditCardIcon /> Payment Methods
                </button>
            </div>

            <AccountingStats stats={stats} />

            <div style={{ marginTop: '40px' }}>
                <TransactionsTable transactions={invoices} type="user" />
            </div>
        </div>
    );
}

