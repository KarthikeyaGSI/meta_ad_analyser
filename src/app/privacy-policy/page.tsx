import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
          <p className="text-muted">
            We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, and other information you choose to provide.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Use of Information</h2>
          <p className="text-muted">
            We may use the information we collect about you to:
          </p>
          <ul className="list-disc pl-6 text-muted space-y-2">
            <li>Provide, maintain, and improve our Services, including, for example, to facilitate payments, send receipts, provide products and services you request (and send related information), develop new features, provide customer support to Users and Drivers, develop safety features, authenticate users, and send product updates and administrative messages.</li>
            <li>Perform internal operations, including, for example, to prevent fraud and abuse of our Services; to troubleshoot software bugs and operational problems; to conduct data analysis, testing, and research; and to monitor and analyze usage and activity trends.</li>
            <li>Send or facilitate communications between you and a independent contractor, such as estimated times of arrival (ETAs).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Sharing of Information</h2>
          <p className="text-muted">
            We do not share personal information with companies, organizations, or individuals outside of Vero except in the following cases:
            With your consent, for legal reasons, or with domain administrators.
          </p>
        </section>

        <section className="space-y-4 pt-8">
          <a href="/login" className="text-primary hover:underline">
            &larr; Return to Login
          </a>
        </section>
      </div>
    </main>
  );
}
