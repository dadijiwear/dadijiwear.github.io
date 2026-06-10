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
          <div className="mt-6 h-[1px] w-24 bg-[#e6ded0] mx-auto"></div>
        </div>

        <div className="space-y-10">
          
          {/* Real Person Notice */}
          <div className="bg-[#f9f6f0] border-l-2 border-[#d4af37] p-5 rounded-r-sm">
            <h3 className="text-sm font-semibold tracking-wider text-[#221f1a] uppercase font-serif">Our Support Philosophy</h3>
            <p className="mt-2 text-sm text-[#5c5446] leading-relaxed">
              When you reach out to Mom & Son, you will **always talk to a real person**. We do not route your concerns through rigid, frustrating automated chatbots. Your messages are read, understood, and answered by humans who genuinely care about resolving your issue.
            </p>
          </div>

          {/* Primary Coordinates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-6 bg-[#fffdfa] border border-[#f1ede4] rounded-sm">
              <h4 className="text-xs font-semibold text-[#8c8270] uppercase tracking-wider mb-1">Email Support</h4>
              <p className="text-lg font-serif text-[#221f1a] font-medium break-all">wecare@momnson.co</p>
              <p className="text-xs text-[#8c8270] mt-2">Expect a thoughtful human response within 12–24 hours.</p>
            </div>

            <div className="p-6 bg-[#fffdfa] border border-[#f1ede4] rounded-sm">
              <h4 className="text-xs font-semibold text-[#8c8270] uppercase tracking-wider mb-1">Voice & WhatsApp</h4>
              <p className="text-lg font-serif text-[#221f1a] font-medium">+91 XXXXX XXXXX</p>
              <p className="text-xs text-[#8c8270] mt-2">Available Mon–Sat, 10:00 AM – 6:00 PM IST.</p>
            </div>
          </div>

          {/* Grievance Officer Clause */}
          <section className="space-y-3 pt-4 border-t border-[#f1ede4]">
            <h2 className="text-md font-semibold text-[#221f1a] font-serif uppercase tracking-wider text-xs">Grievance Redressal Officer</h2>
            <p className="text-sm text-[#5c5446]">
              In accordance with the Consumer Protection (E-Commerce) Rules, the contact coordinates for our nodal grievance resolution division are maintained directly through our corporate desk:
            </p>
            <div className="text-xs text-[#8c8270] bg-[#fcfbf9] p-4 border border-[#f3eee3] space-y-1">
              <p><strong>Designation:</strong> Grievance Officer</p>
              <p><strong>Entity:</strong> Mom & Son Customer Support Desk</p>
              <p><strong>Address:</strong> [Your Physical Business Address, India]</p>
              <p><strong>Direct Escalation:</strong> support@momnson.co</p>
            </div>
          </section>

          {/* Professional Developer Credit & Note Block */}
          <section className="pt-8 border-t border-[#f1ede4]">
            <div className="bg-[#fcfbf9] border border-[#e6ded0] p-6 rounded-sm space-y-4">
              <h3 className="text-sm font-semibold text-[#221f1a] font-serif uppercase tracking-wider">Technical Production & Engineering</h3>
              <p className="text-xs text-[#5c5446] leading-relaxed">
                This store&apos;s modular software configuration, component schemas, design system layouts, and Next.js engine compilation were fully hand-crafted and maintained by our <strong>Independent Technical Developer</strong>. 
              </p>
              <p className="text-xs text-[#8c8270] leading-relaxed">
                <strong className="text-[#5c5446]">Developer Disclaimer Notice:</strong> As established in Section 11 of our Terms and Conditions, the software engineer acts exclusively as a technology architect. The developer does not maintain visibility over individual bank deposits, package storage physical units, delivery sorting routes, or retail inventory logistics. For any structural source code queries or optimization suggestions, you may flag technical data points to the administration desk, but all direct retail, purchase, and refund responsibilities rest strictly with Mom & Son.
              </p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-[#f1ede4] text-center flex justify-center gap-6 text-sm text-[#8c8270]">
          <Link href="/terms" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Privacy</Link>
          <Link href="/refund" className="hover:text-[#221f1a] underline underline-offset-4 transition-colors">Refunds</Link>
        </div>
        
      </div>
    </div>
  );
}
