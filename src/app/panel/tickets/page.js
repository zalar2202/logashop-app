"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Modal } from "@/components/common/Modal";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { TextareaField } from "@/components/forms/TextareaField";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import { 
    Ticket, Plus, Search, Filter, MessageSquare, Clock, User, 
    AlertTriangle, CheckCircle, XCircle, ArrowRight, ChevronDown,
    Send, Paperclip, Lock, Star, Tag
} from "lucide-react";

const ticketSchema = Yup.object().shape({
    subject: Yup.string().required("Subject is required").max(200),
    description: Yup.string().required("Description is required"),
    category: Yup.string(),
    priority: Yup.string(),
});

const priorityColors = {
    low: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400" },
    medium: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600", dot: "bg-blue-500" },
    high: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-600", dot: "bg-orange-500" },
    urgent: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600", dot: "bg-red-500" },
};

const statusConfig = {
    open: { label: "Open", color: "primary", icon: <MessageSquare className="w-3 h-3" /> },
    in_progress: { label: "In Progress", color: "warning", icon: <Clock className="w-3 h-3" /> },
    waiting_customer: { label: "Awaiting Reply", color: "secondary", icon: <User className="w-3 h-3" /> },
    waiting_staff: { label: "Needs Attention", color: "danger", icon: <AlertTriangle className="w-3 h-3" /> },
    resolved: { label: "Resolved", color: "success", icon: <CheckCircle className="w-3 h-3" /> },
    closed: { label: "Closed", color: "secondary", icon: <XCircle className="w-3 h-3" /> },
};

export default function TicketsPage() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isInternal, setIsInternal] = useState(false);
    const [sending, setSending] = useState(false);

    const isStaff = user && ['admin', 'manager'].includes(user.role);

    useEffect(() => {
        fetchTickets();
        if (isStaff) fetchUsers();
    }, [filterStatus, filterPriority]);

    const fetchTickets = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (filterPriority !== 'all') params.append('priority', filterPriority);
            
            const { data } = await axios.get(`/api/tickets?${params}`);
            if (data.success) setTickets(data.data);
        } catch (error) {
            toast.error("Failed to fetch tickets");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get("/api/users");
            if (data.success) setUsers(data.data.filter(u => ['admin', 'manager'].includes(u.role)));
        } catch (error) {
            console.error("Failed to fetch users");
        }
    };

    const fetchTicketDetail = async (id) => {
        try {
            const { data } = await axios.get(`/api/tickets/${id}`);
            if (data.success) {
                setSelectedTicket(data.data);
                setIsDetailOpen(true);
            }
        } catch (error) {
            toast.error("Failed to load ticket");
        }
    };

    const handleCreateTicket = async (values, { setSubmitting, resetForm }) => {
        try {
            const { data } = await axios.post("/api/tickets", values);
            if (data.success) {
                toast.success("Ticket created successfully");
                fetchTickets();
                setIsCreateModalOpen(false);
                resetForm();
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create ticket");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        setSending(true);
        try {
            const { data } = await axios.post(`/api/tickets/${selectedTicket._id}/reply`, {
                message: replyText,
                isInternal
            });
            if (data.success) {
                toast.success(isInternal ? "Internal note added" : "Reply sent");
                setReplyText("");
                setIsInternal(false);
                fetchTicketDetail(selectedTicket._id);
                fetchTickets();
            }
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    const handleUpdateTicket = async (updates) => {
        try {
            const { data } = await axios.put(`/api/tickets/${selectedTicket._id}`, updates);
            if (data.success) {
                toast.success("Ticket updated");
                fetchTicketDetail(selectedTicket._id);
                fetchTickets();
            }
        } catch (error) {
            toast.error("Failed to update");
        }
    };

    const filteredTickets = tickets.filter(t => 
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.ticketNumber.toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const openCount = tickets.filter(t => !['resolved', 'closed'].includes(t.status)).length;
    const urgentCount = tickets.filter(t => t.priority === 'urgent' && !['resolved', 'closed'].includes(t.status)).length;
    const needsAttentionCount = tickets.filter(t => t.status === 'waiting_staff').length;

    return (
        <ContentWrapper>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-primary)" }}>
                        <Ticket className="w-6 h-6 text-purple-600" />
                        Support Tickets
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                        {isStaff ? "Manage customer support requests" : "View and create support tickets"}
                    </p>
                </div>
                <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
                    New Ticket
                </Button>
            </div>

            {/* Stats Row */}
            {isStaff && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('all')}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{tickets.length}</p>
                                <p className="text-xs text-gray-500">Total Tickets</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('open')}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{openCount}</p>
                                <p className="text-xs text-gray-500">Open</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterStatus('waiting_staff')}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-600">{needsAttentionCount}</p>
                                <p className="text-xs text-gray-500">Needs Attention</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilterPriority('urgent')}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
                                <p className="text-xs text-gray-500">Urgent</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 outline-none dark:bg-gray-800 dark:border-gray-700"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="waiting_staff">Needs Attention</option>
                            <option value="waiting_customer">Awaiting Reply</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm"
                        >
                            <option value="all">All Priority</option>
                            <option value="urgent">🔴 Urgent</option>
                            <option value="high">🟠 High</option>
                            <option value="medium">🔵 Medium</option>
                            <option value="low">⚪ Low</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Tickets List */}
            <div className="space-y-3">
                {loading ? (
                    <Card className="p-8 text-center text-gray-500">Loading tickets...</Card>
                ) : filteredTickets.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Ticket className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No tickets found</p>
                    </Card>
                ) : (
                    filteredTickets.map((ticket) => (
                        <Card 
                            key={ticket._id} 
                            className="p-4 cursor-pointer hover:shadow-md transition-all border-l-4"
                            style={{ borderLeftColor: priorityColors[ticket.priority]?.dot.replace('bg-', '') === 'gray-400' ? '#9ca3af' : priorityColors[ticket.priority]?.text.includes('red') ? '#dc2626' : priorityColors[ticket.priority]?.text.includes('orange') ? '#ea580c' : priorityColors[ticket.priority]?.text.includes('blue') ? '#2563eb' : '#9ca3af' }}
                            onClick={() => fetchTicketDetail(ticket._id)}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
                                        <Badge variant={statusConfig[ticket.status]?.color} size="sm" className="flex items-center gap-1">
                                            {statusConfig[ticket.status]?.icon}
                                            {statusConfig[ticket.status]?.label}
                                        </Badge>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[ticket.priority]?.bg} ${priorityColors[ticket.priority]?.text}`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{ticket.subject}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">{ticket.description}</p>
                                </div>
                                <div className="text-right text-xs text-gray-400 whitespace-nowrap">
                                    <p>{new Date(ticket.updatedAt).toLocaleDateString()}</p>
                                    <p className="mt-1">{ticket.createdBy?.name || "Unknown"}</p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Create Ticket Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Ticket" size="lg">
                <Formik
                    initialValues={{ subject: "", description: "", category: "general", priority: "medium" }}
                    validationSchema={ticketSchema}
                    onSubmit={handleCreateTicket}
                >
                    {({ isSubmitting }) => (
                        <Form className="space-y-4">
                            <InputField name="subject" label="Subject" placeholder="Brief summary of your issue" />
                            <div className="grid grid-cols-2 gap-4">
                                <SelectField name="category" label="Category">
                                    <option value="general">General</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="billing">Billing</option>
                                    <option value="account">Account</option>
                                    <option value="feature_request">Feature Request</option>
                                    <option value="bug_report">Bug Report</option>
                                </SelectField>
                                <SelectField name="priority" label="Priority">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </SelectField>
                            </div>
                            <TextareaField name="description" label="Description" rows={5} placeholder="Describe your issue in detail..." />
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button type="button" variant="secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                <Button type="submit" loading={isSubmitting}>Create Ticket</Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Modal>

            {/* Ticket Detail Modal */}
            <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={selectedTicket?.ticketNumber || "Ticket"} size="4xl">
                {selectedTicket && (
                    <div className="flex flex-col h-[70vh]">
                        {/* Header */}
                        <div className="border-b dark:border-gray-700 pb-4 mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedTicket.subject}</h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <Badge variant={statusConfig[selectedTicket.status]?.color}>{statusConfig[selectedTicket.status]?.label}</Badge>
                                <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[selectedTicket.priority]?.bg} ${priorityColors[selectedTicket.priority]?.text}`}>
                                    {selectedTicket.priority} priority
                                </span>
                                <span className="text-xs text-gray-400">• Created {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                {selectedTicket.assignedTo && (
                                    <span className="text-xs text-gray-400">• Assigned to {selectedTicket.assignedTo.name}</span>
                                )}
                            </div>
                            
                            {/* Staff Controls */}
                            {isStaff && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleUpdateTicket({ status: e.target.value })}
                                        className="text-sm px-3 py-1.5 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="waiting_customer">Awaiting Reply</option>
                                        <option value="waiting_staff">Needs Attention</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                    <select
                                        value={selectedTicket.priority}
                                        onChange={(e) => handleUpdateTicket({ priority: e.target.value })}
                                        className="text-sm px-3 py-1.5 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                    <select
                                        value={selectedTicket.assignedTo?._id || ""}
                                        onChange={(e) => handleUpdateTicket({ assignedTo: e.target.value || null })}
                                        className="text-sm px-3 py-1.5 rounded-lg border dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(u => (
                                            <option key={u._id} value={u._id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Messages Thread */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {selectedTicket.messages?.map((msg, idx) => (
                                <div 
                                    key={msg._id || idx} 
                                    className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                                        msg.isInternal 
                                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' 
                                            : msg.sender?._id === user?._id 
                                                ? 'bg-purple-600 text-white' 
                                                : 'bg-gray-100 dark:bg-gray-800'
                                    }`}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-xs font-semibold ${msg.sender?._id === user?._id && !msg.isInternal ? 'text-purple-200' : 'text-gray-500'}`}>
                                                {msg.sender?.name || 'Unknown'}
                                                {msg.isInternal && <Lock className="w-3 h-3 inline ml-1" />}
                                            </span>
                                            <span className={`text-xs ${msg.sender?._id === user?._id && !msg.isInternal ? 'text-purple-200' : 'text-gray-400'}`}>
                                                {new Date(msg.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Box */}
                        {!['closed'].includes(selectedTicket.status) && (
                            <div className="border-t dark:border-gray-700 pt-4 mt-4">
                                {isStaff && (
                                    <label className="flex items-center gap-2 mb-2 text-sm">
                                        <input 
                                            type="checkbox" 
                                            checked={isInternal} 
                                            onChange={(e) => setIsInternal(e.target.checked)}
                                            className="rounded text-yellow-500"
                                        />
                                        <Lock className="w-3 h-3 text-yellow-600" />
                                        <span className="text-yellow-600">Internal Note (not visible to customer)</span>
                                    </label>
                                )}
                                <div className="flex gap-2">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder={isInternal ? "Add internal note..." : "Type your reply..."}
                                        rows={2}
                                        className="flex-1 px-4 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                    <Button 
                                        onClick={handleSendReply} 
                                        loading={sending}
                                        disabled={!replyText.trim()}
                                        icon={<Send className="w-4 h-4" />}
                                    >
                                        Send
                                    </Button>
                                </div>
                                
                                {/* User Controls - Allow users to close/resolve their own tickets */}
                                {!isStaff && !['closed', 'resolved'].includes(selectedTicket.status) && (
                                    <div className="flex gap-2 mt-3">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            icon={<CheckCircle className="w-4 h-4" />}
                                            onClick={() => handleUpdateTicket({ status: 'resolved' })}
                                        >
                                            Mark as Resolved
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            icon={<XCircle className="w-4 h-4" />}
                                            onClick={() => {
                                                if (confirm('Are you sure you want to close this ticket?')) {
                                                    handleUpdateTicket({ status: 'closed' });
                                                }
                                            }}
                                        >
                                            Close Ticket
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </ContentWrapper>
    );
}
