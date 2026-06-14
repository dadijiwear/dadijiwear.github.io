import Link from "next/link";

export const metadata = {
  title: "Shipping and Delivery Policy | Mom & Son",
  description: "Information regarding domestic courier partners, handling time, and estimated package delivery timelines.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] bg-[radial-gradient(#f1ede4_1px,transparent_1px)] [background-size:24px_24px] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#fffdfa] shadow-[0_10px_40px_rgba(40,30,10,0.04)] border border-[#f3eee3] rounded-sm p-8 sm:p-12 md:p-16 text-[#3d3830]">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-[#221f1a] sm:text-4xl font-serif">Shipping & Delivery</h1>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-[#8c8270]">
            <p><span className="font-medium text-[#5c5446]">Author:</span> Yash Patel</p>
            <span className="hidden sm:inline text-[#e6ded0]">•</span>
            <p><span className="font-medium text-[#5c5446]">Last Updated:</span> March, 2026</p>
          </div>
          <div className="mt-6 h-[1px] w-24 bg-[#e6ded0] mx-auto"></div>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-[15px] leading-relaxed">
          <p>
            We work with reliable courier partners to get your order to you safely and on time.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">1. Shipping Partners</h2>
            <p>
              We mainly ship through <strong>Delhivery</strong>, along with other trusted courier partners depending on your location.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">2. Processing & Dispatch</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Handling time:</strong> orders are checked, packed, and handed to our courier within 1 to 2 business days of payment being confirmed.</li>
              <li><strong>Tracking:</strong> once your order ships, we&apos;ll send you a tracking link by email and SMS/WhatsApp so you can follow its progress.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">3. Estimated Delivery Times</h2>
            <p>Delivery times vary a little by location:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Metro cities:</strong> usually 3 to 5 business days after dispatch.</li>
              <li><strong>Other cities and towns:</strong> usually 5 to 7 business days after dispatch.</li>
            </ul>
            <p className="text-sm text-[#8c8270] italic">
              These can shift around public holidays, bad weather, or other things outside anyone&apos;s control.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">4. Delivery Attempts & Address Issues</h2>
            <p>
              Please make sure your address, pin code and phone number are correct at checkout - we rely on these to get your order to you. Our courier will attempt delivery up to 3 times before sending the package back to us, and a redelivery charge may apply if that happens because of incorrect details.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#f1ede4] text-center flex flex-wrap justify-center gap-6 text-sm text-[#8c8270]">
          <Link href="/terms" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Terms & Conditions</Link>
          <Link href="/privacy" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Return & Refund Policy</Link>
          <Link href="/contact" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
