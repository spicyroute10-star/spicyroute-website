import React, { useState } from 'react';
import { ArrowLeft, Shield, FileText, RefreshCw, CheckCircle2, AlertTriangle, Building2, Mail, Phone, ExternalLink } from 'lucide-react';

export default function LegalPolicyPage({ initialTab = 'terms', onBack }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'refund', label: 'Cancellation & Refund', icon: RefreshCw },
    { id: 'compliance', label: 'FSSAI & Compliance', icon: Building2 }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-black text-rose-600 hover:text-rose-700 bg-rose-50 px-4 py-2 rounded-xl border border-rose-200 transition-all active:scale-95"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-rose-300 border border-white/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Legal & Policy Center</h1>
              <p className="text-xs font-semibold text-rose-200/80 mt-1">
                Official User Agreements, Privacy Standards & FSSAI Compliance for Spicy Route
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto no-scrollbar pt-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed text-sm">
          
          {/* TAB 1: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[11px] font-black uppercase text-rose-600 tracking-wider">User Agreement</span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Terms and Conditions of Use</h2>
                <p className="text-xs text-gray-400 mt-1">Last Updated: October 2, 2026 • Effective Immediately</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 text-xs font-black flex items-center justify-center">1</span>
                  Platform Overview & Electronic Intermediary
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Welcome to <strong>Spicy Route</strong> (<span className="font-mono text-rose-600">spicyroute.in</span> / <span className="font-mono text-rose-600">www.spicyroute.in</span>). 
                  Spicy Route operates solely as an online technology intermediary platform that connects registered students, staff, and campus consumers with independently operated canteens, dhabas, cloud kitchens, and restaurants ("Food Vendors") as well as independent delivery executives.
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Under the Indian Information Technology Act, 2000 and applicable intermediary guidelines, Spicy Route acts as a facilitator and does not independently manufacture or cook food items.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 text-xs font-black flex items-center justify-center">2</span>
                  User Eligibility & Account Registration
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  To utilize our ordering services, you may sign up directly or authenticate via Google OAuth. You agree that all details provided (including legal name, campus hostel/block delivery address, and active mobile number) are accurate. You are solely responsible for maintaining the confidentiality of your session and devices.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 text-xs font-black flex items-center justify-center">3</span>
                  Orders, Pricing & 20-Minute Delivery SLA
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  All menu prices, descriptions, and packaging fees displayed on the storefront are configured directly by the registered restaurant vendors. While Spicy Route and our courier fleet target ultra-fast 20-minute order turnaround within campus zones, delivery timings may fluctuate during peak lunch/dinner rush, inclement weather, or campus security gate restrictions.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 text-xs font-black flex items-center justify-center">4</span>
                  Payments & Honest Student Pricing
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Spicy Route supports payments through standard UPI (Google Pay, PhonePe, Paytm), Net Banking, Debit/Credit cards, and Cash on Delivery (COD) when enabled. We believe in transparent, student-friendly pricing with zero hidden fees. Applicable Goods & Services Tax (GST) is calculated and disclosed transparently at checkout.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 text-xs font-black flex items-center justify-center">5</span>
                  Vendor Quality & Platform Limitation of Liability
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  The respective restaurant vendor holds complete responsibility for food hygiene, taste, portion size, and adherence to dietary declarations (e.g. Pure Veg, Halal). Spicy Route shall not be held liable for any adverse reactions resulting from undisclosed food allergens or ingredient sensitivities.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 text-xs font-black flex items-center justify-center">6</span>
                  Governing Law & Jurisdiction
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in India.
                </p>
              </section>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[11px] font-black uppercase text-emerald-600 tracking-wider">Data Protection</span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Privacy & Data Governance Policy</h2>
                <p className="text-xs text-gray-400 mt-1">Last Updated: October 2, 2026 • Compliant with Indian IT Rules & DPDP Principles</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-black flex items-center justify-center">1</span>
                  Information We Collect
                </h3>
                <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-200/60 text-xs sm:text-sm text-gray-600">
                  <p><strong>Personal Profile Data:</strong> Name, verified email address, and contact phone number supplied during registration or imported through Google OAuth 2.0.</p>
                  <p><strong>Location Coordinates & Address:</strong> Real-time browser GPS coordinates (when permission is granted) and designated delivery room/hostel text for rider routing.</p>
                  <p><strong>Transaction & Order Logs:</strong> Items ordered, payment transaction references, subtotal, and vendor fulfillment status.</p>
                  <p><strong>Device & Technical Identifiers:</strong> Browser type, operating system, and PWA installation state.</p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-black flex items-center justify-center">2</span>
                  How We Use Your Data
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
                  <li>To transmit your order and special kitchen instructions to the restaurant.</li>
                  <li>To provide live WebSocket updates and SMS/push notifications on delivery progress.</li>
                  <li>To generate automated financial reconciliation reports for vendors and administrators.</li>
                  <li>To prevent platform fraud, abusive duplicate registrations, or bot orders.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-black flex items-center justify-center">3</span>
                  Strict No-Sale Policy & Third-Party Sharing
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  <strong>We do not sell, trade, or rent your personal information to third-party advertisers or data brokers.</strong> 
                  Information is shared strictly with the restaurant preparing your food and the assigned delivery executive to carry out delivery.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-black flex items-center justify-center">4</span>
                  Data Security & SSL Encryption
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  All traffic across <span className="font-mono text-emerald-600 font-semibold">spicyroute.in</span> is secured by 256-bit TLS/SSL encryption certificates provided via modern edge infrastructure. Database records are protected behind role-based access control and encrypted environment configurations.
                </p>
              </section>
            </div>
          )}

          {/* TAB 3: REFUND & CANCELLATION */}
          {activeTab === 'refund' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[11px] font-black uppercase text-amber-600 tracking-wider">Customer Assurance</span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">Cancellation & Refund Policy</h2>
                <p className="text-xs text-gray-400 mt-1">Clear, fair, and transparent policies for all campus orders</p>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <strong className="font-black">Notice Regarding Prepared Food:</strong>
                  <p>Because restaurant meals are freshly prepared and highly perishable, order cancellation rules are strictly enforced once the kitchen has begun preparation.</p>
                </div>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 text-xs font-black flex items-center justify-center">1</span>
                  Order Cancellation Windows
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  <strong>Within 60 Seconds of Order Placement:</strong> You may cancel your order at no charge if the kitchen has not accepted or commenced food preparation.
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  <strong>After Kitchen Acceptance:</strong> Once the restaurant moves your order to <em>"Preparing"</em>, cancellations cannot be accepted as the ingredients and kitchen resources have already been deployed.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 text-xs font-black flex items-center justify-center">2</span>
                  Eligible Scenarios for 100% Refund
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-gray-600">
                  <li>The partner restaurant cancels the order due to item stock-out or closure.</li>
                  <li>An entirely incorrect dish or missing item is delivered (reported within 2 hours of delivery with photographic evidence).</li>
                  <li>Delivery could not be executed due to a confirmed operational failure on our courier network.</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-50 text-amber-600 text-xs font-black flex items-center justify-center">3</span>
                  Refund Processing Timelines
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Approved refunds are credited directly back to the original source of payment:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
                    <span className="text-xs font-extrabold text-gray-900">⚡ UPI (GPay / PhonePe / Paytm)</span>
                    <p className="text-[11px] text-gray-500 mt-1">Processed immediately; credits within 2 to 24 hours.</p>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
                    <span className="text-xs font-extrabold text-gray-900">💳 Debit / Credit Cards & NetBanking</span>
                    <p className="text-[11px] text-gray-500 mt-1">Processed through banking rails; credits within 3 to 5 business days.</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 4: FSSAI & LEGAL COMPLIANCE */}
          {activeTab === 'compliance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-100 pb-4">
                <span className="text-[11px] font-black uppercase text-purple-600 tracking-wider">Regulatory Standards</span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">FSSAI Compliance & Grievance Redressal</h2>
                <p className="text-xs text-gray-400 mt-1">Compliant with Food Safety & Standards Act, 2006 & Consumer Protection Rules, 2020</p>
              </div>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 text-xs font-black flex items-center justify-center">1</span>
                  FSSAI Food Safety Standards
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  In compliance with regulations promulgated by the <strong>Food Safety and Standards Authority of India (FSSAI)</strong>:
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Every restaurant onboarding on Spicy Route is required to present valid FSSAI registration or license certification.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Kitchen facilities are expected to maintain Good Hygienic Practices (GHP) and tamper-proof food packaging for transit.</span>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>Delivery executives are instructed to carry thermal or insulated bags to ensure food hygiene and temperature preservation.</span>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-50 text-purple-600 text-xs font-black flex items-center justify-center">2</span>
                  Official Grievance Redressal Officer
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  As mandated under Rule 5(9) of the Consumer Protection (E-Commerce) Rules, 2020, Spicy Route has appointed a designated Grievance Officer for consumer assistance:
                </p>

                <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-rose-400" />
                    <span className="font-black text-sm">Spicy Route Legal & Grievance Desk</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-rose-400" />
                      <span>Email: <a href="mailto:spicyroute10@gmail.com" className="text-rose-300 underline font-semibold">spicyroute10@gmail.com</a></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4 text-rose-400" />
                      <span>Website: <span className="text-slate-100 font-bold">spicyroute.in</span></span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 border-t border-slate-800 pt-2.5">
                    <strong>Grievance SLA:</strong> Acknowledgment within 48 hours; resolution within 15 working days from receipt of complaint.
                  </p>
                </div>
              </section>
            </div>
          )}

        </div>

        {/* Footer info banner */}
        <div className="bg-gray-50 border-t border-gray-100 p-6 text-center text-xs text-gray-400">
          <p>© 2026 Spicy Route (<span className="font-semibold text-gray-600">spicyroute.in</span>). All Rights Reserved.</p>
          <p className="text-[11px] mt-1">Super fast 20-minute campus delivery • Transparent pricing • Secure Google authentication</p>
        </div>
      </div>
    </div>
  );
}
