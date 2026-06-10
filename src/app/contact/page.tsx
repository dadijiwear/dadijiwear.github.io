"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MapPin, Phone, Mail, Clock, Send, Camera, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1000);
  };

  return (
    <div className="bg-dadi-cream min-h-screen">

      {/* Hero */}
      <section className="relative bg-dadi-green text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-dadi-gold rounded-full mix-blend-multiply filter blur-[100px] transform -translate-x-1/3 -translate-y-1/3"></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 py-20 md:py-24 text-center relative z-10">
          <span className="text-dadi-gold text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">Get In Touch</span>
          <h1 className="text-4xl md:text-5xl font-serif mb-4">We&apos;d Love to <span className="text-dadi-gold italic">Hear</span> From You</h1>
          <p className="text-white/70 max-w-xl mx-auto">Have questions, feedback, or just want to say hi? We&apos;re here to help!</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row gap-10 max-w-6xl mx-auto">

            {/* Contact Form */}
            <div className="lg:w-3/5">
              <div className="bg-card rounded-2xl shadow-sm border border-border-custom p-8">
                <h2 className="text-2xl font-serif text-dadi-green-dark dark:text-dadi-gold mb-6">Send Us a Message</h2>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Send size={32} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-serif text-foreground mb-2">Message Sent!</h3>
                    <p className="text-muted-custom mb-6">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                    <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1.5">Your Name</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className="w-full p-3 border border-border-custom bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-dadi-green/40 focus:border-dadi-green transition text-foreground placeholder:text-muted-custom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="w-full p-3 border border-border-custom bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-dadi-green/40 focus:border-dadi-green transition text-foreground placeholder:text-muted-custom"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Subject</label>
                      <select
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full p-3 border border-border-custom bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-dadi-green/40 focus:border-dadi-green transition text-foreground"
                      >
                        <option value="" className="bg-card">Select a topic</option>
                        <option value="general" className="bg-card">General Inquiry</option>
                        <option value="order" className="bg-card">Order Related</option>
                        <option value="product" className="bg-card">Product Information</option>
                        <option value="returns" className="bg-card">Returns & Exchange</option>
                        <option value="wholesale" className="bg-card">Wholesale / Business</option>
                        <option value="other" className="bg-card">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Your Message</label>
                      <textarea
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Tell us how we can help you..."
                        className="w-full p-3 border border-border-custom bg-card rounded-lg focus:outline-none focus:ring-2 focus:ring-dadi-green/40 focus:border-dadi-green transition resize-none text-foreground placeholder:text-muted-custom"
                      />
                    </div>

                    <Button type="submit" variant="secondary" className="w-full py-3 rounded-xl text-base font-semibold gap-2" disabled={loading}>
                      {loading ? "Sending..." : (
                        <><Send size={18} /> Send Message</>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Info Sidebar */}
            <div className="lg:w-2/5 space-y-6">
              {/* Info Card */}
              <div className="bg-card rounded-2xl shadow-sm border border-border-custom p-8 space-y-6">
                <h2 className="text-xl font-serif text-dadi-green-dark dark:text-dadi-gold">Contact Information</h2>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-dadi-green/10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin size={20} className="text-dadi-green dark:text-dadi-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Our Address</h4>
                    <p className="text-muted-custom text-sm mt-0.5">Shop No. 42, Textile Market,<br />Chandni Chowk, New Delhi - 110006</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-dadi-green/10 rounded-lg flex items-center justify-center shrink-0">
                    <Phone size={20} className="text-dadi-green dark:text-dadi-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Phone</h4>
                    <p className="text-muted-custom text-sm mt-0.5">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-dadi-green/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail size={20} className="text-dadi-green dark:text-dadi-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Email</h4>
                    <p className="text-muted-custom text-sm mt-0.5">hello@dadijwears.com<br />support@dadijwears.com</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-dadi-green/10 rounded-lg flex items-center justify-center shrink-0">
                    <Clock size={20} className="text-dadi-green dark:text-dadi-gold" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">Working Hours</h4>
                    <p className="text-muted-custom text-sm mt-0.5">Mon - Sat: 10:00 AM - 8:00 PM<br />Sunday: 11:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-dadi-green rounded-2xl p-8 text-white">
                <h3 className="font-serif text-lg mb-4">Connect With Us</h3>
                <p className="text-white/70 text-sm mb-6">Follow us on social media for latest collections, deals, and behind-the-scenes content.</p>
                <div className="flex gap-3">
                  <a href="https://instagram.com/dadijwears" target="_blank" rel="noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition">
                    <Camera size={20} />
                  </a>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer"
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition">
                    <MessageCircle size={20} />
                  </a>
                  <a href="mailto:hello@dadijwears.com"
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition">
                    <Mail size={20} />
                  </a>
                </div>
              </div>


            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
