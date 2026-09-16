import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../api/leadApi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Pre-fill email if redirected from Registration page
  const registeredEmail = location.state?.registeredEmail || "";
  const registrationSuccess = location.state?.registered || false;

  const [email, setEmail] = useState(registeredEmail);
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setErrorType("");

    if (!email.trim() || !password) {
      setError("Please enter both email and password.");
      setErrorType("error");
      return;
    }

    setLoading(true);

    try {
      // Call Spring Boot login API
      const res = await api.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      console.log("✅ LOGIN SUCCESS:", res.data);

      const token = res.data.token;

      const rawRole = res.data.role || "ROLE_SALES";

      const role = rawRole.replace("ROLE_", "").toUpperCase();

      const userObj = {
        id: res.data.id,
        email: res.data.email || email,
        name: res.data.name || email.split("@")[0],
        role: role,
      };

      // Set authentication context
      login(token, userObj);

      // Store authentication information
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", userObj.id);
      localStorage.setItem("userEmail", userObj.email);
      localStorage.setItem("userName", userObj.name);

      // Navigate according to role
      if (role === "ADMIN") {
        navigate("/dashboard/admin");
      } else {
        navigate("/dashboard/sales");
      }
    } catch (err) {
      console.error("❌ Login error:", err);

      const status = err.response?.status;
      const serverMessage = err.response?.data?.message;

      // Account is waiting for administrator approval
      if (status === 403 && serverMessage?.toLowerCase().includes("pending")) {
        setError(
            serverMessage ||
            "Your account is pending administrator approval. Please contact your system administrator."
        );

        setErrorType("pending");
      }

      // Account was rejected by administrator
      else if (
          status === 403 &&
          serverMessage?.toLowerCase().includes("rejected")
      ) {
        setError(
            serverMessage ||
            "Your account registration request was rejected by an administrator."
        );

        setErrorType("rejected");
      }

      // Other 403 responses
      else if (status === 403) {
        setError(
            serverMessage ||
            "You are not authorized to access the system."
        );

        setErrorType("error");
      }

      // Other backend errors
      else if (serverMessage) {
        setError(serverMessage);
        setErrorType("error");
      }

      // Network / unknown error
      else {
        setError(
            "Unable to connect to the server. Please try again later."
        );
        setErrorType("error");
      }
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
            {/* Subtle Ambient Top Glow */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 mb-3 shadow-inner">
                <ShieldCheck size={24} />
              </div>

              <h1 className="text-2xl font-extrabold text-white tracking-tight my-0">
                Welcome Back
              </h1>

              <p className="text-xs text-gray-400 mt-1">
                Sign in to access your LeadSphere workspace
              </p>
            </div>

            {/* Registration Success Banner */}
            {registrationSuccess && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-2xl mb-6 text-xs flex items-center gap-2.5"
                >
                  <CheckCircle2 size={16} className="shrink-0" />

                  <span>
                Account created successfully! Your account is now waiting
                for administrator approval.
              </span>
                </motion.div>
            )}

            {/* Pending Approval Banner */}
            {error && errorType === "pending" && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-2xl mb-6"
                >
                  <div className="flex items-start gap-3">
                    <Clock3
                        size={18}
                        className="shrink-0 mt-0.5 text-amber-400"
                    />

                    <div>
                      <p className="font-semibold text-sm mb-1">
                        Approval Pending
                      </p>

                      <p className="text-xs text-amber-200/80 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                </motion.div>
            )}

            {/* Rejected Banner */}
            {error && errorType === "rejected" && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-6"
                >
                  <div className="flex items-start gap-3">
                    <XCircle
                        size={18}
                        className="shrink-0 mt-0.5 text-red-400"
                    />

                    <div>
                      <p className="font-semibold text-sm mb-1">
                        Registration Rejected
                      </p>

                      <p className="text-xs text-red-300/80 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                </motion.div>
            )}

            {/* Generic Error Banner */}
            {error && errorType === "error" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-2xl mb-6 text-xs text-center"
                >
                  {error}
                </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
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
                      className="w-full bg-[#0b1120] border border-gray-700/70 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition"
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
                      placeholder="••••••••"
                      className="w-full bg-[#0b1120] border border-gray-700/70 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                    <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </span>
                ) : (
                    <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight size={16} />
                </span>
                )}
              </button>
            </form>

            {/* Footer Note */}
            <div className="mt-6 pt-5 border-t border-gray-800/60 text-center text-xs text-gray-400">
              Don't have an account?{" "}
              <Link
                  to="/register"
                  className="text-purple-400 font-semibold hover:text-purple-300 transition"
              >
                Create account
              </Link>
            </div>
          </motion.div>
        </div>
      </Layout>
  );
};

export default Login;