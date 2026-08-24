import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import api from "../api/leadApi";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Plus,
  LogOut,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  UserPlus,
  Send,
  Eye,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  // State Management
  const [allLeads, setAllLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("leads");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal States
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showLeadDetailModal, setShowLeadDetailModal] = useState(false);
  const [showAutoAssignModal, setShowAutoAssignModal] = useState(false);

  // Form States
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lead Form
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "NEW",
  });

  // User Form (Admin only)
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    roleId: 2,
  });

  // Assignment Form
  const [assignForm, setAssignForm] = useState({
    assignedUserId: "",
  });

  // Fetch Data
  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = allLeads;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (lead) => (lead.status || "NEW").toUpperCase() === statusFilter.toUpperCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lead) =>
          lead.name?.toLowerCase().includes(query) ||
          lead.email?.toLowerCase().includes(query) ||
          lead.company?.toLowerCase().includes(query)
      );
    }

    setFilteredLeads(filtered);
  }, [allLeads, statusFilter, searchQuery]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get("/leads");
      const leadsData = res.data || res;
      setAllLeads(leadsData);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
      setError("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.get("/users");
      console.log("USERS API RESPONSE:", res.data);
      
      // Handle different response formats
      const usersData = Array.isArray(res.data) ? res.data : (res.data?.data || res);
      
      // CORRECTED FILTER: Check assignedRole.id for roleId 2 (SALES)
      const salesUsers = usersData.filter((u) => {
        // Check assignedRole.id === 2 for SALES role
        const roleId = u.assignedRole?.id;
        
        return roleId === 2;
      });
      
      console.log("Filtered Sales Users:", salesUsers);
      setUsers(salesUsers);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  // Metrics
  const metrics = useMemo(
    () => ({
      totalLeads: allLeads.length,
      newLeads: allLeads.filter((l) => (l.status || "").toUpperCase() === "NEW").length,
      contactedLeads: allLeads.filter(
        (l) => (l.status || "").toUpperCase() === "CONTACTED"
      ).length,
      qualifiedLeads: allLeads.filter(
        (l) => (l.status || "").toUpperCase() === "QUALIFIED"
      ).length,
      totalUsers: users.length,
    }),
    [allLeads, users]
  );

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  // ==================== LEAD HANDLERS ====================

  const handleLeadInputChange = (e) => {
    const { name, value } = e.target;
    setLeadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setError("");

    if (!leadForm.name || !leadForm.email) {
      setError("Name and Email are required");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/leads", {
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phone || null,
        source: leadForm.company || null,
        status: leadForm.status,
      });

      setSuccess("Lead created successfully!");
      setShowAddLeadModal(false);
      setLeadForm({ name: "", email: "", phone: "", company: "", status: "NEW" });
      fetchLeads();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create lead");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Delete this lead permanently?")) return;
    try {
      await api.delete(`/leads/${id}`);
      setSuccess("Lead deleted successfully");
      fetchLeads();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lead");
    }
  };

  const handleAssignLead = async (e) => {
    e.preventDefault();
    if (!assignForm.assignedUserId) {
      setError("Please select a sales person");
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/leads/${selectedLeadId}/assign/${assignForm.assignedUserId}`);

      setSuccess("Lead assigned successfully!");
      setShowAssignModal(false);
      setAssignForm({ assignedUserId: "" });
      fetchLeads();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign lead");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== USER HANDLERS ====================

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setError("");

    if (!userForm.name || !userForm.email || !userForm.password) {
      setError("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/auth/register", {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        roleId: Number(userForm.roleId),
      });

      setSuccess("User created successfully!");
      setShowAddUserModal(false);
      setUserForm({ name: "", email: "", password: "", roleId: 2 });
      fetchUsers();
      fetchLeads();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== AUTO ASSIGNMENT ====================

  const handleAutoAssign = async () => {
  if (users.length === 0) {
    setError("No sales people available for assignment");
    return;
  }

  setSubmitting(true);

  try {
    await api.post("/leads/auto-assign");

    setSuccess("Leads auto-assigned successfully!");
    setShowAutoAssignModal(false);

    fetchLeads();

    setTimeout(() => setSuccess(""), 3000);

  } catch (err) {
    setError(err.response?.data?.message || "Failed to auto-assign leads");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e2937] to-[#0f172a] text-white">
      {/* Header */}
      <div className="bg-[#1e2937]/50 border-b border-gray-800/50 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome, {user?.name || "Admin"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-xl transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-green-500/10 border border-green-500/50 text-green-400 px-6 py-3 mx-6 mt-4 rounded-2xl"
        >
          ✓ {success}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Leads", value: metrics.totalLeads, icon: "📊" },
            { label: "New Leads", value: metrics.newLeads, icon: "✨" },
            { label: "Contacted", value: metrics.contactedLeads, icon: "📞" },
            { label: "Qualified", value: metrics.qualifiedLeads, icon: "✅" },
            { label: "Sales Team", value: metrics.totalUsers, icon: "👥" },
          ].map((metric, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6"
            >
              <div className="text-3xl mb-2">{metric.icon}</div>
              <div className="text-3xl font-bold">{metric.value}</div>
              <div className="text-gray-400 text-sm">{metric.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs & Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
          <div className="flex gap-2 flex-wrap">
            {["leads", "users"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  activeTab === tab
                    ? "bg-purple-600 text-white"
                    : "bg-white/5 hover:bg-white/10 text-gray-400"
                }`}
              >
                {tab === "leads" ? "Leads" : "Sales Team"}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {activeTab === "leads" && (
              <>
                <button
                  onClick={() => setShowAutoAssignModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-600/50 rounded-xl transition"
                >
                  <Send size={18} />
                  Auto Assign
                </button>
                <button
                  onClick={() => {
                    setShowAddLeadModal(true);
                    setError("");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl transition"
                >
                  <Plus size={18} />
                  Add Lead
                </button>
              </>
            )}
            {activeTab === "users" && (
              <button
                onClick={() => {
                  setShowAddUserModal(true);
                  setError("");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl transition"
              >
                <UserPlus size={18} />
                Add User
              </button>
            )}
          </div>
        </div>

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-500" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or company..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#1e2937] border border-gray-800/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-[#1e2937] border border-gray-800/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="NEW">Lead</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
              </select>
            </div>

            {/* Leads Table */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading leads...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No leads found</p>
              </div>
            ) : (
              <div className="bg-[#1e2937]/50 border border-gray-800/50 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0f172a] border-b border-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">Assigned To</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-b border-gray-800/30 hover:bg-white/5 transition"
                        >
                          <td className="px-6 py-4">{lead.name}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{lead.email}</td>
                          <td className="px-6 py-4 text-gray-400 text-sm">{lead.company || "-"}</td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                (lead.status || "NEW").toUpperCase() === "NEW"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : (lead.status || "NEW").toUpperCase() === "CONTACTED"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-green-500/20 text-green-400"
                              }`}
                            >
                              {(lead.status || "NEW").toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {lead.assignedUser?.name || "-"}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedLead(lead);
                                  setSelectedLeadId(lead.id);
                                  setShowLeadDetailModal(true);
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedLeadId(lead.id);
                                  setAssignForm({ assignedUserId: lead.assignedUserId || "" });
                                  setShowAssignModal(true);
                                  setError("");
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition"
                                title="Assign"
                              >
                                <Users size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.length === 0 ? (
              <div className="text-center py-12 col-span-full">
                <p className="text-gray-400">No sales team members yet</p>
              </div>
            ) : (
              users.map((u) => (
                <motion.div
                  key={u.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{u.name}</h3>
                      <p className="text-gray-400 text-sm">{u.email}</p>
                      <div className="mt-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                          {u.assignedRole?.name === "ROLE_SALES" ? "Sales Executive" : u.assignedRole?.name || "User"}
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl">👤</div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800/50">
                    <p className="text-gray-400 text-sm">
                      Assigned Leads:{" "}
                      <span className="text-white font-semibold">
                        {
                          allLeads.filter(
                            (lead) =>
                              lead.assignedUser?.id === u.id || lead.assignedUserId === u.id
                          ).length
                        }
                      </span>
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ==================== MODALS ==================== */}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-[#1e2937] w-full max-w-md rounded-3xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Create New Lead</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmitLead} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={leadForm.name}
                  onChange={handleLeadInputChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@company.com"
                  value={leadForm.email}
                  onChange={handleLeadInputChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={leadForm.phone}
                  onChange={handleLeadInputChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  placeholder="ACME Corp"
                  value={leadForm.company}
                  onChange={handleLeadInputChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Status</label>
                <select
                  name="status"
                  value={leadForm.status}
                  onChange={handleLeadInputChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLeadModal(false);
                    setError("");
                    setLeadForm({ name: "", email: "", phone: "", company: "", status: "NEW" });
                  }}
                  className="flex-1 py-3 border border-gray-700 rounded-xl hover:bg-white/5 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium disabled:opacity-70 transition"
                >
                  {submitting ? "Creating..." : "Create Lead"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Assign Lead Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-[#1e2937] w-full max-w-md rounded-3xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Assign Lead to Sales Person</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                {error}
              </div>
            )}
            {usersLoading ? (
              <div className="text-center py-6">
                <p className="text-gray-400">Loading sales team...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                No sales team members available. Please add a sales person first.
              </div>
            ) : (
              <form onSubmit={handleAssignLead} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Select Sales Person *</label>
                  <select
                    value={assignForm.assignedUserId}
                    onChange={(e) => setAssignForm({ assignedUserId: e.target.value })}
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    required
                  >
                    <option value="">Choose a sales person...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignModal(false);
                      setError("");
                    }}
                    className="flex-1 py-3 border border-gray-700 rounded-xl hover:bg-white/5 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium disabled:opacity-70 transition"
                  >
                    {submitting ? "Assigning..." : "Assign"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-[#1e2937] w-full max-w-md rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-semibold mb-6">Add New Sales Person</h2>
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmitUser} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Rahul Sharma"
                  value={userForm.name}
                  onChange={handleUserInputChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="rahul@company.com"
                  value={userForm.email}
                  onChange={handleUserInputChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={userForm.password}
                  onChange={handleUserInputChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Role</label>
                <select
                  name="roleId"
                  value={userForm.roleId}
                  onChange={handleUserInputChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                >
                  <option value="2">Sales Executive</option>
                  <option value="1">Admin</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setError("");
                    setUserForm({ name: "", email: "", password: "", roleId: 2 });
                  }}
                  className="flex-1 py-3 border border-gray-700 rounded-xl hover:bg-white/5 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium disabled:opacity-70 transition"
                >
                  {submitting ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {showLeadDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-[#1e2937] w-full max-w-md rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-semibold mb-6">{selectedLead.name}</h2>

            <div className="space-y-4">
              <div className="bg-[#0f172a] rounded-2xl p-4 border border-gray-800">
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{selectedLead.email}</p>
              </div>

              <div className="bg-[#0f172a] rounded-2xl p-4 border border-gray-800">
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white font-medium">{selectedLead.phone || "-"}</p>
              </div>

              <div className="bg-[#0f172a] rounded-2xl p-4 border border-gray-800">
                <p className="text-sm text-gray-400">Company</p>
                <p className="text-white font-medium">{selectedLead.company || "-"}</p>
              </div>

              <div className="bg-[#0f172a] rounded-2xl p-4 border border-gray-800">
                <p className="text-sm text-gray-400">Status</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                  {(selectedLead.status || "NEW").toUpperCase()}
                </span>
              </div>

              <div className="bg-[#0f172a] rounded-2xl p-4 border border-gray-800">
                <p className="text-sm text-gray-400">Assigned To</p>
                <p className="text-white font-medium">{selectedLead.assignedUser?.name || "Unassigned"}</p>
              </div>
            </div>

            <button
              onClick={() => setShowLeadDetailModal(false)}
              className="w-full mt-6 py-3 border border-gray-700 rounded-xl hover:bg-white/5 font-medium transition"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Auto Assign Modal */}
      {showAutoAssignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-[#1e2937] w-full max-w-md rounded-3xl p-8"
          >
            <h2 className="text-2xl font-semibold mb-4">Auto-Assign Leads</h2>
            <p className="text-gray-400 mb-6">
              This will automatically assign all unassigned leads to your sales team members.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setShowAutoAssignModal(false);
                  setError("");
                }}
                className="flex-1 py-3 border border-gray-700 rounded-xl hover:bg-white/5 font-medium transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAutoAssign}
                disabled={submitting}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium disabled:opacity-70 transition"
              >
                {submitting ? "Assigning..." : "Proceed"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
