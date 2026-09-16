import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import api from "../api/leadApi";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { LogOut, Search, Filter, Eye, MessageSquare, CheckCircle } from "lucide-react";

const SalesDashboard = () => {
  const { user } = useAuth();

  // State Management
  const [myLeads, setMyLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leadFollowUps, setLeadFollowUps] = useState([]);
const [followUpsLoading, setFollowUpsLoading] = useState(false);

  // Modal States
  const [showLeadDetailModal, setShowLeadDetailModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Form States
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Status Modal Extended States
  const [targetStatus, setTargetStatus] = useState("");
  const [lossCategory, setLossCategory] = useState("Price / Budget");
  const [lossNotes, setLossNotes] = useState("");

  // Follow-up Form
  const [followUpForm, setFollowUpForm] = useState({
    notes: "",
    followupDate: "",
  });

  // Status Form
  const [statusForm, setStatusForm] = useState({
    status: "",
  });

  // ✅ IMPROVED: Get user info from context first, then localStorage as fallback
  const currentUserId = user?.id || localStorage.getItem("userId");
  const currentUserEmail = user?.email || localStorage.getItem("userEmail");
  const currentUserName = user?.name || localStorage.getItem("userName");

  console.log("🔍 Current user info:", { currentUserId, currentUserEmail, currentUserName });

  // Fetch Leads
  useEffect(() => {
    fetchLeads();
  }, [currentUserId, currentUserEmail]); // Re-fetch if user changes

  // Apply filters and search
  useEffect(() => {
    let filtered = myLeads;

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
          lead.source?.toLowerCase().includes(query) // Changed from company to source (matches API)
      );
    }

    setFilteredLeads(filtered);
  }, [myLeads, statusFilter, searchQuery]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      console.log("📡 Fetching leads...");
      
      const res = await api.get("/leads");
      const leadsData = res.data || res;

      console.log("✅ API response received:", leadsData.length, "total leads");

      if (!Array.isArray(leadsData)) {
        throw new Error("Invalid response format - expected array of leads");
      }

      // ✅ IMPROVED: Better filtering with detailed logging
      const assignedLeads = leadsData.filter((lead) => {
        const leadAssignedId = String(lead.assignedUser?.id);
        const leadAssignedEmail = lead.assignedUser?.email;
        const currentIdStr = String(currentUserId);

        const isAssignedByID = leadAssignedId === currentIdStr;
        const isAssignedByEmail = leadAssignedEmail === currentUserEmail;
        const isAssigned = isAssignedByID || isAssignedByEmail;

        if (isAssigned) {
          console.log("✓ Lead assigned:", lead.name, "→", {
            leadUserId: leadAssignedId,
            currentUserId: currentIdStr,
            leadUserEmail: leadAssignedEmail,
            currentUserEmail,
            matchedBy: isAssignedByID ? "ID" : "EMAIL"
          });
        }

        return isAssigned;
      });

      console.log("📊 Filtered result:", assignedLeads.length, "assigned leads");
      setMyLeads(assignedLeads);
      
      // ✅ NEW: Show helpful message if no leads assigned
      if (assignedLeads.length === 0) {
        console.warn("⚠️ No leads assigned to this user");
        setError("No leads assigned to you yet. Please contact your admin to assign leads.");
      } else {
        setError(""); // Clear previous errors
      }
    } catch (err) {
      console.error("❌ Failed to fetch leads:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to load leads";
      setError(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const metrics = useMemo(
    () => ({
      totalLeads: myLeads.length,
      newLeads: myLeads.filter((l) => (l.status || "NEW").toUpperCase() === "NEW").length,
      contactedLeads: myLeads.filter(
        (l) => (l.status || "").toUpperCase() === "CONTACTED"
      ).length,
      qualifiedLeads: myLeads.filter((l) => (l.status || "").toUpperCase() === "QUALIFIED")
        .length,
      totalFollowUps: myLeads.reduce((sum, lead) => sum + (lead.followUps?.length || 0), 0),
    }),
    [myLeads]
  );

  // Logout
  const handleLogout = () => {
    console.log("🚪 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    window.location.href = "/";
  };

  // ==================== FOLLOW-UP HANDLERS ====================

  const handleAddFollowUp = async (e) => {
  e.preventDefault();

  if (!followUpForm.notes || !followUpForm.followupDate) {
    setError("Please fill all follow-up details");
    return;
  }

  setSubmitting(true);

  try {
    await api.post("/followups", {
      note: followUpForm.notes,
      nextFollowUpDate: followUpForm.followupDate,
      lead: {
        id: selectedLeadId
      }
    });

    setSuccess("Follow-up added successfully!");
    setShowFollowUpModal(false);

    setFollowUpForm({
      notes: "",
      followupDate: "",
    });

    fetchLeads();

    setTimeout(() => setSuccess(""), 3000);

  } catch (err) {
    setError(err.response?.data?.message || "Failed to add follow-up");
  } finally {
    setSubmitting(false);
  }
};

  // ==================== STATUS HANDLERS ====================

  const getAvailableStatuses = (currentStatus) => {
    const statusUpper = (currentStatus || "NEW").toUpperCase();
    switch (statusUpper) {
      case "NEW":
        return ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];
      case "CONTACTED":
        return ["CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];
      case "QUALIFIED":
        return ["QUALIFIED", "CONVERTED", "LOST"];
      case "CONVERTED":
        return ["CONVERTED", "LOST"];
      case "LOST":
        return ["LOST", "CONTACTED", "NEW"];
      default:
        return ["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST"];
    }
  };

  const handleUpdateStatus = async (leadId, newStatus, reason = "") => {
    try {
      setError("");
      const payload = { status: newStatus };
      if (newStatus === "LOST" && reason) {
        payload.lossReason = reason;
      }

      await api.patch(`/leads/${leadId}`, payload);

      setSuccess(`Status updated to ${newStatus}!`);
      setShowStatusModal(false);
      setTargetStatus("");
      setLossCategory("Price / Budget");
      setLossNotes("");
      fetchLeads();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleOpenLeadDetail = async (lead) => {
  setSelectedLead(lead);
  setSelectedLeadId(lead.id);
  setShowLeadDetailModal(true);
  setError("");

  try {
    setFollowUpsLoading(true);

    const res = await api.get(`/followups/lead/${lead.id}`);
    setLeadFollowUps(res.data || []);

  } catch (err) {
    console.error("Failed to load followups", err);
    setLeadFollowUps([]);
  } finally {
    setFollowUpsLoading(false);
  }
};

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e2937] to-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your leads...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-white tracking-tight my-0">Sales Workspace</h1>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
              My Assigned Pipeline
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Welcome back, <span className="text-white font-medium">{currentUserName || "Sales Executive"}</span>. Track client conversations and manage follow-ups.
          </p>
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

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-3 mx-6 mt-4 rounded-2xl flex items-start gap-3"
        >
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6"
          >
            <div>
              <p className="text-gray-400 text-sm">Total Leads</p>
              <p className="text-3xl font-bold text-white mt-2">{metrics.totalLeads}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6"
          >
            <div>
              <p className="text-gray-400 text-sm">New</p>
              <p className="text-3xl font-bold text-yellow-400 mt-2">{metrics.newLeads}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6"
          >
            <div>
              <p className="text-gray-400 text-sm">Contacted</p>
              <p className="text-3xl font-bold text-blue-400 mt-2">{metrics.contactedLeads}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6"
          >
            <div>
              <p className="text-gray-400 text-sm">Qualified</p>
              <p className="text-3xl font-bold text-green-400 mt-2">{metrics.qualifiedLeads}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6"
          >
            <div>
              <p className="text-gray-400 text-sm">Follow-ups</p>
              <p className="text-3xl font-bold text-purple-400 mt-2">{metrics.totalFollowUps}</p>
            </div>
          </motion.div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6 flex-col md:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Leads Table */}
        {myLeads.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center">
            <p className="text-gray-400 mb-4">No leads assigned to you yet</p>
            <button
              onClick={() => location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Company</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((lead, idx) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30 transition"
                    >
                      <td className="px-6 py-4 text-white">{lead.name}</td>
                      <td className="px-6 py-4 text-gray-400">{lead.email}</td>
                      <td className="px-6 py-4 text-gray-400">{lead.source || "-"}</td>
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
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenLeadDetail(lead)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition"
                            title="View details"
                          >
                            <Eye size={18} className="text-blue-400" />
                          </button>
                          <button
  onClick={() => {
    setSelectedLeadId(lead.id);
    setSelectedLead(lead);
    setShowFollowUpModal(true);
    setError("");
  }}
  className="p-2 hover:bg-green-500/20 rounded-lg transition"
  title="Add Follow Up"
>
  <MessageSquare size={18} className="text-green-400" />
</button>
                          <button
                            onClick={() => {
                              setSelectedLeadId(lead.id);
                              setShowStatusModal(true);
                            }}
                            className="p-2 hover:bg-purple-500/20 rounded-lg transition"
                            title="Update status"
                          >
                            <CheckCircle size={18} className="text-purple-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Lead Detail Modal - Truncated for brevity (same as original) */}
      {showLeadDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-slate-800 w-full max-w-md rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-semibold mb-6 text-white">{selectedLead.name}</h2>

            <div className="space-y-4">
              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-medium">{selectedLead.email}</p>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white font-medium">{selectedLead.phone || "-"}</p>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
                <p className="text-sm text-gray-400">Company</p>
                <p className="text-white font-medium">{selectedLead.source || "-"}</p>
              </div>

              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
                <p className="text-sm text-gray-400">Status</p>
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                  {(selectedLead.status || "NEW").toUpperCase()}
                </span>
              </div>

              {selectedLead.lossReason && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
                  <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider mb-1">Reason for Loss</p>
                  <p className="text-rose-200 text-sm">{selectedLead.lossReason}</p>
                </div>
              )}

              <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700">
  <p className="text-sm text-gray-400 mb-3">Follow-ups</p>

  {followUpsLoading ? (
    <p className="text-gray-400">Loading...</p>
  ) : leadFollowUps.length === 0 ? (
    <p className="text-gray-500">No follow-ups yet</p>
  ) : (
    <div className="space-y-3">
      {leadFollowUps.map((item) => (
        <div
          key={item.id}
          className="border border-slate-700 rounded-xl p-3"
        >
          <p className="text-white text-sm">{item.note}</p>

          <p className="text-xs text-gray-400 mt-2">
            {new Date(item.nextFollowUpDate).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )}
</div>
            </div>

            <button
              onClick={() => setShowLeadDetailModal(false)}
              className="w-full mt-6 py-3 border border-slate-700 rounded-xl hover:bg-white/5 font-medium transition text-white"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedLeadId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-slate-800 w-full max-w-md rounded-3xl p-8 border border-slate-700"
          >
            <h2 className="text-2xl font-semibold mb-2 text-white">Update Lead Status</h2>
            <p className="text-sm text-gray-400 mb-6">
              Current Status: <span className="font-semibold text-blue-400">{(selectedLead?.status || "NEW").toUpperCase()}</span>
            </p>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            {targetStatus === "LOST" ? (
              /* Loss Reason Sub-Form */
              <div className="space-y-4">
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-300">
                  ⚠️ Marking a lead as <strong>LOST</strong> requires documenting a reason for loss.
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={lossCategory}
                    onChange={(e) => setLossCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 focus:outline-none"
                  >
                    <option value="Price / Budget">Price / Budget</option>
                    <option value="Chose Competitor">Chose Competitor</option>
                    <option value="Not Interested / Bad Fit">Not Interested / Bad Fit</option>
                    <option value="Unresponsive / Ghosted">Unresponsive / Ghosted</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Details about why lead was lost..."
                    value={lossNotes}
                    onChange={(e) => setLossNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTargetStatus("")}
                    className="w-1/2 py-3 border border-slate-700 rounded-xl text-gray-300 hover:bg-white/5 transition font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const fullReason = lossCategory + (lossNotes.trim() ? ` - ${lossNotes.trim()}` : "");
                      handleUpdateStatus(selectedLeadId, "LOST", fullReason);
                    }}
                    className="w-1/2 py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-white font-medium transition"
                  >
                    Confirm Lost
                  </button>
                </div>
              </div>
            ) : (
              /* Status Selection Buttons */
              <div className="space-y-3 mb-6">
                {getAvailableStatuses(selectedLead?.status).map((status) => {
                  const isCurrent = (selectedLead?.status || "NEW").toUpperCase() === status;
                  return (
                    <button
                      key={status}
                      disabled={isCurrent}
                      onClick={() => {
                        if (status === "LOST") {
                          setTargetStatus("LOST");
                        } else {
                          handleUpdateStatus(selectedLeadId, status);
                        }
                      }}
                      className={`w-full px-4 py-3 rounded-xl font-medium transition text-left flex items-center justify-between ${
                        isCurrent
                          ? "bg-slate-700/50 text-gray-500 cursor-not-allowed border border-slate-700"
                          : "bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {status === "NEW" && "🆕"}
                        {status === "CONTACTED" && "📞"}
                        {status === "QUALIFIED" && "✅"}
                        {status === "CONVERTED" && "🎉"}
                        {status === "LOST" && "❌"}
                        {status}
                      </span>
                      {isCurrent && <span className="text-xs bg-slate-600 text-gray-300 px-2 py-0.5 rounded-md">Current</span>}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    setTargetStatus("");
                    setError("");
                  }}
                  className="w-full mt-4 py-3 border border-slate-700 rounded-xl hover:bg-white/5 font-medium transition text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
      {showFollowUpModal && selectedLead && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className="bg-slate-800 w-full max-w-md rounded-3xl p-8"
    >
      <h2 className="text-2xl font-semibold mb-6 text-white">
        Add Follow Up
      </h2>

      <form onSubmit={handleAddFollowUp} className="space-y-4">

        <textarea
          rows="4"
          placeholder="Enter notes..."
          value={followUpForm.notes}
          onChange={(e) =>
            setFollowUpForm({
              ...followUpForm,
              notes: e.target.value
            })
          }
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
        />

        <input
          type="datetime-local"
          value={followUpForm.followupDate}
          onChange={(e) =>
            setFollowUpForm({
              ...followUpForm,
              followupDate: e.target.value
            })
          }
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
        />

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowFollowUpModal(false)}
            className="flex-1 py-3 border border-slate-700 rounded-xl text-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
)}
    </Layout>
  );
};

export default SalesDashboard;