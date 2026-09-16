import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/leadApi";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import { User, Mail, Lock, UserPlus, ArrowRight } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setRegistered(false);

    // Basic validation
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
      // Public registration.
      // Backend always assigns the SALES role and PENDING status.
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password: password,
        roleId: 2,
      });

      console.log("✅ REGISTRATION SUCCESSFUL!");

      // Clear any old login/session information
      localStorage.clear();

      // Show account-created / pending-approval message
      setRegistered(true);

      // Clear form fields
      setName("");
      setEmail("");
      setPassword("");
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

            {/* Registration Success Banner */}
            {registered && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-2xl mb-5 text-center"
                >
                  <p className="font-semibold text-sm mb-1">
                    Account Created Successfully!
                  </p>

                  <p className="text-xs text-amber-200/80 leading-relaxed">
                    Your account is pending administrator approval. You will be
                    able to sign in once an administrator approves your account.
                  </p>

                  <Link
                      to="/login"
                      className="inline-block mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    Go to Sign In →
                  </Link>
                </motion.div>
            )}

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
              {/* Full Name */}
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

              {/* Email */}
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

              {/* Password */}
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

              {/* Register Button */}
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
                  Complete Registration
                  <ArrowRight size={16} />
                </span>
                )}
              </button>
            </form>

            {/* Footer Note */}
            <div className="mt-6 pt-5 border-t border-gray-800/60 text-center text-xs text-gray-400">
              Already have an account?{" "}
              <Link
                  to="/login"
                  className="text-purple-400 font-semibold hover:text-purple-300 transition"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </Layout>
  );
};

export default Register;