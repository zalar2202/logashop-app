"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
    Ticket,
    Plus,
    MessageSquare,
    Clock,
    CheckCircle,
    XCircle,
    Send,
} from "lucide-react";

const statusConfig = {
    open: { label: "Open", color: "bg-blue-100 text-blue-700" },
    in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700" },
    waiting_customer: { label: "Awaiting Reply", color: "bg-purple-100 text-purple-700" },
    waiting_staff: { label: "Needs Attention", color: "bg-orange-100 text-orange-700" },
    resolved: { label: "Resolved", color: "bg-green-100 text-green-700" },
    closed: { label: "Closed", color: "bg-gray-100 text-gray-700" },
};

const priorityColors = {
    low: "text-gray-500",
    medium: "text-blue-600",
    high: "text-orange-600",
    urgent: "text-red-600",
};

export default function AccountTicketsPage() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        subject: "",
        description: "",
        category: "general",
        priority: "medium",
    });

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/tickets");
            if (data.success) setTickets(data.data);
        } catch (error) {
            toast.error("Failed to fetch tickets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTicketDetail = async (id) => {
        try {
            const { data } = await axios.get(`/api/tickets/${id}`);
            if (data.success) {
                setSelectedTicket(data.data);
                setIsDetailOpen(true);
                setReplyText("");
            }
        } catch (error) {
            toast.error("Failed to load ticket");
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        if (!form.subject?.trim() || !form.description?.trim()) {
            toast.error("Subject and description are required");
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await axios.post("/api/tickets", form);
            if (data.success) {
                toast.success("Ticket created successfully");
                setForm({ subject: "", description: "", category: "general", priority: "medium" });
                setIsCreateModalOpen(false);
                fetchTickets();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create ticket");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;
        setSending(true);
        try {
            const { data } = await axios.post(`/api/tickets/${selectedTicket._id}/reply`, {
                message: replyText,
                isInternal: false,
            });
            if (data.success) {
                toast.success("Reply sent");
                setReplyText("");
                fetchTicketDetail(selectedTicket._id);
                fetchTickets();
            }
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedTicket) return;
        try {
            const { data } = await axios.put(`/api/tickets/${selectedTicket._id}`, { status });
            if (data.success) {
                toast.success("Ticket updated");
                fetchTicketDetail(selectedTicket._id);
                fetchTickets();
            }
        } catch (error) {
            toast.error("Failed to update");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold">Support Tickets</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                    <Plus size={18} />
                    New Ticket
                </button>
            </div>

            {/* Ticket List */}
            {loading ? (
                <div className="py-12 text-center text-[var(--color-text-secondary)]">
                    Loading tickets...
                </div>
            ) : tickets.length === 0 ? (
                <div className="bg-white rounded-xl border border-[var(--color-border)] p-12 text-center">
                    <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-[var(--color-text-secondary)]">No tickets yet</p>
                    <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                        Create a ticket to get support from our team.
                    </p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium"
                    >
                        <Plus size={16} /> New Ticket
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {tickets.map((ticket) => (
                        <button
                            key={ticket._id}
                            onClick={() => fetchTicketDetail(ticket._id)}
                            className="w-full text-left bg-white rounded-xl border border-[var(--color-border)] p-4 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-[var(--color-text-tertiary)]">
                                            {ticket.ticketNumber}
                                        </span>
                                        <span
                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                statusConfig[ticket.status]?.color || "bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            {statusConfig[ticket.status]?.label || ticket.status}
                                        </span>
                                        <span className={`text-xs font-medium ${priorityColors[ticket.priority]}`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold truncate">{ticket.subject}</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-1 mt-1">
                                        {ticket.description}
                                    </p>
                                </div>
                                <span className="text-xs text-[var(--color-text-tertiary)] whitespace-nowrap">
                                    {new Date(ticket.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-[var(--color-border)]">
                            <h3 className="text-lg font-bold">Create New Ticket</h3>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Subject</label>
                                <input
                                    type="text"
                                    value={form.subject}
                                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                                    placeholder="Brief summary of your issue"
                                    required
                                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-white dark:bg-gray-800"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Category</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-white dark:bg-gray-800"
                                    >
                                        <option value="general">General</option>
                                        <option value="technical">Technical Support</option>
                                        <option value="billing">Billing</option>
                                        <option value="account">Account</option>
                                        <option value="feature_request">Feature Request</option>
                                        <option value="bug_report">Bug Report</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Priority</label>
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                                        className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-white dark:bg-gray-800"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    placeholder="Describe your issue in detail..."
                                    rows={5}
                                    required
                                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--color-border)] bg-white dark:bg-gray-800"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    {submitting ? "Creating..." : "Create Ticket"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Ticket Detail Modal */}
            {isDetailOpen && selectedTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-[var(--color-border)]">
                            <h3 className="text-lg font-bold">{selectedTicket.ticketNumber}</h3>
                            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                {selectedTicket.subject}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-3">
                                <span
                                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                        statusConfig[selectedTicket.status]?.color || "bg-gray-100"
                                    }`}
                                >
                                    {statusConfig[selectedTicket.status]?.label}
                                </span>
                                <span className={`text-xs font-medium ${priorityColors[selectedTicket.priority]}`}>
                                    {selectedTicket.priority} priority
                                </span>
                                <span className="text-xs text-[var(--color-text-tertiary)]">
                                    Created {new Date(selectedTicket.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {selectedTicket.messages?.map((msg, idx) => (
                                <div
                                    key={msg._id || idx}
                                    className={`flex ${msg.sender?._id === user?._id ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-4 ${
                                            msg.sender?._id === user?._id
                                                ? "bg-[var(--color-primary)] text-white"
                                                : "bg-gray-100 dark:bg-gray-800"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold">
                                                {msg.sender?.name || "Support"}
                                            </span>
                                            <span className="text-xs opacity-80">
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!["closed"].includes(selectedTicket.status) && (
                            <div className="p-6 border-t border-[var(--color-border)] space-y-4">
                                <div className="flex gap-2">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        rows={2}
                                        className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] bg-white dark:bg-gray-800 resize-none focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none"
                                    />
                                    <button
                                        onClick={handleSendReply}
                                        disabled={!replyText.trim() || sending}
                                        className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                    >
                                        <Send size={16} />
                                        {sending ? "Sending..." : "Send"}
                                    </button>
                                </div>
                                {!["closed", "resolved"].includes(selectedTicket.status) && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdateStatus("resolved")}
                                            className="flex items-center gap-2 px-4 py-2 border border-green-500 text-green-600 rounded-lg text-sm font-medium hover:bg-green-50"
                                        >
                                            <CheckCircle size={16} />
                                            Mark as Resolved
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Close this ticket?")) handleUpdateStatus("closed");
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50"
                                        >
                                            <XCircle size={16} />
                                            Close Ticket
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-4 border-t border-[var(--color-border)]">
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="w-full py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
