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
            <p><span className="font-medium text-[#5c5446]">Author:</span> Mom & Son Logistics</p>
            <span className="hidden sm:inline text-[#e6ded0]">•</span>
            <p><span className="font-medium text-[#5c5446]">Last Updated:</span> June 07, 2026</p>
          </div>
          <div className="mt-6 h-[1px] w-24 bg-[#e6ded0] mx-auto"></div>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-[15px] leading-relaxed">
          <p>
            Mom & Son partners with trusted national logistics networks to ensure your items arrive safely, securely, and wrapped in premium care.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">1. Shipping Partners</h2>
            <p>
              To provide the most optimal tracking service and regional speed, we dispatch our parcels using premium domestic fulfillment networks, primarily including <strong>Delhivery</strong> along with other authorized tier-one express courier networks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">2. Processing & Dispatch Timelines</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Handling Time:</strong> Orders are verified, securely packed, and assigned to couriers within 1 to 2 business days from the moment of successful payment authorization.</li>
              <li><strong>Dispatch Alerts:</strong> As soon as your order leaves our hub, an automated notification containing tracking links and courier allocation metrics will be transmitted to your registered email address and phone number.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">3. Estimated Delivery Times</h2>
            <p>
              While deep regional transits vary depending on external logistical load, the standard shipping windows are as follows:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Metro Areas:</strong> 3 to 5 business days post-dispatch.</li>
              <li><strong>Rest of India / Tier-2 & Tier-3 Cities:</strong> 5 to 7 business days post-dispatch.</li>
            </ul>
            <p className="text-sm text-[#8c8270] italic">
              Please note: Delays may occasionally manifest due to national holidays, severe regional weather patterns, or local administrative disruptions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">4. Delivery Failures & Incorrect Address Inputs</h2>
            <p>
              Customers are solely responsible for ensuring that their pin codes, contact numbers, and complete addresses are input correctly during checkout. Our courier service attempts delivery up to 3 times before returning the product to our warehouse. Redelivery fees may apply if the package is returned due to incorrect or unreachable contact credentials.
            </p>
          </section>

          <section className="space-y-3 bg-[#fbf9f4] p-5 border border-[#ece6da] rounded-sm">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#ebdcc3] pb-1">5. Technical Infrastructure Limitations</h2>
            <p className="text-sm text-[#5c5446]">
              Tracking codes, webhook callbacks, and route estimations rely directly on external tracking APIs provided by Delhivery or other shipping services. The independent technical developer of this web interface does not regulate courier tracking databases or route update servers. 
            </p>
            <p className="text-sm text-[#5c5446]">
              Any data synchronization lags, broken package status links, or temporary webhook delays are outside the developer&apos;s codebase jurisdiction and will not constitute technical liability.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#f1ede4] text-center flex justify-center gap-6 text-sm text-[#8c8270]">
          <Link href="/refund" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Return Policy</Link>
          <Link href="/contact" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
