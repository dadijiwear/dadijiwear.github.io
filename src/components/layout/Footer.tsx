"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ShieldCheck, FileText, ExternalLink, MapPin, Phone, MessageCircle, GitCommit, Clock, Truck, RefreshCcw, Headset } from "lucide-react";
import { FooterWavyDivider } from "@/components/ui/FooterWavyDivider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentYear = systemTime.getFullYear();
  const lastUpdate = process.env.NEXT_PUBLIC_LAST_UPDATE || "Fetching updates...";
  
  const formattedTime = systemTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  
  const formattedDate = systemTime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <>
      <div className="w-full mt-16 leading-[0] -mb-[1px] relative z-20">
        <FooterWavyDivider />
      </div>
      <footer className="w-full bg-dadi-green text-dadi-cream flex flex-col relative">
        <div className="container mx-auto px-4 md:px-8 pt-16 pb-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 pb-12 border-b border-white/10">
            
            <div className="space-y-5">
              <h3 className="font-serif text-3xl text-white tracking-wide flex items-center gap-2">
                Mom & Son
              </h3>
              <p className="text-sm opacity-85 leading-relaxed pr-4">
                Premium handcrafted kidswear crafted with passion, tradition, and timeless style. 21 years of experience bringing soft, skin-friendly fabrics to life.
              </p>
              <div className="flex items-center gap-3 pt-4 text-white">
                <Image alt="National Emblem" className="opacity-90" height={32} src="/assets/Emblem-of-India.svg" width={20}/>
                <Image alt="Indian Flag" className="rounded-sm shadow-sm" height={24} src="/assets/IndianFlag.svg" width={36}/>
                <span className="text-sm font-medium tracking-wide">Proudly made in Bharath</span>
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="font-serif text-xl text-white font-medium tracking-wide">Quick Links</h4>
              <ul className="space-y-3 text-sm opacity-90">
                <li>
                  <Link className="hover:text-dadi-gold transition flex items-center gap-2" href="/">Home</Link>
                </li>
                <li>
                  <Link className="hover:text-dadi-gold transition flex items-center gap-2" href="/shop/boys">Boys Collection</Link>
                </li>
                <li>
                  <Link className="hover:text-dadi-gold transition flex items-center gap-2" href="/shop/girls">Girls Collection</Link>
                </li>
                <li>
                  <Link className="hover:text-dadi-gold transition flex items-center gap-2" href="/shop/summer">Summer Season</Link>
                </li>
                <li>
                  <Link className="hover:text-dadi-gold transition flex items-center gap-2" href="/about">Our Story</Link>
                </li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="font-serif text-xl text-white font-medium tracking-wide">Legal</h4>
              <ul className="space-y-3 text-sm opacity-90">
                <li>
                  <Link className="flex items-center gap-2 hover:text-dadi-gold transition" href="/terms">
                    <FileText size={16}/>
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link className="flex items-center gap-2 hover:text-dadi-gold transition" href="/privacy">
                    <ShieldCheck size={16}/>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link className="flex items-center gap-2 hover:text-dadi-gold transition" href="/refund">
                    <RefreshCcw size={16}/>
                    Return, Refund and Cancellation Policy
                  </Link>
                </li>
                <li>
                  <Link className="flex items-center gap-2 hover:text-dadi-gold transition" href="/shipping">
                    <Truck size={16}/>
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link className="flex items-center gap-2 hover:text-dadi-gold transition" href="/grievance">
                    <Headset size={16}/>
                    Contact Us / Grievance Page
                  </Link>
                </li>

                <li>
                  <Link className="flex items-center gap-2 hover:text-dadi-gold transition" href="/sitemap">
                    <ExternalLink size={16}/>
                    Site Map
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="font-serif text-xl text-white font-medium tracking-wide">Connect & Contact</h4>
              <ul className="space-y-3.5 text-sm opacity-90">
                <li>
                  <a href="https://maps.google.com/?q=Gandhinagar,Gujarat,India,382421" target="_blank" rel="noreferrer" className="flex items-start gap-3 hover:text-dadi-gold transition group">
                    <MapPin className="mt-0.5 group-hover:scale-110 transition-transform shrink-0" size={18}/>
                    <span className="leading-snug">Gandhinagar, Gujarat,<br/>India - 382421</span>
                  </a>
                </li>
                <li>
                  <a href="mailto:support@dadijwears.com" className="flex items-center gap-3 hover:text-dadi-gold transition group">
                    <Mail className="group-hover:scale-110 transition-transform shrink-0" size={18}/>
                    <span>wecare@momnson.co</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+919876543210" className="flex items-center gap-3 hover:text-dadi-gold transition group">
                    <Phone className="group-hover:scale-110 transition-transform shrink-0" size={18}/>
                    <span>+91 98765 43210</span>
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-dadi-gold transition group">
                    <MessageCircle className="group-hover:scale-110 transition-transform shrink-0" size={18}/>
                    <span>WhatsApp Support</span>
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-dadi-gold transition group">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={18}
                      height={18}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:scale-110 transition-transform shrink-0"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                    <span>Follow us on Instagram</span>
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-xs opacity-80">
            
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left order-2 lg:order-1">
              <p>© {currentYear} momnson.co - All rights reserved.</p>
              {mounted && (
                <div className="flex items-center gap-4">
                  <p className="flex items-center gap-1.5" suppressHydrationWarning>
                    <Clock className="text-dadi-gold" size={18}/>
                    Current Time: {formattedDate} : {formattedTime}
                  </p>
                  <p className="flex items-center gap-1.5 text-white/60">
                    <GitCommit className="text-dadi-gold" size={20}/>
                    Last Update: {lastUpdate}
                  </p>
                  {/* Theme Toggle Added Here */}
                  <div className="flex items-center pl-2 border-l border-white/20">
                    <ThemeToggle />
                  </div>
                </div>
              )}
            </div>

            <div className="img-shine group relative flex items-center justify-center bg-white/5 px-6 py-2.5 rounded-full border border-white/10 order-1 lg:order-2 hover:bg-white/10 hover:border-dadi-gold/30 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)] transition-all duration-500 transform hover:-translate-y-0.5 text-[17px]">
              <span className="mr-2 text-white/70 font-light select-none transition-colors duration-300 group-hover:text-white/90">
              Built by
              </span>
              <a 
                href="https://www.vidit.me" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-dadi-gold font-semibold inline-flex items-center gap-1.5 outline-none"
              >
              <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-dadi-gold after:transition-all after:duration-300 group-hover:after:w-full">
                Vidit Pandya
              </span>
              <ExternalLink 
                size={18} 
                className="text-dadi-gold/70 transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-dadi-gold"
              />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
