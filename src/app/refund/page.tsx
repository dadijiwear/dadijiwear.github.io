import Link from "next/link";

export const metadata = {
  title: "Return and Refund Policy | Mom & Son",
  description: "Guidelines regarding order cancellations, product returns, and refund processing timelines.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] bg-[radial-gradient(#f1ede4_1px,transparent_1px)] [background-size:24px_24px] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#fffdfa] shadow-[0_10px_40px_rgba(40,30,10,0.04)] border border-[#f3eee3] rounded-sm p-8 sm:p-12 md:p-16 text-[#3d3830]">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-[#221f1a] sm:text-4xl font-serif">Return & Refund Policy</h1>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-[#8c8270]">
            <p><span className="font-medium text-[#5c5446]">Author:</span> Mom & Son Fulfillment</p>
            <span className="hidden sm:inline text-[#e6ded0]">•</span>
            <p><span className="font-medium text-[#5c5446]">Last Updated:</span> June 07, 2026</p>
          </div>
          <div className="mt-6 h-[1px] w-24 bg-[#e6ded0] mx-auto"></div>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-[15px] leading-relaxed">
          <p>
            At Mom & Son, we take immense pride in the quality of our products. If you are not completely satisfied with your purchase, we are here to assist you through our return and cancellation framework.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">1. Order Cancellations</h2>
            <p>
              You may request an order cancellation within <strong>2 hours</strong> of placing it, provided the package has not yet been processed or handed over to our courier partner. 
            </p>
            <p>
              Once a package is shipped or a tracking ID has been generated, the order can no longer be cancelled. To cancel an eligible order, please email us directly at <span className="font-medium text-[#221f1a]">wecare@momnson.co</span>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">2. Returns & Window Period</h2>
            <p>
              We offer a <strong>7-day return window</strong> from the date your package is marked as delivered by the courier network. To qualify for a return:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The item must be unused, unwashed, and in its original pristine condition.</li>
              <li>All original packaging, tags, invoices, and inserts must be intact.</li>
              <li>Items showing signs of wear, makeup stains, or washing will be sent back to the customer and will not be eligible for a refund.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">3. Damaged or Defective Items</h2>
            <p>
              In the rare event that you receive a damaged, broken, or incorrect product, please notify us within <strong>48 hours</strong> of delivery. We highly recommend recording a quick unboxing video when opening your package to help us fast-track your claims with our courier handlers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">4. Refund Processing</h2>
            <p>
              Once your return package arrives back at our warehouse and undergoes manual quality inspection, we will notify you of approval or rejection.
            </p>
            <p>
              Approved returns are processed back to your original payment method (UPI, Netbanking, or Debit/Credit Card) within <strong>5 to 7 business days</strong>. Please note that banking institutions may take additional time to reflect the balance in your account.
            </p>
          </section>

          <section className="space-y-3 bg-[#fbf9f4] p-5 border border-[#ece6da] rounded-sm">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#ebdcc3] pb-1">5. Technical Performance Disclaimer</h2>
            <p className="text-sm text-[#5c5446]">
              This policy covers the physical and financial execution of product returns managed directly by Mom & Son. The third-party independent software developer who constructed this website does not process inventory, hold client monetary accounts, or possess clearance to execute bank transfers. 
            </p>
            <p className="text-sm text-[#5c5446]">
              Any software bugs, UI rendering issues, or server script timeouts encountered during a refund request submission are not grounds for legal recourse against the technical developer. All payment resolutions are exclusively handled by Mom & Son operational support.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#f1ede4] text-center flex justify-center gap-6 text-sm text-[#8c8270]">
          <Link href="/shipping" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Shipping Info</Link>
          <Link href="/terms" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
