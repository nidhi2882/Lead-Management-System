import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/leadApi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Login = () => {
  const [step, setStep] = useState("roleSelect"); // roleSelect -> credentials -> loading
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep("credentials");
    setError("");
    setEmail("");
    setPassword("");
  };

  const handleBackToRole = () => {
    setStep("roleSelect");
    setSelectedRole(null);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      console.log("LOGIN RESPONSE:", res.data);

      const token = res.data.token;
      const rawRole = res.data.role || "ROLE_SALES";
      const role = rawRole.replace("ROLE_", "");

      // Validate role matches selection
      if (selectedRole === "admin" && role !== "ADMIN") {
        throw new Error("This account is not an admin account");
      }
      if (selectedRole === "sales" && role !== "SALES") {
        throw new Error("This account is not a sales account");
      }

      // Use backend user data
      const user = {
        id: res.data.id,
        email: res.data.email || email,
        name: res.data.name || email.split("@")[0],
        role: role,
      };

      // Context login
      login(token, user);

      // localStorage backup
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name);

      // Route based on role
      if (role === "ADMIN") {
        navigate("/dashboard/admin");
      } else if (role === "SALES") {
        navigate("/dashboard/sales");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e2937] to-[#0f172a] flex items-center justify-center p-4">
      {/* Role Selection Step */}
      {step === "roleSelect" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-2">CRM</h1>
            <p className="text-gray-400">Professional Lead Management System</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => handleRoleSelect("admin")}
              className="cursor-pointer group"
            >
              <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-2 border-purple-500/50 hover:border-purple-400 rounded-3xl p-8 transition-all duration-300 h-full flex flex-col justify-center items-center text-center group-hover:shadow-2xl group-hover:shadow-purple-500/20">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">👨‍💼</div>
                <h2 className="text-2xl font-bold text-white mb-2">Admin</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Full control over leads, sales team, and assignments
                </p>
                <ul className="text-left mt-4 space-y-2 text-xs text-gray-400">
                  <li>✓ Create & manage leads</li>
                  <li>✓ Assign leads to team</li>
                  <li>✓ Create new sales users</li>
                  <li>✓ View all reports</li>
                </ul>
              </div>
            </motion.div>

            {/* Sales Person Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => handleRoleSelect("sales")}
              className="cursor-pointer group"
            >
              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-blue-500/50 hover:border-blue-400 rounded-3xl p-8 transition-all duration-300 h-full flex flex-col justify-center items-center text-center group-hover:shadow-2xl group-hover:shadow-blue-500/20">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📞</div>
                <h2 className="text-2xl font-bold text-white mb-2">Sales Executive</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Manage your assigned leads and close deals
                </p>
                <ul className="text-left mt-4 space-y-2 text-xs text-gray-400">
                  <li>✓ View assigned leads</li>
                  <li>✓ Add follow-ups</li>
                  <li>✓ Update lead status</li>
                  <li>✓ Track conversations</li>
                </ul>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-purple-400 cursor-pointer hover:text-purple-300 font-medium"
              >
                Register here
              </span>
            </p>
          </div>
        </motion.div>
      )}

      {/* Credentials Step */}
      {step === "credentials" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#1e2937] rounded-3xl p-10 shadow-2xl border border-gray-800">
            <button
              onClick={handleBackToRole}
              className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition"
            >
              ← Back
            </button>

            <h2 className="text-3xl font-bold text-white mb-2">
              {selectedRole === "admin" ? "Admin Login" : "Sales Executive Login"}
            </h2>
            <p className="text-gray-400 mb-8">Enter your credentials to continue</p>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-2xl mb-6"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full p-4 rounded-xl bg-[#0f172a] text-white border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full p-4 rounded-xl bg-[#0f172a] text-white border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-semibold transition-all ${
                  selectedRole === "admin"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-blue-600 hover:bg-blue-700"
                } text-white disabled:opacity-70`}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-6">
              No account?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-purple-400 cursor-pointer hover:text-purple-300"
              >
                Register
              </span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Login;