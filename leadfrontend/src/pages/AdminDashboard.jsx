import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import api from "../api/leadApi";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
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
  CheckCircle,
  XCircle,
  Clock3,
  TrendingUp,
  BarChart3,
  Award,
  Clock,
  Target,
  CheckCircle2,
  AlertCircle,
  Calendar,
  RefreshCw,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const AdminDashboard = () => {
  const { user } = useAuth();

  // ==================== STATE MANAGEMENT ====================

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

  // User Form
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

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      const res = await api.get("/analytics/full-report");
      setAnalyticsData(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setAnalyticsError("Failed to load analytics data.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ==================== FETCH DATA ====================

  useEffect(() => {
    fetchLeads();
    fetchUsers();
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalytics();
    }
  }, [activeTab]);

  // ==================== FILTERS ====================

  useEffect(() => {
    let filtered = allLeads;

    if (statusFilter !== "all") {
      filtered = filtered.filter(
          (lead) =>
              (lead.status || "NEW").toUpperCase() ===
              statusFilter.toUpperCase()
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

  // ==================== FETCH LEADS ====================

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

  // ==================== FETCH USERS ====================

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      const res = await api.get("/users");

      console.log("USERS API RESPONSE:", res.data);

      const usersData = Array.isArray(res.data)
          ? res.data
          : res.data?.data || res;

      // Only Sales users belong in the Sales Team section.
      // Backend already prevents public users from becoming Admins.
      const salesUsers = usersData.filter((u) => {
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

  // ==================== METRICS ====================

  const metrics = useMemo(
      () => ({
        totalLeads: allLeads.length,

        newLeads: allLeads.filter(
            (l) => (l.status || "").toUpperCase() === "NEW"
        ).length,

        contactedLeads: allLeads.filter(
            (l) => (l.status || "").toUpperCase() === "CONTACTED"
        ).length,

        qualifiedLeads: allLeads.filter(
            (l) => (l.status || "").toUpperCase() === "QUALIFIED"
        ).length,

        totalUsers: users.length,

        pendingUsers: users.filter(
            (u) => (u.status || "").toUpperCase() === "PENDING"
        ).length,
      }),
      [allLeads, users]
  );

  // ==================== LOGOUT ====================

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

    setLeadForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      setLeadForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "NEW",
      });

      fetchLeads();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
          err.response?.data?.message ||
          "Failed to create lead"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm("Delete this lead permanently?")) {
      return;
    }

    try {
      await api.delete(`/leads/${id}`);

      setSuccess("Lead deleted successfully");

      fetchLeads();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
          err.response?.data?.message ||
          "Failed to delete lead"
      );
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
      await api.put(
          `/leads/${selectedLeadId}/assign/${assignForm.assignedUserId}`
      );

      setSuccess("Lead assigned successfully!");

      setShowAssignModal(false);

      setAssignForm({
        assignedUserId: "",
      });

      fetchLeads();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
          err.response?.data?.message ||
          "Failed to assign lead"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== USER HANDLERS ====================

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;

    setUserForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    setError("");

    if (
        !userForm.name ||
        !userForm.email ||
        !userForm.password
    ) {
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

      setUserForm({
        name: "",
        email: "",
        password: "",
        roleId: 2,
      });

      fetchUsers();
      fetchLeads();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
          err.response?.data?.message ||
          "Failed to create user"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== APPROVE / REJECT USER ====================

  const handleUserStatusUpdate = async (userId, status) => {
    const action =
        status === "APPROVED"
            ? "approve"
            : "reject";

    const confirmed = window.confirm(
        `Are you sure you want to ${action} this user?`
    );

    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.put(`/users/${userId}/status`, {
        status: status,
      });

      setSuccess(
          status === "APPROVED"
              ? "User approved successfully!"
              : "User rejected successfully!"
      );

      // Refresh users so the UI immediately reflects
      // the new status.
      await fetchUsers();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(
          `Failed to ${action} user:`,
          err
      );

      setError(
          err.response?.data?.message ||
          `Failed to ${action} user`
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== AUTO ASSIGNMENT ====================

  const handleAutoAssign = async () => {
    if (users.length === 0) {
      setError(
          "No sales people available for assignment"
      );
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/leads/auto-assign");

      setSuccess(
          "Leads auto-assigned successfully!"
      );

      setShowAutoAssignModal(false);

      fetchLeads();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
          err.response?.data?.message ||
          "Failed to auto-assign leads"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== UI ====================

  return (
      <Layout>
        {/* ==================== PAGE HEADER ==================== */}

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight my-0">
                Admin Dashboard
              </h1>

              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold rounded-full">
              System Control
            </span>
            </div>

            <p className="text-gray-400 text-sm mt-1">
              Welcome back,{" "}
              <span className="text-white font-medium">
              {user?.name || "Admin"}
            </span>
              . Monitor lead flow and manage sales assignments.
            </p>
          </div>
        </div>

        {/* ==================== SUCCESS MESSAGE ==================== */}

        {success && (
            <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="bg-green-500/10 border border-green-500/50 text-green-400 px-6 py-3 mb-6 rounded-2xl"
            >
              ✓ {success}
            </motion.div>
        )}

        {/* ==================== METRICS ==================== */}

        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              {
                label: "Total Leads",
                value: metrics.totalLeads,
                icon: "📊",
              },
              {
                label: "New Leads",
                value: metrics.newLeads,
                icon: "✨",
              },
              {
                label: "Contacted",
                value: metrics.contactedLeads,
                icon: "📞",
              },
              {
                label: "Qualified",
                value: metrics.qualifiedLeads,
                icon: "✅",
              },
              {
                label: "Sales Team",
                value: metrics.totalUsers,
                icon: "👥",
              },
              {
                label: "Pending Approvals",
                value: metrics.pendingUsers,
                icon: "⏳",
              },
            ].map((metric, i) => (
                <motion.div
                    key={i}
                    whileHover={{
                      scale: 1.02,
                    }}
                    className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6"
                >
                  <div className="text-3xl mb-2">
                    {metric.icon}
                  </div>

                  <div className="text-3xl font-bold text-white">
                    {metric.value}
                  </div>

                  <div className="text-gray-400 text-sm">
                    {metric.label}
                  </div>
                </motion.div>
            ))}
          </div>

          {/* ==================== TABS & ACTIONS ==================== */}

          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
            <div className="flex gap-2 flex-wrap">
              {["leads", "users", "analytics"].map((tab) => (
                  <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setSearchQuery("");
                        setStatusFilter("all");
                        setError("");
                      }}
                      className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                          activeTab === tab
                              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                              : "bg-white/5 hover:bg-white/10 text-gray-400"
                      }`}
                  >
                    {tab === "leads"
                        ? "Leads"
                        : tab === "users"
                        ? "Sales Team"
                        : "Analytics"}
                  </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              {activeTab === "leads" && (
                  <>
                    <button
                        onClick={() =>
                            setShowAutoAssignModal(true)
                        }
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

          {/* ==================== LEADS TAB ==================== */}

          {activeTab === "leads" && (
              <div className="space-y-4">
                {/* Search & Filter */}

                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search
                        className="absolute left-3 top-3 text-gray-500"
                        size={20}
                    />

                    <input
                        type="text"
                        placeholder="Search by name, email, or company..."
                        value={searchQuery}
                        onChange={(e) =>
                            setSearchQuery(e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 bg-[#1e2937] border border-gray-800/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <select
                      value={statusFilter}
                      onChange={(e) =>
                          setStatusFilter(e.target.value)
                      }
                      className="px-4 py-3 bg-[#1e2937] border border-gray-800/50 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                  >
                    <option value="all">
                      All Status
                    </option>

                    <option value="NEW">
                      New
                    </option>

                    <option value="CONTACTED">
                      Contacted
                    </option>

                    <option value="QUALIFIED">
                      Qualified
                    </option>

                    <option value="CONVERTED">
                      Converted
                    </option>

                    <option value="LOST">
                      Lost
                    </option>
                  </select>
                </div>

                {/* Leads Table */}

                {loading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">
                        Loading leads...
                      </p>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">
                        No leads found
                      </p>
                    </div>
                ) : (
                    <div className="bg-[#1e2937]/50 border border-gray-800/50 rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#0f172a] border-b border-gray-800/50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold">
                              Name
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold">
                              Email
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold">
                              Company
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold">
                              Status
                            </th>

                            <th className="px-6 py-4 text-left text-sm font-semibold">
                              Assigned To
                            </th>

                            <th className="px-6 py-4 text-right text-sm font-semibold">
                              Actions
                            </th>
                          </tr>
                          </thead>

                          <tbody>
                          {filteredLeads.map((lead) => (
                              <tr
                                  key={lead.id}
                                  className="border-b border-gray-800/30 hover:bg-white/5 transition"
                              >
                                <td className="px-6 py-4">
                                  {lead.name}
                                </td>

                                <td className="px-6 py-4 text-gray-400 text-sm">
                                  {lead.email}
                                </td>

                                <td className="px-6 py-4 text-gray-400 text-sm">
                                  {lead.company || "-"}
                                </td>

                                <td className="px-6 py-4">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    (lead.status || "NEW").toUpperCase() === "NEW"
                                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                        : (lead.status || "NEW").toUpperCase() === "CONTACTED"
                                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                            : (lead.status || "NEW").toUpperCase() === "QUALIFIED"
                                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                                : (lead.status || "NEW").toUpperCase() === "CONVERTED"
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                }`}
                            >
                              {(lead.status || "NEW").toUpperCase()}
                            </span>
                                </td>

                                <td className="px-6 py-4 text-gray-400 text-sm">
                                  {lead.assignedUser?.name ||
                                      "-"}
                                </td>

                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                          setSelectedLead(lead);
                                          setSelectedLeadId(
                                              lead.id
                                          );
                                          setShowLeadDetailModal(
                                              true
                                          );
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition"
                                        title="View Details"
                                    >
                                      <Eye size={18} />
                                    </button>

                                    <button
                                        onClick={() => {
                                          setSelectedLeadId(
                                              lead.id
                                          );

                                          setAssignForm({
                                            assignedUserId:
                                                lead.assignedUserId ||
                                                "",
                                          });

                                          setShowAssignModal(
                                              true
                                          );

                                          setError("");
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition"
                                        title="Assign"
                                    >
                                      <Users size={18} />
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDeleteLead(
                                                lead.id
                                            )
                                        }
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

          {/* ==================== USERS TAB ==================== */}

          {activeTab === "users" && (
              <div className="space-y-6">
                {/* Pending Approval Notice */}

                {metrics.pendingUsers > 0 && (
                    <motion.div
                        initial={{
                          opacity: 0,
                          y: -10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3"
                    >
                      <Clock3
                          size={20}
                          className="text-amber-400 shrink-0"
                      />

                      <div>
                        <p className="text-amber-300 font-semibold text-sm">
                          {metrics.pendingUsers} user
                          {metrics.pendingUsers !== 1
                              ? "s"
                              : ""}{" "}
                          waiting for approval
                        </p>

                        <p className="text-amber-200/70 text-xs mt-1">
                          Review the pending registration
                          requests below.
                        </p>
                      </div>
                    </motion.div>
                )}

                {/* Loading */}

                {usersLoading ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">
                        Loading sales team...
                      </p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">
                        No sales team members yet
                      </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.map((u) => {
                        const userStatus = (
                            u.status || "PENDING"
                        ).toUpperCase();

                        const isPending =
                            userStatus === "PENDING";

                        const isApproved =
                            userStatus === "APPROVED";

                        const isRejected =
                            userStatus === "REJECTED";

                        const assignedLeads =
                            allLeads.filter(
                                (lead) =>
                                    lead.assignedUser?.id ===
                                    u.id ||
                                    lead.assignedUserId === u.id
                            ).length;

                        return (
                            <motion.div
                                key={u.id}
                                whileHover={{
                                  scale: 1.02,
                                }}
                                className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6"
                            >
                              {/* User Information */}

                              <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                  <h3 className="text-lg font-semibold text-white">
                                    {u.name}
                                  </h3>

                                  <p className="text-gray-400 text-sm truncate">
                                    {u.email}
                                  </p>

                                  <div className="mt-4">
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                              {u.assignedRole?.name ===
                              "ROLE_SALES"
                                  ? "Sales Executive"
                                  : u.assignedRole?.name ||
                                  "User"}
                            </span>
                                  </div>
                                </div>

                                <div className="text-2xl">
                                  👤
                                </div>
                              </div>

                              {/* Account Status */}

                              <div className="mt-4">
                                <p className="text-xs text-gray-500 mb-2">
                                  Account Status
                                </p>

                                {isPending && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-full text-xs font-semibold">
                            <Clock3 size={13} />
                            PENDING
                          </span>
                                )}

                                {isApproved && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/20 rounded-full text-xs font-semibold">
                            <CheckCircle size={13} />
                            APPROVED
                          </span>
                                )}

                                {isRejected && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/20 rounded-full text-xs font-semibold">
                            <XCircle size={13} />
                            REJECTED
                          </span>
                                )}
                              </div>

                              {/* Assigned Leads */}

                              <div className="mt-4 pt-4 border-t border-gray-800/50">
                                <p className="text-gray-400 text-sm">
                                  Assigned Leads:{" "}
                                  <span className="text-white font-semibold">
                            {assignedLeads}
                          </span>
                                </p>
                              </div>

                              {/* Approval Actions */}

                              {isPending && (
                                  <div className="mt-5 pt-4 border-t border-gray-800/50 flex gap-2">
                                    <button
                                        onClick={() =>
                                            handleUserStatusUpdate(
                                                u.id,
                                                "APPROVED"
                                            )
                                        }
                                        disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 text-green-400 rounded-xl text-sm font-medium transition disabled:opacity-50"
                                    >
                                      <CheckCircle
                                          size={16}
                                      />
                                      Approve
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleUserStatusUpdate(
                                                u.id,
                                                "REJECTED"
                                            )
                                        }
                                        disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 rounded-xl text-sm font-medium transition disabled:opacity-50"
                                    >
                                      <XCircle size={16} />
                                      Reject
                                    </button>
                                  </div>
                              )}
                            </motion.div>
                        );
                      })}
                    </div>
                )}
              </div>
          )}

          {/* ==================== ANALYTICS TAB ==================== */}

          {activeTab === "analytics" && (
              <div className="space-y-8">
                {/* Header & Refresh */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e2937]/50 border border-gray-800/50 p-6 rounded-2xl">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <TrendingUp className="text-purple-400" size={24} />
                      Executive Analytics & Lead Intelligence
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                      Real-time metrics, conversion funnel, sales performance leaderboard & follow-up health.
                    </p>
                  </div>

                  <button
                      onClick={fetchAnalytics}
                      disabled={analyticsLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-xl transition text-sm font-medium disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={analyticsLoading ? "animate-spin" : ""} />
                    Refresh Analytics
                  </button>
                </div>

                {analyticsLoading ? (
                    <div className="text-center py-16 bg-[#1e2937]/30 border border-gray-800/50 rounded-2xl">
                      <div className="inline-block animate-spin text-purple-400 mb-3">
                        <RefreshCw size={32} />
                      </div>
                      <p className="text-gray-400 font-medium">Loading executive analytics...</p>
                    </div>
                ) : analyticsError ? (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-2xl text-center">
                      <AlertCircle size={32} className="mx-auto mb-2 text-red-400" />
                      <p className="font-semibold">{analyticsError}</p>
                      <button
                          onClick={fetchAnalytics}
                          className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-sm font-medium transition"
                      >
                        Try Again
                      </button>
                    </div>
                ) : analyticsData ? (
                    <>
                      {/* KPI Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6 relative overflow-hidden">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Conversion Rate</p>
                              <h3 className="text-3xl font-extrabold text-white mt-2">{analyticsData.overview?.conversionRate || 0}%</h3>
                            </div>
                            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                              <Target size={24} />
                            </div>
                          </div>
                          <div className="mt-4 w-full bg-gray-800 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(analyticsData.overview?.conversionRate || 0, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">Converted ({analyticsData.overview?.convertedLeads || 0}) / Total ({analyticsData.overview?.totalLeads || 0})</p>
                        </div>

                        <div className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Converted Leads</p>
                              <h3 className="text-3xl font-extrabold text-white mt-2">{analyticsData.overview?.convertedLeads || 0}</h3>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                              <CheckCircle2 size={24} />
                            </div>
                          </div>
                          <div className="mt-4 flex justify-between text-xs text-gray-400">
                            <span>Qualified: {analyticsData.overview?.qualifiedLeads || 0}</span>
                            <span>Lost: {analyticsData.overview?.lostLeads || 0}</span>
                          </div>
                        </div>

                        <div className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Sales Team</p>
                              <h3 className="text-3xl font-extrabold text-white mt-2">{analyticsData.overview?.totalSalesUsers || 0}</h3>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                              <Users size={24} />
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-4">
                            Pending Approvals:{" "}
                            <span className={`font-semibold ${analyticsData.overview?.pendingApprovals > 0 ? "text-amber-400" : "text-gray-300"}`}>
                              {analyticsData.overview?.pendingApprovals || 0}
                            </span>
                          </p>
                        </div>

                        <div className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Follow-ups</p>
                              <h3 className="text-3xl font-extrabold text-white mt-2">{analyticsData.followUps?.totalFollowUps || 0}</h3>
                            </div>
                            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
                              <Clock size={24} />
                            </div>
                          </div>
                          <div className="mt-4 flex justify-between text-xs text-gray-400">
                            <span className="text-emerald-400 font-medium">Upcoming: {analyticsData.followUps?.upcomingFollowUps || 0}</span>
                            <span className="text-rose-400 font-medium">Overdue: {analyticsData.followUps?.overdueFollowUps || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Charts Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Chart 1: Lead Status Distribution Bar Chart */}
                        <div className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <BarChart3 className="text-purple-400" size={20} />
                                Lead Status Distribution
                              </h3>
                              <p className="text-xs text-gray-400">Breakdown of leads by current status stage</p>
                            </div>
                          </div>
                          <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analyticsData.leadStatusBreakdown || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
                                <XAxis dataKey="label" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "0.75rem", color: "#F9FAFB" }}
                                    formatter={(value, name, props) => [`${value} Leads (${props.payload.percentage}%)`, "Count"]}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                  {(analyticsData.leadStatusBreakdown || []).map((entry, index) => {
                                    const colors = {
                                      NEW: "#3B82F6",
                                      CONTACTED: "#8B5CF6",
                                      QUALIFIED: "#F59E0B",
                                      CONVERTED: "#10B981",
                                      LOST: "#EF4444",
                                    };
                                    return <Cell key={`cell-${index}`} fill={colors[entry.status] || "#8B5CF6"} />;
                                  })}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Chart 2: Lead Funnel Breakdown */}
                        <div className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6">
                          <div className="flex justify-between items-center mb-6">
                            <div>
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <PieChartIcon className="text-purple-400" size={20} />
                                Pipeline Stage Breakdown
                              </h3>
                              <p className="text-xs text-gray-400">Relative share & count across pipeline</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            {(analyticsData.leadStatusBreakdown || []).map((item) => {
                              const colors = {
                                NEW: "bg-blue-500 text-blue-400",
                                CONTACTED: "bg-purple-500 text-purple-400",
                                QUALIFIED: "bg-amber-500 text-amber-400",
                                CONVERTED: "bg-emerald-500 text-emerald-400",
                                LOST: "bg-rose-500 text-rose-400",
                              };
                              const bgDot = colors[item.status]?.split(" ")[0] || "bg-purple-500";
                              const textColor = colors[item.status]?.split(" ")[1] || "text-purple-400";

                              return (
                                  <div key={item.status} className="bg-[#0f172a]/60 border border-gray-800/60 p-3.5 rounded-xl">
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${bgDot}`}></span>
                                        <span className="text-sm font-semibold text-gray-200">{item.label}</span>
                                      </div>
                                      <div className="text-right">
                                        <span className="text-sm font-bold text-white">{item.count}</span>
                                        <span className={`text-xs ml-2 ${textColor}`}>({item.percentage}%)</span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                                      <div
                                          className={`h-2 rounded-full ${bgDot} transition-all duration-500`}
                                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Sales Performance Leaderboard Table */}
                      <div className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6 overflow-hidden">
                        <div className="flex justify-between items-center mb-6">
                          <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <Award className="text-amber-400" size={20} />
                              Sales Team Performance Leaderboard
                            </h3>
                            <p className="text-xs text-gray-400">Assigned leads, conversion results, and conversion rates per sales representative</p>
                          </div>
                        </div>

                        {(analyticsData.salesPerformance || []).length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">
                              No sales team performance metrics available.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-left">
                                <thead className="bg-[#0f172a] text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-800">
                                <tr>
                                  <th className="py-3.5 px-4">Sales Representative</th>
                                  <th className="py-3.5 px-4 text-center">Assigned Leads</th>
                                  <th className="py-3.5 px-4 text-center">Converted</th>
                                  <th className="py-3.5 px-4 text-center">Lost</th>
                                  <th className="py-3.5 px-4">Conversion Rate</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/60 text-sm">
                                {(analyticsData.salesPerformance || []).map((salesperson) => (
                                    <tr key={salesperson.userId} className="hover:bg-white/[0.02] transition">
                                      <td className="py-4 px-4 font-medium text-white">
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                                            {salesperson.userName ? salesperson.userName.charAt(0).toUpperCase() : "S"}
                                          </div>
                                          <div>
                                            <div className="text-white font-semibold">{salesperson.userName}</div>
                                            <div className="text-gray-400 text-xs">{salesperson.userEmail}</div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4 px-4 text-center text-gray-200 font-semibold">{salesperson.assignedLeads}</td>
                                      <td className="py-4 px-4 text-center">
                                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
                                          {salesperson.convertedLeads}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4 text-center">
                                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-xs font-semibold">
                                          {salesperson.lostLeads}
                                        </span>
                                      </td>
                                      <td className="py-4 px-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-24 bg-gray-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-emerald-400 h-2 rounded-full"
                                                style={{ width: `${Math.min(salesperson.conversionRate || 0, 100)}%` }}
                                            ></div>
                                          </div>
                                          <span className="text-xs font-bold text-purple-300">{salesperson.conversionRate}%</span>
                                        </div>
                                      </td>
                                    </tr>
                                ))}
                                </tbody>
                              </table>
                            </div>
                        )}
                      </div>

                      {/* Follow-Up Activity Breakdown */}
                      <div className="bg-[#1e2937] border border-gray-800/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Calendar className="text-indigo-400" size={20} />
                          Follow-Up Activity & Schedule Health
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-[#0f172a]/60 border border-gray-800/60 p-4 rounded-xl text-center">
                            <p className="text-xs text-gray-400 font-medium">Total Follow-Ups</p>
                            <p className="text-2xl font-bold text-white mt-1">{analyticsData.followUps?.totalFollowUps || 0}</p>
                          </div>
                          <div className="bg-[#0f172a]/60 border border-gray-800/60 p-4 rounded-xl text-center">
                            <p className="text-xs text-emerald-400 font-medium">Upcoming / Scheduled</p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">{analyticsData.followUps?.upcomingFollowUps || 0}</p>
                          </div>
                          <div className="bg-[#0f172a]/60 border border-gray-800/60 p-4 rounded-xl text-center">
                            <p className="text-xs text-rose-400 font-medium">Overdue</p>
                            <p className="text-2xl font-bold text-rose-400 mt-1">{analyticsData.followUps?.overdueFollowUps || 0}</p>
                          </div>
                          <div className="bg-[#0f172a]/60 border border-gray-800/60 p-4 rounded-xl text-center">
                            <p className="text-xs text-blue-400 font-medium">Logged Notes</p>
                            <p className="text-2xl font-bold text-blue-400 mt-1">{analyticsData.followUps?.completedFollowUps || 0}</p>
                          </div>
                        </div>
                      </div>
                    </>
                ) : null}
              </div>
          )}
        </div>

        {/* ==================== MODALS ==================== */}

        {/* ==================== ADD LEAD MODAL ==================== */}

        {showAddLeadModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <motion.div
                  initial={{
                    scale: 0.95,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="bg-[#1e2937] w-full max-w-md rounded-3xl p-8"
              >
                <h2 className="text-2xl font-semibold mb-6">
                  Create New Lead
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                      {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmitLead}
                    className="space-y-4"
                >
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Full Name *
                    </label>

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
                    <label className="block text-sm text-gray-400 mb-2">
                      Email *
                    </label>

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
                    <label className="block text-sm text-gray-400 mb-2">
                      Phone
                    </label>

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
                    <label className="block text-sm text-gray-400 mb-2">
                      Company
                    </label>

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
                    <label className="block text-sm text-gray-400 mb-2">
                      Status
                    </label>

                    <select
                        name="status"
                        value={leadForm.status}
                        onChange={handleLeadInputChange}
                        className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="NEW">
                        NEW
                      </option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => {
                          setShowAddLeadModal(false);
                          setError("");

                          setLeadForm({
                            name: "",
                            email: "",
                            phone: "",
                            company: "",
                            status: "NEW",
                          });
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
                      {submitting
                          ? "Creating..."
                          : "Create Lead"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
        )}

        {/* ==================== ASSIGN LEAD MODAL ==================== */}

        {showAssignModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <motion.div
                  initial={{
                    scale: 0.95,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="bg-[#1e2937] w-full max-w-md rounded-3xl p-8"
              >
                <h2 className="text-2xl font-semibold mb-6">
                  Assign Lead to Sales Person
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                      {error}
                    </div>
                )}

                {usersLoading ? (
                    <div className="text-center py-6">
                      <p className="text-gray-400">
                        Loading sales team...
                      </p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                      No sales team members available.
                      Please add a sales person first.
                    </div>
                ) : (
                    <form
                        onSubmit={handleAssignLead}
                        className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          Select Sales Person *
                        </label>

                        <select
                            value={
                              assignForm.assignedUserId
                            }
                            onChange={(e) =>
                                setAssignForm({
                                  assignedUserId:
                                  e.target.value,
                                })
                            }
                            className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                            required
                        >
                          <option value="">
                            Choose a sales person...
                          </option>

                          {users
                              .filter(
                                  (u) =>
                                      (
                                          u.status || "PENDING"
                                      ).toUpperCase() ===
                                      "APPROVED"
                              )
                              .map((u) => (
                                  <option
                                      key={u.id}
                                      value={u.id}
                                  >
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
                          {submitting
                              ? "Assigning..."
                              : "Assign"}
                        </button>
                      </div>
                    </form>
                )}
              </motion.div>
            </div>
        )}

        {/* ==================== ADD USER MODAL ==================== */}

        {showAddUserModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <motion.div
                  initial={{
                    scale: 0.95,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="bg-[#1e2937] w-full max-w-md rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-semibold mb-6">
                  Add New Sales Person
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl mb-6 text-sm">
                      {error}
                    </div>
                )}

                <form
                    onSubmit={handleSubmitUser}
                    className="space-y-4"
                >
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Full Name *
                    </label>

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
                    <label className="block text-sm text-gray-400 mb-2">
                      Email *
                    </label>

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
                    <label className="block text-sm text-gray-400 mb-2">
                      Password *
                    </label>

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
                    <label className="block text-sm text-gray-400 mb-2">
                      Role
                    </label>

                    <input
                        type="text"
                        value="Sales Executive"
                        readOnly
                        disabled
                        className="w-full bg-[#0f172a]/60 border border-gray-700/60 rounded-xl px-4 py-3 text-gray-300 cursor-not-allowed font-medium"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => {
                          setShowAddUserModal(false);
                          setError("");

                          setUserForm({
                            name: "",
                            email: "",
                            password: "",
                            roleId: 2,
                          });
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
                      {submitting
                          ? "Creating..."
                          : "Create User"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
        )}

        {/* ==================== LEAD DETAIL MODAL ==================== */}

        {showLeadDetailModal &&
            selectedLead && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                  <motion.div
                      initial={{
                        scale: 0.95,
                      }}
                      animate={{
                        scale: 1,
                      }}
                      className="bg-[#1e2937] w-full max-w-md rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
                  >
                    <h2 className="text-2xl font-semibold mb-6">
                      {selectedLead.name}
                    </h2>

                    <div className="space-y-4">
                      <div className="bg-[#0f172a] rounded-2xl p-4 border border-gray-800">
                        <p className="text-sm text-gray-400">
                          Email
                        </p>

                        <p className="text-white font-medium">
                          {selectedLead.email}
                        </p>
                      </div>

                      <div className="bg-[#0f172a] rounded-2xl p-4 border border-gray-800">
                        <p className="text-sm text-gray-400">
                          Phone
                        </p>

                        <p className="text-white font-medium">
                          {selectedLead.phone || "-"}
                        </p>
                      </div>

                      <div className="bg-[#0f172a] rounded-2xl p-4 border border-gray-800">
                        <p className="text-sm text-gray-400">
                          Company
                        </p>

                        <p className="text-white font-medium">
                          {selectedLead.company || "-"}
                        </p>
                      </div>

                      <div className="bg-[#0f172a] rounded-2xl p-4 border border-gray-800">
                        <p className="text-sm text-gray-400">
                          Status
                        </p>

                        <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                    {(
                        selectedLead.status ||
                        "NEW"
                    ).toUpperCase()}
                  </span>
                      </div>

                      <div className="bg-[#0f172a] rounded-2xl p-4 border border-gray-800">
                        <p className="text-sm text-gray-400">
                          Assigned To
                        </p>

                        <p className="text-white font-medium">
                          {selectedLead.assignedUser
                                  ?.name ||
                              "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <button
                        onClick={() =>
                            setShowLeadDetailModal(false)
                        }
                        className="w-full mt-6 py-3 border border-gray-700 rounded-xl hover:bg-white/5 font-medium transition"
                    >
                      Close
                    </button>
                  </motion.div>
                </div>
            )}

        {/* ==================== AUTO ASSIGN MODAL ==================== */}

        {showAutoAssignModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <motion.div
                  initial={{
                    scale: 0.95,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  className="bg-[#1e2937] w-full max-w-md rounded-3xl p-8"
              >
                <h2 className="text-2xl font-semibold mb-4">
                  Auto-Assign Leads
                </h2>

                <p className="text-gray-400 mb-6">
                  This will automatically assign all
                  unassigned leads to your approved sales
                  team members.
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
                    {submitting
                        ? "Assigning..."
                        : "Proceed"}
                  </button>
                </div>
              </motion.div>
            </div>
        )}
      </Layout>
  );
};

export default AdminDashboard;