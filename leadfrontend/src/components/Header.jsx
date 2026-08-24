import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Layers,
  LogOut,
  Shield,
  Briefcase,
  ChevronDown,
  Menu,
  X,
  LayoutDashboard,
  CheckCircle2
} from "lucide-react";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userName = user?.name || localStorage.getItem("userName") || "User";
  const userEmail = user?.email || localStorage.getItem("userEmail") || "";
  const userRole = (user?.role || localStorage.getItem("role") || "").toUpperCase();

  const isAuthPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getUserInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isAdmin = userRole === "ADMIN";
  const isSales = userRole === "SALES";

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a]/90 backdrop-blur-md border-b border-gray-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Subtle Brand Logo */}
          <Link
            to={user ? (isAdmin ? "/dashboard/admin" : "/dashboard/sales") : "/"}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight group-hover:text-purple-300 transition duration-150">
              LeadSphere
            </span>
          </Link>

          {/* If on Auth Pages, show subtle navigation right link */}
          {isAuthPage && !user ? (
            <div className="flex items-center gap-4 text-sm">
              {location.pathname === "/register" ? (
                <span className="text-gray-400">
                  Already have an account?{" "}
                  <Link to="/login" className="text-purple-400 font-medium hover:text-purple-300 transition">
                    Sign In
                  </Link>
                </span>
              ) : (
                <span className="text-gray-400">
                  New to LeadSphere?{" "}
                  <Link to="/register" className="text-purple-400 font-medium hover:text-purple-300 transition">
                    Create Account
                  </Link>
                </span>
              )}
            </div>
          ) : (
            user && (
              <>
                {/* Center Navigation Tabs */}
                <nav className="hidden md:flex items-center gap-1 bg-gray-900/60 border border-gray-800/60 p-1 rounded-xl">
                  {isAdmin && (
                    <Link
                      to="/dashboard/admin"
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        location.pathname === "/dashboard/admin"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <LayoutDashboard size={14} />
                      Admin Dashboard
                    </Link>
                  )}

                  {isSales && (
                    <Link
                      to="/dashboard/sales"
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                        location.pathname === "/dashboard/sales"
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Briefcase size={14} />
                      Sales Dashboard
                    </Link>
                  )}
                </nav>

                {/* Profile Pill & Dropdown */}
                <div className="hidden md:flex items-center gap-3">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2.5 p-1 pl-2.5 pr-2 rounded-xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-left focus:outline-none transition"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold text-xs">
                        {getUserInitials(userName)}
                      </div>
                      <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                        {userName}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isAdmin ? "bg-purple-500/20 text-purple-300" : "bg-emerald-500/20 text-emerald-300"
                      }`}>
                        {userRole}
                      </span>
                      <ChevronDown size={14} className="text-gray-400" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#141c2e] border border-gray-800 shadow-xl p-2 z-50">
                        <div className="p-2.5 bg-gray-900/80 rounded-lg border border-gray-800/50 mb-1.5">
                          <p className="text-xs font-bold text-white truncate">{userName}</p>
                          <p className="text-[11px] text-gray-400 truncate">{userEmail}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )
          )}

          {/* Mobile Menu Toggle */}
          {user && (
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && user && (
        <div className="md:hidden bg-[#0f172a] border-b border-gray-800 px-4 py-3 space-y-3">
          <div className="flex items-center gap-3 p-2 bg-gray-900 rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
              {getUserInitials(userName)}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{userName}</p>
              <p className="text-[11px] text-gray-400">{userEmail}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left py-2 px-3 text-xs font-bold text-red-400 bg-red-500/10 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
