import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | SaaS Platform',
  description: 'Find answers to common questions about our enterprise SaaS platform.',
};

export default function FAQPage() {
  const faqs = [
    {
      question: "How does the White Label feature work?",
      answer: "Our White Label feature allows you to replace our branding with yours. You can upload your own logo, favicon, set a custom domain, and define brand colors. Your clients will only see your brand."
    },
    {
      question: "Is data isolated between workspaces?",
      answer: "Yes. Every query in our infrastructure is strictly organization and workspace scoped. We utilize a multi-tenant architecture on Convex to ensure zero cross-tenant data leakage."
    },
    {
      question: "How do I request Premium access?",
      answer: "Premium access is currently manually approved for enterprise readiness. You can request access from your dashboard by providing your company details and requirements."
    }
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <div className="max-w-4xl mx-auto py-24 px-6 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
      <p className="text-white/60 text-lg mb-12">Everything you need to know about the product and billing.</p>

      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="glass-panel-premium p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2">{faq.question}</h3>
            <p className="text-white/70 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
