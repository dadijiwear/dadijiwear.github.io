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
            <p><span className="font-medium text-[#5c5446]">Author:</span> Yash Patel </p>
            <span className="hidden sm:inline text-[#e6ded0]">•</span>
            <p><span className="font-medium text-[#5c5446]">Last Updated:</span> June 07, 2026</p>
          </div>
          <div className="mt-6 h-[1px] w-24 bg-[#e6ded0] mx-auto"></div>
        </div>

        <div className="prose prose-stone max-w-none space-y-8 text-[15px] leading-relaxed">
          <p>
            Mom & Son (momnson.co) respects your privacy and is committed to protecting the personal data you share with us. This Privacy Policy outlines how we collect, handle, use, and safeguard your details when you browse our website or make a purchase.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">1. Information We Collect</h2>
            <p>When you visit or purchase from our website, we collect the necessary details to process your transaction and improve your user experience, including:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Identity & Contact Info:</strong> Full name, shipping addresses, billing address, phone number, and email address.</li>
              <li><strong>Transaction Records:</strong> History of items purchased, order identification numbers, and total transaction values.</li>
              <li><strong>Technical Metadata:</strong> IP address, device telemetry, browser signatures, and standard session interaction patterns.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">2. How Your Data Is Processed</h2>
            <p>Your information is processed specifically for the following explicit workflows:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Registering, authenticating, and maintaining user account portals.</li>
              <li>Processing online checkouts, generating order forms, and managing secure payment flows.</li>
              <li>Arranging parcel tracking numbers and passing delivery coordinates to third-party shipping couriers.</li>
              <li>Sending crucial order updates, purchase confirmations, and support queries.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">3. Payment Information Security</h2>
            <p>
              All checkout monetary values are calculated via standardized merchant gateways. We do not ingest, record, or store complete payment card credentials, secure UPI pins, or primary netbanking passwords on our application servers. These operations are executed safely inside the secure networks of our authorized third-party payment gateway aggregates.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">4. Third-Party Sharing</h2>
            <p>
              We do not sell, rent, or trade your personal data to advertising groups. Data is shared exclusively with necessary infrastructure components to operate the store, such as automated delivery services, database providers, cloud computing instances, and payment tokenizers.
            </p>
          </section>

          <section className="space-y-3 bg-[#fbf9f4] p-5 border border-[#ece6da] rounded-sm">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#ebdcc3] pb-1">5. Technical Infrastructure & Developer Disclaimer</h2>
            <p className="text-sm text-[#5c5446]">
              The technical system layer, source code codebases, and server routing interfaces for this platform were deployed and set up by an independent technical maintainer. This developer acts purely as a non-commercial code assembly entity and has no access to, ownership over, or commercial utility derived from your personal transactional records or consumer databases.
            </p>
            <p className="text-sm text-[#5c5446]">
              Consequently, the technical maintainer accepts zero liability or accountability for database security breaches, hosting provider network vulnerabilities, payment processor exploits, or malicious data access incidents originating from third-party server environments or operational integrations. Any inquiries, storage concerns, or privacy claims must be addressed directly to Mom & Son.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">6. Cookies and Tracking</h2>
            <p>
              We utilize minor persistent cookies and tracking arrays to retain your active checkout cart status, save login states, and evaluate user navigation patterns. You can choose to deny cookie storage blocks inside your browser settings, though doing so might disrupt baseline cart and checkout operations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-[#221f1a] font-serif border-b border-[#f1ede4] pb-1">7. Contact Information</h2>
            <p>For questions regarding this Privacy Policy or data security practices, please contact:</p>
            <div className="bg-[#fcfbf9] border border-[#f3eee3] p-4 text-sm space-y-1">
              <p><strong>Business Name:</strong> Mom & Son</p>
              <p><strong>Domain:</strong> momnson.co</p>
              <p><strong>Email:</strong> wecare@momnson.co</p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#f1ede4] text-center">
          <Link href="/terms" className="text-sm text-[#8c8270] hover:text-[#221f1a] underline underline-offset-4 transition-colors">
            Return to Terms & Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
