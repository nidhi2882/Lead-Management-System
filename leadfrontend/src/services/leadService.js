import API from "../api/leadApi";

export const getLeads = () => API.get("/leads");
export const createLead = (data) => API.post("/leads", data);
export const updateLead = (id, data) => API.put(`/leads/${id}`, data);