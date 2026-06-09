'use client';

import React, { useState } from 'react';
// convex import removed
// convex import removed
// convex import removed
const requestAccess = async (opts: any) => {};
import { X, Sparkles, Building, Globe, Mail, Users, Check } from 'lucide-react';

interface RequestPremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

export function RequestPremiumModal({ isOpen, onClose, organizationId }: RequestPremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    website: '',
    email: '',
    teamSize: '1-10',
    requirements: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await requestAccess({
        organizationId,
        ...formData
      });
      setSuccess(true);
      // Redirect to email after success
      window.location.href = `mailto:business.marketingko@gmail.com?subject=Premium%20Access%20Request&body=Name:${formData.name}%0ACompany:${formData.company}%0AWebsite:${formData.website}%0AEmail:${formData.email}%0ATeam%20Size:${formData.teamSize}%0ARequirements:${formData.requirements}`;
      // Wait a moment then close
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit premium request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel-premium w-full max-w-lg p-8 relative mx-4 rounded-2xl animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Request Submitted!</h2>
            <p className="text-white/60">
              Our team has received your application. We will contact you at {formData.email} shortly to set up your Premium access.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Apply for Premium Access</h2>
                <p className="text-sm text-white/60">Unlock white labeling, API access, and enterprise features. Limited onboarding spots available.</p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset className="space-y-4 border-none p-0 m-0">
                <legend className="sr-only">Request Premium Form</legend>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="premium-name" className="text-xs font-medium text-white/60 uppercase tracking-wider">Full Name</label>
                    <input
                      id="premium-name"
                      required
                      aria-required="true"
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="premium-email" className="text-xs font-medium text-white/60 uppercase tracking-wider">Work Email</label>
                    <input
                      id="premium-email"
                      required
                      aria-required="true"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="premium-company" className="text-xs font-medium text-white/60 uppercase tracking-wider">Company</label>
                    <input
                      id="premium-company"
                      required
                      aria-required="true"
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData({...formData, company: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="premium-website" className="text-xs font-medium text-white/60 uppercase tracking-wider">Website</label>
                    <input
                      id="premium-website"
                      required
                      aria-required="true"
                      type="url"
                      value={formData.website}
                      onChange={e => setFormData({...formData, website: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all"
                      placeholder="https://acme.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="premium-teamsize" className="text-xs font-medium text-white/60 uppercase tracking-wider">Team Size</label>
                  <select
                    id="premium-teamsize"
                    value={formData.teamSize}
                    onChange={e => setFormData({...formData, teamSize: e.target.value})}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201+">201+ employees</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="premium-requirements" className="text-xs font-medium text-white/60 uppercase tracking-wider">Specific Requirements</label>
                  <textarea
                    id="premium-requirements"
                    required
                    aria-required="true"
                    value={formData.requirements}
                    onChange={e => setFormData({...formData, requirements: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-all min-h-[100px] resize-none"
                    placeholder="Tell us what premium features you're looking for..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  aria-label="Submit Premium Application"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] disabled:opacity-50 mt-4 cursor-pointer"
                >
                  {loading ? 'Submitting...' : 'Apply for Premium Access'}
                </button>
              </fieldset>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
