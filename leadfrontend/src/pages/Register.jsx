import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/leadApi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { User, Mail, Lock, UserPlus, ArrowRight, Briefcase, Shield } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(2); // 2 = Sales (Default), 1 = Admin
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // 1. Call Backend Register API
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password,
        roleId: Number(roleId),
      });

      console.log("✅ REGISTRATION SUCCESSFUL!");

      // 2. Attempt seamless Auto-Login
      try {
        const loginRes = await api.post("/auth/login", {
          email: email.trim(),
          password: password,
        });

        const token = loginRes.data.token;
        const rawRole = loginRes.data.role || "ROLE_SALES";
        const role = rawRole.replace("ROLE_", "").toUpperCase();

        const userObj = {
          id: loginRes.data.id,
          email: loginRes.data.email || email,
          name: loginRes.data.name || name,
          role: role,
        };

        login(token, userObj);
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("userId", userObj.id);
        localStorage.setItem("userEmail", userObj.email);
        localStorage.setItem("userName", userObj.name);

        if (role === "ADMIN") {
          navigate("/dashboard/admin");
        } else {
          navigate("/dashboard/sales");
        }
      } catch (loginErr) {
        // Fallback: Redirect to Login page with success state
        navigate("/login", {
          state: { registered: true, registeredEmail: email.trim() },
        });
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(
        err.response?.data?.message ||
          "Registration failed. Please check your details or try a different email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="py-12 flex items-center justify-center min-h-[75vh]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-[#131b2e]/90 border border-gray-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          {/* Subtle Glow */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-3 shadow-inner">
              <UserPlus size={24} />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight my-0">
              Create Account
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Join LeadSphere to start managing your pipeline
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-2xl mb-5 text-xs text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Register Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full bg-[#0b1120] border border-gray-700/70 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-gray-500 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full bg-[#0b1120] border border-gray-700/70 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-gray-500 w-4 h-4" />
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#0b1120] border border-gray-700/70 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Role Toggle Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Select Account Role
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#0b1120] border border-gray-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRoleId(2)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition ${
                    roleId === 2
                      ? "bg-purple-600 text-white shadow-sm font-semibold"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Briefcase size={14} /> Sales Exec
                </button>
                <button
                  type="button"
                  onClick={() => setRoleId(1)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium transition ${
                    roleId === 1
                      ? "bg-purple-600 text-white shadow-sm font-semibold"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <Shield size={14} /> Administrator
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Complete Registration <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-5 border-t border-gray-800/60 text-center text-xs text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition">
              Sign in
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Register;