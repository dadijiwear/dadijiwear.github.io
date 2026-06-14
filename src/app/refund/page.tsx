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
            <p><span className="font-medium text-[#5c5446]">Author:</span> Yash Patel</p>
            <span className="hidden sm:inline text-[#e6ded0]">•</span>
            <p><span className="font-medium text-[#5c5446]">Last Updated:</span> March, 2026</p>
          </div>
          <div className="mt-6 h-[1px] w-24 bg-[#e6ded0] mx-auto"></div>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-[15px] leading-relaxed">
          <p>
            At Mom & Son, we want you to be happy with what you buy. If something isn&apos;t right, here&apos;s how cancellations, returns and refunds work.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">1. Order Cancellations</h2>
            <p>
              You can cancel an order within <strong>2 hours</strong> of placing it, as long as it hasn&apos;t already been packed or handed over to our courier.
            </p>
            <p>
              Once an order has shipped and has a tracking number, we&apos;re no longer able to cancel it. To cancel an eligible order, email us at <span className="font-medium text-[#221f1a]">wecare@momnson.co</span> and we&apos;ll take care of it.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">2. Returns & Return Window</h2>
            <p>
              We accept returns within <strong>7 days</strong> of your order being marked as delivered. For a return to be accepted:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>The item should be unused, unwashed, and in the condition you received it.</li>
              <li>All original tags, packaging and invoices should be included.</li>
              <li>Items that show signs of wear, stains, or washing can&apos;t be accepted and will be sent back to you.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">3. Damaged or Defective Items</h2>
            <p>
              If your order arrives damaged, faulty, or not what you ordered, let us know within <strong>48 hours</strong> of delivery. If you can, record a short unboxing video when you open the package - it helps us sort out claims with the courier quickly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">4. Refund Processing</h2>
            <p>
              Once we receive your returned item and check it over, we&apos;ll let you know whether it&apos;s been approved.
            </p>
            <p>
              If approved, your refund goes back to your original payment method - UPI, net banking, or card - within <strong>5 to 7 business days</strong>. Your bank may take a little longer to actually show the amount in your account.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#f1ede4] text-center flex flex-wrap justify-center gap-6 text-sm text-[#8c8270]">
          <Link href="/terms" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Terms & Conditions</Link>
          <Link href="/privacy" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Privacy Policy</Link>
          <Link href="/shipping" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Shipping & Delivery</Link>
          <Link href="/contact" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
