import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/leadApi";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(2); // 1 = Admin, 2 = Sales
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        roleId: Number(roleId),
      });

      alert("Registration successful! Please login.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <div className="w-full max-w-5xl flex rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 p-12 flex-col justify-center">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center text-3xl">
              📊
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-white">CRM</h1>
          </div>

          <h2 className="text-4xl font-semibold text-white leading-tight mb-6">
            Join the Team.<br />Start Closing Deals.
          </h2>
          <p className="text-lg text-white/80 max-w-sm">
            Create your account and begin managing leads with powerful tools.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 bg-[#1e2937] p-10 md:p-16 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-semibold text-white">Create Account</h2>
              <p className="text-gray-400 mt-2">Get started in seconds</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Nidhi Sharma"
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-2xl px-5 py-4 text-white focus:border-purple-500 focus:outline-none"
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                >
                  <option value="1">Admin</option>
                  <option value="2">Sales Executive</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-70 py-4 rounded-2xl font-semibold text-lg transition-all duration-200"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-gray-400 text-sm mt-8">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/")}
                className="text-purple-400 hover:text-purple-500 cursor-pointer font-medium"
              >
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;