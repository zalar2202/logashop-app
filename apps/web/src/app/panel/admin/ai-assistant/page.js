"use client";

import { useEffect, useState } from "react";
import { ContentWrapper } from "@/components/layout/ContentWrapper";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/forms/InputField";
import { SelectField } from "@/components/forms/SelectField";
import { Formik, Form } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";
import axios from "axios";
import { Bot, Save, Globe, Eye, MessageSquare, Sparkles } from "lucide-react";

const aiSchema = Yup.object().shape({
    webhookUrl: Yup.string().url("Must be a valid URL").required("Webhook URL is required"),
    title: Yup.string().required("Title is required"),
    welcomeMessage: Yup.string().required("Welcome message is required"),
    primaryColor: Yup.string().required("Primary color is required"),
});

export default function AIAssistantAdmin() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get("/api/admin/ai-assistant");
                if (data.success && data.data) {
                    setSettings(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch AI settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const { data } = await axios.post("/api/admin/ai-assistant", values);
            if (data.success) {
                toast.success("AI Assistant settings updated successfully");
                setSettings(data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update settings");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ContentWrapper>
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-1/4"></div>
                    <Card className="h-96"></Card>
                </div>
            </ContentWrapper>
        );
    }

    return (
        <ContentWrapper>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "var(--color-text-primary)" }}>
                            <Bot className="w-8 h-8 text-indigo-600" />
                            AI Live Support Assistant
                        </h1>
                        <p className="text-[var(--color-text-secondary)] mt-1">
                            Connect your n8n automation and customize the floating chat widget.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="secondary" icon={<Globe className="w-4 h-4" />} onClick={() => window.open('/', '_blank')}>
                            View Website
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card className="p-8">
                            <Formik
                                initialValues={settings || {
                                    webhookUrl: "",
                                    title: "Loga AI Assistant",
                                    welcomeMessage: "Hello! How can I help you today?",
                                    primaryColor: "#32127a",
                                    isActive: true,
                                    position: "bottom-right",
                                    buttonIcon: "bot"
                                }}
                                validationSchema={aiSchema}
                                onSubmit={handleSubmit}
                                enableReinitialize
                            >
                                {({ isSubmitting, values, setFieldValue }) => (
                                    <Form className="space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Connection Settings</h3>
                                            <InputField 
                                                name="webhookUrl" 
                                                label="n8n Webhook URL" 
                                                placeholder="https://n8n.yourdomain.com/webhook/..." 
                                                helperText="The endpoint where chat messages will be sent."
                                            />
                                            
                                            <div className="flex items-center gap-4 py-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={values.isActive}
                                                        onChange={(e) => setFieldValue('isActive', e.target.checked)}
                                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm font-medium">Enable AI Assistant on Website</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <h3 className="text-lg font-semibold border-b pb-2 mb-4">Visual Appearance</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <InputField name="title" label="Assistant Name" placeholder="Loga Support" />
                                                <div className="space-y-1">
                                                    <label className="text-sm font-medium">Primary Color</label>
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="color" 
                                                            value={values.primaryColor}
                                                            onChange={(e) => setFieldValue('primaryColor', e.target.value)}
                                                            className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                                                        />
                                                        <input 
                                                            type="text"
                                                            value={values.primaryColor}
                                                            onChange={(e) => setFieldValue('primaryColor', e.target.value)}
                                                            className="flex-1 px-3 py-2 text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <InputField name="welcomeMessage" label="Initial Welcome Message" placeholder="Ask me anything about our services!" />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <SelectField name="position" label="Widget Position">
                                                    <option value="bottom-right">Bottom Right</option>
                                                    <option value="bottom-left">Bottom Left</option>
                                                </SelectField>
                                                <SelectField name="buttonIcon" label="Launcher Icon">
                                                    <option value="bot">AI Bot</option>
                                                    <option value="message">Message Bubble</option>
                                                    <option value="spark">Sparkles</option>
                                                </SelectField>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t flex justify-end">
                                            <Button type="submit" loading={isSubmitting} icon={<Save className="w-4 h-4" />}>
                                                Save Settings
                                            </Button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-indigo-500" />
                                Preview
                            </h3>
                            <div className="bg-gray-100 dark:bg-gray-900 rounded-3xl p-6 border-4 border-gray-200 dark:border-gray-800 relative aspect-[9/16] shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-white dark:bg-gray-950">
                                    {/* Mock Header */}
                                    <div className="h-14 bg-indigo-900 border-b border-white/10 flex items-center px-4">
                                        <div className="w-8 h-2 bg-white/20 rounded"></div>
                                        <div className="flex-1"></div>
                                        <div className="w-8 h-8 rounded-full bg-white/10"></div>
                                    </div>
                                    
                                    {/* Mock Content */}
                                    <div className="p-4 space-y-4">
                                        <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                                        <div className="w-1/2 h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                                        <div className="grid grid-cols-2 gap-2 mt-8">
                                            <div className="h-20 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"></div>
                                            <div className="h-20 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800"></div>
                                        </div>
                                    </div>

                                    {/* Mock Floating Widget */}
                                    <div className={`absolute bottom-6 ${'right-6'} transition-all`}>
                                        <div className="mb-3 bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/30 max-w-[200px] animate-fade-in-up">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">Support Assistant</p>
                                            <p className="text-xs text-gray-700 dark:text-gray-300">"How can I help you today?"</p>
                                        </div>
                                        <div 
                                            className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform"
                                            style={{ background: 'linear-gradient(135deg, #32127a 0%, #7c3aed 100%)' }}
                                        >
                                            <Bot className="w-7 h-7 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-center text-gray-400 mt-4 italic">Device mockup for visualization only</p>
                        </div>
                    </div>
                </div>
            </div>
        </ContentWrapper>
    );
}
