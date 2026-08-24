import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Layers, ArrowUp, ShieldCheck, CheckCircle2, Globe, Lock } from "lucide-react";

const Footer = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auth pages subtle realistic footer
  if (isAuthPage) {
    return (
      <footer className="py-6 border-t border-gray-800/40 text-xs text-gray-400 bg-[#0b1120] mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-purple-600/30 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold text-[10px]">
              LS
            </div>
            <span>© {new Date().getFullYear()} LeadSphere CRM Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <span className="hover:text-gray-200 transition cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-gray-200 transition cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              System Normal
            </span>
          </div>
        </div>
      </footer>
    );
  }

  // Dashboard full realistic enterprise footer
  return (
    <footer className="bg-[#090d16] border-t border-gray-800/60 text-gray-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Main Footer Links Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8 pb-8 border-b border-gray-800/50">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-extrabold text-white tracking-tight">
                LeadSphere <span className="text-purple-400 font-normal text-xs">CRM</span>
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Intelligent lead management, automated team routing, and real-time conversion insights for modern enterprise sales organizations.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                API Operational
              </span>
              <span className="inline-flex items-center gap-1 text-gray-400 text-[11px]">
                <Lock size={12} className="text-gray-400" />
                TLS 1.3 Encrypted
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Lead Pipeline
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Smart Auto Assignment
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Follow-up Tracker
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Role-Based Security
                </span>
              </li>
            </ul>
          </div>

          {/* Solutions Links */}
          <div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-3">
              Solutions
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Sales Team Management
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Admin Analytics Console
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Conversion Metrics
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Enterprise SLA
                </span>
              </li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-3">
              Resources
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  API Documentation
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  System Status
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-purple-400 transition cursor-pointer">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright & Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400">
          <div>
            © {new Date().getFullYear()} LeadSphere Technologies Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-4">
            <span className="text-gray-400">v1.0.0 (Production)</span>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-gray-300 hover:text-white transition focus:outline-none"
            >
              Back to top <ArrowUp size={12} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
