import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | Mom & Son",
  description: "Terms and Conditions for Mom & Son website usage and transactions.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] bg-[radial-gradient(#f1ede4_1px,transparent_1px)] [background-size:24px_24px] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#fffdfa] shadow-[0_10px_40px_rgba(40,30,10,0.04)] border border-[#f3eee3] rounded-sm p-8 sm:p-12 md:p-16 text-[#3d3830]">

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-[#221f1a] sm:text-4xl font-serif">Terms & Conditions</h1>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-[#8c8270]">
            <p><span className="font-medium text-[#5c5446]">Author:</span> Yash Patel</p>
            <span className="hidden sm:inline text-[#e6ded0]">•</span>
            <p><span className="font-medium text-[#5c5446]">Last Updated:</span> March, 2026</p>
          </div>
          <div className="mt-6 h-[1px] w-24 bg-[#e6ded0] mx-auto"></div>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-[15px] leading-relaxed">
          <p>
            Welcome to Mom & Son (momnson.co). By using this website or placing an order with us, you&apos;re agreeing to the terms below, so please take a few minutes to read through them.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">1. Eligibility</h2>
            <p>
              You should be at least 18 years old to use this website, or be browsing and shopping with the involvement of a parent or guardian.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">2. Products and Pricing</h2>
            <p>
              We do our best to keep product photos, descriptions, sizes and prices accurate. That said, small differences can happen - screens show colours slightly differently, and minor variations between fabric batches are normal.
            </p>
            <p>
              All prices on this site are in Indian Rupees (INR) and may change without notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">3. Orders</h2>
            <p>
              Placing an order doesn&apos;t automatically guarantee it will be fulfilled. Occasionally we may need to cancel an order - for example, if an item turns out to be out of stock, there&apos;s a pricing error, or we suspect the order isn&apos;t genuine.
            </p>
            <p>
              If you&apos;ve already paid for an order that gets cancelled, you&apos;ll be refunded as described in our Return & Refund Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">4. Payments</h2>
            <p>
              Payments are handled through trusted third-party payment providers. We never see or store your full card details, UPI PIN, or banking passwords - that information stays within the secure systems of our payment partner.
            </p> 
            <p>
                Consider Reading: <a href="https://razorpay.com/terms/" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">razorpay terms</a> and <a href="https://razorpay.com/privacy-policy/" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">razorpay privacy-policy</a>
            </p>
            <p>
              At checkout, you can pay using UPI, net banking, debit or credit cards, and any other methods shown on the payment page.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">5. Shipping and Delivery</h2>
            <p>
              The delivery timelines we share are estimates. Actual delivery can shift depending on your location, courier schedules, holidays, weather, and other things outside our control. Please double-check your shipping address at checkout, since we rely on it to get your order to you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">6. Returns and Refunds</h2>
            <p>
              Returns, exchanges and refunds are covered in our separate Return & Refund Policy. It&apos;s worth a read before you order, especially if you&apos;re unsure about sizing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">7. User Accounts</h2>
            <p>
              If you create an account with us, you&apos;re responsible for keeping your login details safe and for anything that happens under your account. Please make sure the information you give us is accurate and kept up to date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">8. Intellectual Property</h2>
            <p>
              The photos, descriptions, logos and overall design of this website belong to Mom & Son, unless stated otherwise, and shouldn&apos;t be copied or reused without permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">9. Prohibited Activities</h2>
            <p>While using this website, please don&apos;t:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use it for anything unlawful.</li>
              <li>Try to access parts of the site or our systems you&apos;re not meant to.</li>
              <li>Upload or spread malware or other harmful code.</li>
              <li>Do anything that disrupts how the site works for other people.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">10. Limitation of Liability</h2>
            <p>
              To the extent the law allows, Mom & Son won&apos;t be liable for indirect or consequential losses arising from your use of this website or our products.
            </p>
            <p>
              Like most online stores, we depend on a number of outside services to run - payment gateways, courier companies, cloud hosting, databases and email providers among them. If something goes wrong on their end, such as a delayed payment or a service outage, we&apos;ll do what we reasonably can to help, but we can&apos;t be held responsible for issues that originate outside our own systems.
            </p>
            <p>
              We work to keep the site running smoothly and the information on it accurate, but we can&apos;t promise it will always be available or error-free. If a claim does arise, our liability is limited to the amount you paid for the order in question.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">11. Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. If you continue using the website after a change, that means you&apos;re okay with the updated version.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">12. Contact Information</h2>
            <p>For questions regarding these Terms and Conditions, please contact:</p>
            <div className="bg-[#fcfbf9] border border-[#f3eee3] p-4 text-sm space-y-1">
              <p><strong>Business Name:</strong> Mom & Son</p>
              <p><strong>Domain:</strong> momnson.co</p>
              <p><strong>Email:</strong> wecare@momnson.co</p>
            </div>
          </section>

          <section className="space-y-3 bg-[#fbf9f4] p-5 border border-[#ece6da] rounded-sm">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#ebdcc3] pb-1">13. Website Ownership and Development</h2>
            <p className="text-sm text-[#5c5446]">
              This website was designed and built by Vidit, an independent developer, who also provides its hosting and the domain it runs on. The source code and the domain remain Vidit&apos;s property and are made available to Mom & Son under a lease arrangement - Mom & Son does not own the website, its code, or its domain.
            </p>
            <p className="text-sm text-[#5c5446]">
              Vidit isn&apos;t involved in running the store itself - he doesn&apos;t sell products, handle orders, process payments, or manage customer support. Any issue with an order, a payment, or how the store is being run is something for Mom & Son to resolve, not the developer.             </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#f1ede4] text-center flex flex-wrap justify-center gap-6 text-sm text-[#8c8270]">
          <Link href="/privacy" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Return & Refund Policy</Link>
          <Link href="/shipping" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Shipping & Delivery</Link>
          <Link href="/contact" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
