import Link from "next/link";

export const metadata = {
  title: "Contact Us | Mom & Son",
  description: "Get in touch with the Mom & Son care team. Real people, no automated chat bots.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] bg-[radial-gradient(#f1ede4_1px,transparent_1px)] [background-size:24px_24px] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#fffdfa] shadow-[0_10px_40px_rgba(40,30,10,0.04)] border border-[#f3eee3] rounded-sm p-8 sm:p-12 md:p-16 text-[#3d3830]">

        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-[#221f1a] sm:text-4xl font-serif">Contact Our Team</h1>
          <p className="mt-3 text-sm text-[#8c8270] tracking-wide uppercase">We are here because we care</p>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-sm text-[#8c8270]">
            <p><span className="font-medium text-[#5c5446]">Author:</span> Yash Patel</p>
            <span className="hidden sm:inline text-[#e6ded0]">•</span>
            <p><span className="font-medium text-[#5c5446]">Last Updated:</span> March, 2026</p>
          </div>
          <div className="mt-6 h-[1px] w-24 bg-[#e6ded0] mx-auto"></div>
        </div>

        <div className="space-y-10">

          <div className="bg-[#f9f6f0] border-l-2 border-[#d4af37] p-5 rounded-r-sm">
            <h3 className="text-sm font-semibold tracking-wider text-[#221f1a] uppercase font-serif">Our Support Philosophy</h3>
            <p className="mt-2 text-sm text-[#5c5446] leading-relaxed">
              When you reach out to Mom & Son, you&apos;ll always be talking to a <strong>real person</strong>. We don&apos;t put you through automated chatbots - your message is read and replied to by someone who genuinely wants to help.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="p-6 bg-[#fffdfa] border border-[#f1ede4] rounded-sm">
              <h4 className="text-xs font-semibold text-[#8c8270] uppercase tracking-wider mb-1">Email Support</h4>
              <p className="text-lg font-serif text-[#221f1a] font-medium break-all">wecare@momnson.co</p>
              <p className="text-xs text-[#8c8270] mt-2">Expect a thoughtful human response within 12-24 hours.</p>
            </div>

            <div className="p-6 bg-[#fffdfa] border border-[#f1ede4] rounded-sm">
              <h4 className="text-xs font-semibold text-[#8c8270] uppercase tracking-wider mb-1">Call & WhatsApp</h4>
              <p className="text-lg font-serif text-[#221f1a] font-medium">+91 99041 58576</p>
              <p className="text-xs text-[#8c8270] mt-2">Available Mon-Sat, 10:00 AM - 6:00 PM IST.</p>
            </div>

            <div className="p-6 bg-[#fffdfa] border border-[#f1ede4] rounded-sm">
              <h4 className="text-xs font-semibold text-[#8c8270] uppercase tracking-wider mb-1">Instagram</h4>
              <p className="text-lg font-serif text-[#221f1a] font-medium">@momnson.co</p>
              <p className="text-xs text-[#8c8270] mt-2">Follow us for new arrivals and updates.</p>
            </div>
          </div>

          <section className="space-y-3 pt-4 border-t border-[#f1ede4]">
            <h2 className="text-md font-semibold text-[#221f1a] font-serif uppercase tracking-wider text-xs">Grievance Redressal</h2>
            <p className="text-sm text-[#5c5446]">
              In line with the Consumer Protection (E-Commerce) Rules, here are the details of our grievance redressal officer:
            </p>
            <div className="text-xs text-[#8c8270] bg-[#fcfbf9] p-4 border border-[#f3eee3] space-y-1">
              <p><strong>Designation:</strong> Grievance Officer</p>
              <p><strong>Name:</strong> Yash Patel</p>
              <p><strong>Entity:</strong> Mom & Son</p>
              <p><strong>Email:</strong> yash@momnson.co</p>
              <p><strong>Address:</strong> Mahalakshmi, Pethapur, Gandhinagar, India</p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-[#f1ede4] text-center flex flex-wrap justify-center gap-6 text-sm text-[#8c8270]">
          <Link href="/terms" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Terms & Conditions</Link>
          <Link href="/privacy" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Privacy Policy</Link>
          <Link href="/refund" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Return & Refund Policy</Link>
          <Link href="/shipping" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Shipping & Delivery</Link>
        </div>

      </div>
    </div>
  );
}
