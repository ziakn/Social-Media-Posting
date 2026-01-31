"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { submitContactAction } from "@/app/actions/contact/contactActions";

export default function ContactPage() {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await submitContactAction(formData);

            if (data.success) {
                setSubmitted(true);
                toast.success(data.message || "Message sent successfully!");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } else {
                toast.error(data.error || "Failed to send message.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-white min-h-screen font-inter text-[#3E4652]">
            {/* 🚀 Hero Section */}
            <section className="pt-32 pb-24 bg-[#0C1B33] text-white relative overflow-hidden text-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3B82F6]/10 blur-[100px] pointer-events-none" />
                <div className="container mx-auto px-6 max-w-[1280px] relative z-10 space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
                        <div className="w-2 h-2 rounded-full bg-[#F9C80E] animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white font-inter">Contact Support</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold font-plus-jakarta uppercase tracking-tighter leading-none mx-auto max-w-4xl">
                        Get in <span className="text-[#3B82F6]">Touch.</span>
                    </h1>
                    <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Have a question or looking for a custom solution? Our team is here to help you scale your social media presence.
                    </p>
                </div>
            </section>

            {/* 📬 Contact Form Section */}
            <section className="py-24">
                <div className="container mx-auto px-6 max-w-[1280px]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                        {/* Contact Info */}
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-black text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">Contact Information</h2>
                                <p className="text-lg text-slate-500 font-medium">
                                    Our dedicated support team is available to assist you with any inquiries. We typically respond within 24 hours.
                                </p>
                            </div>

                            <div className="grid gap-8">
                                <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-[10px] border border-slate-100 hover:border-[#3B82F6] transition-all group">
                                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#3B82F6] shadow-sm group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-colors flex-shrink-0">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-[#0C1B33] uppercase tracking-tight text-sm">Email Us</h4>
                                        <p className="text-slate-500 font-medium">support@socialhub.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-[10px] border border-slate-100 hover:border-[#3B82F6] transition-all group">
                                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#3B82F6] shadow-sm group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-colors flex-shrink-0">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-[#0C1B33] uppercase tracking-tight text-sm">Call Us</h4>
                                        <p className="text-slate-500 font-medium">+1 (555) 000-0000</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-[10px] border border-slate-100 hover:border-[#3B82F6] transition-all group">
                                    <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-[#3B82F6] shadow-sm group-hover:bg-[#0C1B33] group-hover:text-[#F9C80E] transition-colors flex-shrink-0">
                                        <MapPin className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-extrabold text-[#0C1B33] uppercase tracking-tight text-sm">Our Office</h4>
                                        <p className="text-slate-500 font-medium">123 Tech Lane, Silicon Valley, CA</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="bg-white p-8 md:p-12 rounded-[10px] shadow-2xl border border-slate-100">
                            {submitted ? (
                                <div className="text-center space-y-6 py-12">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <h3 className="text-2xl font-black text-[#0C1B33] font-plus-jakarta uppercase tracking-tight">Message Sent!</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                        Thank you for reaching out. A member of our team will get back to you shortly.
                                    </p>
                                    <Button
                                        onClick={() => setSubmitted(false)}
                                        className="bg-[#0C1B33] text-white hover:bg-[#3B82F6] transition-all font-black uppercase tracking-widest px-8"
                                    >
                                        Send Another Message
                                    </Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500">Your Name</Label>
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                required
                                                className="h-12 border-slate-200 focus:border-[#3B82F6] focus:ring-0 transition-all"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-500">Email Address</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                required
                                                className="h-12 border-slate-200 focus:border-[#3B82F6] focus:ring-0 transition-all"
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject" className="text-xs font-black uppercase tracking-widest text-slate-500">Subject</Label>
                                        <Input
                                            id="subject"
                                            placeholder="How can we help?"
                                            required
                                            className="h-12 border-slate-200 focus:border-[#3B82F6] focus:ring-0 transition-all"
                                            value={formData.subject}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="message" className="text-xs font-black uppercase tracking-widest text-slate-500">Message</Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Tell us more about your needs..."
                                            required
                                            className="min-h-[150px] border-slate-200 focus:border-[#3B82F6] focus:ring-0 transition-all resize-none"
                                            value={formData.message}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#F9C80E] text-[#0C1B33] hover:bg-[#eac00d] h-16 rounded-[6px] font-black uppercase tracking-widest text-lg transition-all shadow-subtle hover:-translate-y-1"
                                    >
                                        {loading ? "Sending..." : (
                                            <>
                                                Send Message <Send className="ml-2 h-5 w-5" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
