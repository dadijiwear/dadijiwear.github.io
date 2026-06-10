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
            <p className="tracking-wide uppercase"><span className="font-medium text-[#5c5446] normal-case">Last Updated:</span> June 07, 2026</p>
          </div>
          <div className="mt-6 h-[1px] w-24 bg-[#e6ded0] mx-auto"></div>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-[15px] leading-relaxed">
          <p>
            Welcome to Mom & Son (momnson.co). By accessing or using our website, you agree to comply with and be bound by these Terms and Conditions. Please read them carefully before using our platform or making any purchases.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">1. Eligibility</h2>
            <p>
              By using this website, you confirm that you are at least 18 years old or are accessing the website under the supervision of a parent or legal guardian.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">2. Products and Pricing</h2>
            <p>
              We make every effort to display product descriptions, sizes, colors, and prices accurately. However, minor variations may occur due to photography, screen settings, or manufacturing differences.
            </p>
            <p>
              All prices are displayed in Indian Rupees (INR) and are subject to change without prior notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">3. Orders</h2>
            <p>
              Placing an order does not guarantee acceptance. We reserve the right to refuse or cancel any order due to product unavailability, pricing errors, suspected fraud, or other legitimate reasons.
            </p>
            <p>
              If payment has already been received for a cancelled order, a refund will be processed according to our Refund Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">4. Payments</h2>
            <p>
              Payments are processed through authorized third-party payment providers. We do not store complete payment card information on our servers.
            </p>
            <p>
              Supported payment methods may include UPI, Net Banking, debit cards, credit cards, and other methods displayed during checkout.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">5. Shipping and Delivery</h2>
            <p>
              Delivery timelines are estimates and may vary depending on location, courier operations, holidays, weather conditions, or other factors beyond our control. Customers are responsible for providing accurate shipping information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">6. Returns and Refunds</h2>
            <p>
              Returns, exchanges, and refunds are governed by our Return and Refund Policy. Customers should review that policy before making a purchase.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">7. User Accounts</h2>
            <p>
              Users are responsible for maintaining the confidentiality of their account credentials and for all activities conducted through their account. You agree to provide accurate and current information when creating an account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">8. Intellectual Property</h2>
            <p>
              All content on this website, including logos, images, graphics, product descriptions, text, and designs, is the property of Mom & Son unless otherwise stated and may not be copied, reproduced, or distributed without permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">9. Prohibited Activities</h2>
            <p>Users must not:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the website for unlawful purposes.</li>
              <li>Attempt unauthorized access to systems or data.</li>
              <li>Distribute malicious software.</li>
              <li>Interfere with website functionality.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Mom & Son shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of the website, products, or services.
            </p>
            <p>
              The website relies entirely on third-party infrastructure and providers, including but not limited to payment gateways, automated transaction networks, courier partners, cloud hosting platforms, database clusters, email service providers, and telecommunications carriers. Under no circumstances shall we be responsible or held liable for technical delays, transaction failures, checkout interruptions, security incidents, communication issues, or operational disruptions caused directly or indirectly by such external third-party providers.
            </p>
            <p>
              While reasonable efforts are made to maintain website availability and accuracy, we do not guarantee uninterrupted, secure, or completely error-free operations. In no event shall total operational liability exceed the amount paid by the customer for the specific order giving rise to the claim.
            </p>
          </section>

          <section className="space-y-3 bg-[#fbf9f4] p-5 border border-[#ece6da] rounded-sm">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#ebdcc3] pb-1">11. Technical Development Notice</h2>
            <p className="text-sm text-[#5c5446]">
              This website&apos;s software layout, codebase, and supporting technical infrastructure were built, compiled, and deployed by an independent third-party technical developer. This developer acts strictly as a non-commercial code provider and is not a merchant, seller, owner, co-owner, partner, operator, payment collector, fulfillment agent, or customer support entity for any goods offered on this platform.
            </p>
            <p className="text-sm text-[#5c5446]">
              Accordingly, the technical developer assumes absolutely no liability, duty of care, or financial responsibility for operational bugs, system crashes, payment transaction failures, server-side downtime, external API image load errors, broken asset links, or data losses of any type. All commercial transactions, order fulfillment pipelines, refunds, warranties, legal claims, and corporate customer obligations remain exclusively the liability and responsibility of Mom & Son.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">12. Changes to These Terms</h2>
            <p>
              We reserve the right to update or modify these Terms and Conditions at any time. Continued use of the website after changes constitutes full acceptance of the revised terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">13. Contact Information</h2>
            <p>For questions regarding these Terms and Conditions, please contact:</p>
            <div className="bg-[#fcfbf9] border border-[#f3eee3] p-4 text-sm space-y-1">
              <p><strong>Business Name:</strong> Mom & Son</p>
              <p><strong>Domain:</strong> momnson.co</p>
              <p><strong>Email:</strong> wecare@momnson.co</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#f1ede4] text-center">
          <Link href="/privacy" className="text-sm text-[#8c8270] hover:text-[#221f1a] underline underline-offset-4 transition-colors">
            Read Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
