import React from 'react';

export default function TermsOfConditionPage() {
  return (
    <main className="min-h-screen bg-background text-white p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-primary mb-8">Terms of Condition</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-muted">
            By accessing or using the Vero Analytics service, you agree to be bound by these Terms. If you disagree with any part of the terms then you may not access the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Service Usage</h2>
          <p className="text-muted">
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service. We cannot and will not be liable for any loss or damage arising from your failure to comply with the above requirements.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. Subscriptions</h2>
          <p className="text-muted">
            Some parts of the Service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis depending on the type of subscription plan you select.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Changes</h2>
          <p className="text-muted">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.
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
