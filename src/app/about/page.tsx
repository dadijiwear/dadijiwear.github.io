"use client";

import { Heart, Award, Users, Star, Scissors, ShieldCheck, Droplets, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AboutPage() {
  return (
    <div className="bg-dadi-cream min-h-screen">

      {/* Hero Banner */}
      <section className="relative bg-dadi-green text-white overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[350px] h-[350px] border border-dadi-gold/10 rounded-full spin-slow pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] border border-white/5 rounded-full spin-slow pointer-events-none" style={{ animationDirection: 'reverse' }}></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-dadi-gold rounded-full mix-blend-multiply filter blur-[120px] transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-dadi-red rounded-full mix-blend-multiply filter blur-[100px] transform -translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="container mx-auto px-4 md:px-8 py-20 md:py-28 text-center relative z-10 fade-in-up">
          <span className="text-dadi-gold text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">Est. 2005 • Premium Kidswear</span>
          <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
            Our Story of Love,<br /> Craft & <span className="text-dadi-gold italic">Tradition</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            For over 21 years, Dadijwears has been weaving comfort, quality, and 
            love into every garment — just like a grandmother&apos;s warm embrace.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-card img-shine">
                  <img
                    src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80"
                    alt="Craftsmanship at Dadijwears"
                    className="w-full h-[400px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-dadi-gold text-dadi-green rounded-xl px-6 py-4 shadow-lg font-serif text-lg font-bold pulse-glow">
                  21+ Years ✦
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif text-dadi-green-dark dark:text-dadi-gold">
                The Heart Behind <span className="text-dadi-gold">Dadijwears</span>
              </h2>
              <div className="w-16 h-0.5 bg-dadi-gold"></div>
              <p className="text-muted-foreground leading-relaxed">
                Dadijwears was born from a simple belief — every child deserves clothing that feels as warm 
                and comforting as a grandmother&apos;s love. Founded by a family of textile artisans with over 
                two decades of expertise, we set out to create kidswear that parents can trust and children 
                love to wear.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our journey began in a small workshop where Dadi ji herself would carefully select fabrics, 
                checking each one for softness and safety. Today, that same dedication runs through everything 
                we do — from handpicking 100% organic cotton to employing traditional block-printing techniques 
                passed down through generations.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every stitch at Dadijwears carries forward a legacy of quality craftsmanship, sustainable 
                practices, and an unwavering commitment to making your little ones look and feel their absolute best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 bg-background border-y border-border-custom">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-serif text-dadi-green-dark dark:text-dadi-gold mb-4">Our Mission & Values</h2>
          <p className="text-muted-custom max-w-xl mx-auto mb-14">The pillars that guide everything we create</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto stagger-children">
            <div className="bg-card rounded-2xl p-8 border border-border-custom hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 bg-dadi-green/10 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:-translate-y-1 transition-transform">
                <Heart size={28} className="text-dadi-red" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">Made with Love</h3>
              <p className="text-muted-custom text-sm leading-relaxed">Every garment is crafted with the same love and care that Dadi ji puts into everything she does for her grandchildren.</p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border-custom hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 bg-dadi-green/10 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:-translate-y-1 transition-transform">
                <Droplets size={28} className="text-dadi-blue" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">Pure Comfort</h3>
              <p className="text-muted-custom text-sm leading-relaxed">Only the softest, skin-friendly fabrics make the cut. Because your child&apos;s comfort is our top priority.</p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border-custom hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 bg-dadi-green/10 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:-translate-y-1 transition-transform">
                <Award size={28} className="text-dadi-gold" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">Premium Quality</h3>
              <p className="text-muted-custom text-sm leading-relaxed">21 years of expertise ensures that every stitch, print, and finish meets the highest standards of quality.</p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border-custom hover:shadow-lg transition-shadow group">
              <div className="w-16 h-16 bg-dadi-green/10 rounded-full flex items-center justify-center mx-auto mb-5 group-hover:-translate-y-1 transition-transform">
                <ShieldCheck size={28} className="text-dadi-green" />
              </div>
              <h3 className="font-serif text-lg text-foreground mb-2">Safe & Trusted</h3>
              <p className="text-muted-custom text-sm leading-relaxed">All our fabrics are tested for safety and are free from harmful chemicals. Parent-approved, child-tested.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-dadi-green-dark text-center mb-14">
              Why Parents Choose <span className="text-dadi-gold">Dadijwears</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
              <div className="flex gap-4 p-6 bg-card rounded-xl border border-border-custom hover:border-dadi-green/30 transition">
                <div className="w-12 h-12 bg-dadi-green/10 rounded-lg flex items-center justify-center shrink-0">
                  <Scissors size={24} className="text-dadi-green dark:text-dadi-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Expert Craftsmanship</h4>
                  <p className="text-muted-custom text-sm">Skilled artisans with decades of experience create each piece with precision and attention to detail.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-card rounded-xl border border-border-custom hover:border-dadi-green/30 transition">
                <div className="w-12 h-12 bg-dadi-green/10 rounded-lg flex items-center justify-center shrink-0">
                  <Star size={24} className="text-dadi-gold" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">5-Star Customer Love</h4>
                  <p className="text-muted-custom text-sm">Thousands of happy parents trust us with their kidswear needs. Our reviews speak for themselves.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-card rounded-xl border border-border-custom hover:border-dadi-green/30 transition">
                <div className="w-12 h-12 bg-dadi-green/10 rounded-lg flex items-center justify-center shrink-0">
                  <Users size={24} className="text-dadi-red" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Family-Run Business</h4>
                  <p className="text-muted-custom text-sm">We&apos;re not a faceless corporation. We&apos;re a family that understands what families need.</p>
                </div>
              </div>

              <div className="flex gap-4 p-6 bg-card rounded-xl border border-border-custom hover:border-dadi-green/30 transition">
                <div className="w-12 h-12 bg-dadi-green/10 rounded-lg flex items-center justify-center shrink-0">
                  <Clock size={24} className="text-dadi-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Timeless Designs</h4>
                  <p className="text-muted-custom text-sm">Our designs blend traditional Indian aesthetics with modern trends, creating timeless pieces for your children.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-dadi-green text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif text-white mb-4">Ready to Experience the Difference?</h2>
          <p className="text-white/70 mb-8 max-w-lg mx-auto">Browse our curated collection of premium kidswear and give your child the comfort they deserve.</p>
          <Link href="/shop">
            <Button variant="primary" size="lg" className="rounded-full px-10">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
