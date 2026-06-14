import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Mom & Son",
  description: "Privacy Policy for Mom & Son detailing how personal user data is processed.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] bg-[radial-gradient(#f1ede4_1px,transparent_1px)] [background-size:24px_24px] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#fffdfa] shadow-[0_10px_40px_rgba(40,30,10,0.04)] border border-[#f3eee3] rounded-sm p-8 sm:p-12 md:p-16 text-[#3d3830]">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-[#221f1a] sm:text-4xl font-serif">Privacy Policy</h1>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-[#8c8270]">
            <p><span className="font-medium text-[#5c5446]">Author:</span> Yash Patel</p>
            <span className="hidden sm:inline text-[#e6ded0]">•</span>
            <p><span className="font-medium text-[#5c5446]">Last Updated:</span> March, 2026</p>
          </div>
          <div className="mt-6 h-[1px] w-24 bg-[#e6ded0] mx-auto"></div>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-[15px] leading-relaxed">
          <p>
            Mom & Son (momnson.co) cares about your privacy. This page explains what information we collect when you use our website, how we use it, and how we look after it.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">1. Information We Collect</h2>
            <p>When you browse or shop with us, we collect a few different types of information:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Your details:</strong> name, shipping and billing address, phone number, and email address.</li>
              <li><strong>Order details:</strong> what you&apos;ve bought, your order numbers, and order totals.</li>
              <li><strong>Technical details:</strong> your IP address, browser type, and how you interact with the site, which helps us keep things running smoothly.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">2. How We Use Your Data</h2>
            <p>We use this information to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Create and manage your account.</li>
              <li>Process your orders and payments.</li>
              <li>Share your delivery details with our courier partners so your order reaches you.</li>
              <li>Send order updates and confirmations, and respond to anything you write to us about.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">3. Payment Information Security</h2>
            <p>
              All payments are handled by our payment gateway partner. We don&apos;t see or store your full card number, UPI PIN, or net banking password - those details are handled securely by the payment provider, not by us.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">4. Third-Party Sharing</h2>
            <p>
              We don&apos;t sell or rent your information to advertisers. We only share what&apos;s necessary with the services that help us run the store - our courier partners for delivery, our payment gateway for processing payments, and our hosting and database providers who store the site&apos;s data securely.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">5. Cookies and Tracking</h2>
            <p>
              We use a small number of cookies to keep your cart working, remember that you&apos;re logged in, and understand how people use the site. You&apos;re free to turn cookies off in your browser, but doing so may stop your cart and checkout from working properly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">6. Contact Information</h2>
            <p>If you have any questions about this policy or how your data is handled, you can reach us at:</p>
            <div className="bg-[#fcfbf9] border border-[#f3eee3] p-4 text-sm space-y-1">
              <p><strong>Business Name:</strong> Mom & Son</p>
              <p><strong>Domain:</strong> momnson.co</p>
              <p><strong>Email:</strong> wecare@momnson.co</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#f1ede4] text-center flex flex-wrap justify-center gap-6 text-sm text-[#8c8270]">
          <Link href="/terms" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Terms & Conditions</Link>
          <Link href="/refund" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Return & Refund Policy</Link>
          <Link href="/shipping" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Shipping & Delivery</Link>
          <Link href="/contact" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
