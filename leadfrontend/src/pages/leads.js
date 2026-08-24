import React, { useEffect, useState } from "react";
import { getLeads } from "../services/leadService";

const Leads = () => {
    const [leads, setLeads] = useState([]);

    useEffect(() => {
        getLeads().then((res) => {
            setLeads(res.data);
        });
    }, []);

    return (
        <div>
            <h2>Leads</h2>
            {leads.map((lead) => (
                <div key={lead.id}>
                    {lead.name} - {lead.status}
                </div>
            ))}
        </div>
    );
};

export default Leads;