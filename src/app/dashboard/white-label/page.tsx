'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Id } from '../../../../convex/_generated/dataModel';
import { Image as ImageIcon, Link, Paintbrush, Mail, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { useFeatureFlag } from '../../../hooks/useFeatureFlag';

export default function WhiteLabelDashboard() {
  const orgs = useQuery(api.organizations.listForUser);
  const activeOrgId = orgs?.[0]?._id;

  const organization = useQuery(api.organizations.get, 
    activeOrgId ? { organizationId: activeOrgId } : "skip"
  );
  const updateOrg = useMutation(api.organizations.update);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  
  const hasWhiteLabel = useFeatureFlag(activeOrgId || ("" as Id<"organizations">), "whiteLabel");

  const [brandColor, setBrandColor] = useState('#6366f1');
  const [customDomain, setCustomDomain] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Sync state when org loads
  React.useEffect(() => {
    if (organization) {
      if (organization.brandColor) setBrandColor(organization.brandColor);
      if (organization.customDomain) setCustomDomain(organization.customDomain);
      if (organization.supportEmail) setSupportEmail(organization.supportEmail);
    }
  }, [organization]);

  const handleSave = async () => {
    if (!activeOrgId) return;
    setSaving(true);
    try {
      await updateOrg({
        organizationId: activeOrgId,
        brandColor,
        customDomain,
        supportEmail
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    if (!event.target.files || event.target.files.length === 0 || !activeOrgId) return;
    const file = event.target.files[0];

    try {
      // 1. Get secure upload URL from Convex
      const postUrl = await generateUploadUrl({ organizationId: activeOrgId });
      
      // 2. Upload file directly to Convex Storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // 3. Save the storageId to the organization
      await updateOrg({
        organizationId: activeOrgId,
        [type === 'logo' ? 'logoId' : 'faviconId']: storageId
      });
    } catch (error) {
      console.error("Failed to upload file:", error);
    }
  };

  if (!hasWhiteLabel) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-3xl font-bold text-white tracking-tight">White Labeling</h1>
        <div className="glass-panel-premium p-12 text-center rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Premium Feature</h2>
          <p className="text-white/60 max-w-lg mx-auto mb-8">
            Upgrade your workspace to remove our branding and use your own custom domains, logos, and brand colors.
          </p>
          <a href="/dashboard/premium" className="bg-white text-black font-medium px-8 py-4 rounded-xl transition-all hover:bg-white/90 inline-flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Request Premium Access
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">White Labeling</h1>
          <p className="text-white/60 mt-2">Customize the platform to match your brand identity.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-500 hover:bg-indigo-400 text-white font-medium px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
        >
          {saving ? 'Saving...' : success ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel-premium p-8 rounded-2xl space-y-8">
            {/* Visual Assets */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-400" /> Brand Assets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-sm font-medium text-white mb-4">Primary Logo</p>
                  <label className="cursor-pointer flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
                    <ImageIcon className="w-8 h-8 text-white/40 mb-2" />
                    <span className="text-xs text-white/60">Upload SVG or PNG</span>
                    <input type="file" className="hidden" accept="image/png, image/svg+xml" onChange={(e) => handleFileUpload(e, 'logo')} />
                  </label>
                </div>
                <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                  <p className="text-sm font-medium text-white mb-4">Favicon</p>
                  <label className="cursor-pointer flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/20 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
                    <ImageIcon className="w-8 h-8 text-white/40 mb-2" />
                    <span className="text-xs text-white/60">Upload ICO or PNG</span>
                    <input type="file" className="hidden" accept="image/png, image/x-icon" onChange={(e) => handleFileUpload(e, 'favicon')} />
                  </label>
                </div>
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Colors */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Paintbrush className="w-5 h-5 text-indigo-400" /> Brand Color
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-14 h-14 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50 uppercase"
                />
              </div>
            </div>

            <hr className="border-white/10" />

            {/* Custom Domain & Email */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Link className="w-5 h-5 text-indigo-400" /> Domain & Support
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 block">Custom Domain</label>
                  <div className="flex relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">https://</span>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="app.yourcompany.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-20 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider mb-2 block">Support Email</label>
                  <div className="flex relative">
                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="support@yourcompany.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">Live Preview</h3>
            <div className="glass-panel-premium rounded-2xl overflow-hidden border border-white/10 h-[500px] flex flex-col">
              {/* Browser Mockup */}
              <div className="bg-white/5 px-4 py-3 flex items-center gap-3 border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 bg-black/40 rounded px-3 py-1 text-xs text-center text-white/50 truncate">
                  {customDomain ? `app.${customDomain}` : 'app.yoursite.com'}
                </div>
              </div>
              
              {/* Fake App Preview */}
              <div className="flex-1 p-6 relative">
                {/* Fake sidebar */}
                <div className="w-16 absolute left-0 top-0 bottom-0 border-r border-white/10 flex flex-col items-center py-6">
                  <div className="w-8 h-8 rounded mb-8" style={{ backgroundColor: brandColor }} />
                  <div className="w-6 h-6 rounded bg-white/10 mb-4" />
                  <div className="w-6 h-6 rounded bg-white/10 mb-4" />
                </div>
                
                {/* Fake content */}
                <div className="ml-20 space-y-4">
                  <div className="w-1/3 h-6 rounded bg-white/10" />
                  <div className="w-full h-32 rounded-xl border border-white/10" style={{ backgroundColor: `${brandColor}10`, borderColor: `${brandColor}30` }} />
                  <div className="flex gap-4">
                    <div className="w-1/2 h-20 rounded-xl bg-white/5" />
                    <div className="w-1/2 h-20 rounded-xl bg-white/5" />
                  </div>
                  
                  {/* Fake Button */}
                  <div 
                    className="w-32 h-8 rounded-lg mt-8" 
                    style={{ backgroundColor: brandColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
