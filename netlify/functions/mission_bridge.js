// netlify/functions/mission_bridge.js

// Persistence Variable (Warm Memory)
let globalMissionShelf = { status: "Standby", message: "Waiting for first scan..." };

exports.handler = async (event) => {
    const method = event.httpMethod;

    // 1. IPHONE UPLOAD & IMAC CONFIRMATION
    if (method === "POST") {
        try {
            const incomingData = JSON.parse(event.body);
            
            // Update the shelf with new telemetry
            globalMissionShelf = {
                ...incomingData,
                timestamp: incomingData.timestamp || new Date().toISOString(),
                // If it comes from iPhone, it's 'Active'. If from iMac, it updates state.
                status: incomingData.status || "Active" 
            };

            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type"
                },
                body: JSON.stringify({ message: "Bridge Updated", status: globalMissionShelf.status })
            };
        } catch (err) {
            return { statusCode: 400, body: "Invalid Mission Data" };
        }
    }

    // 2. DATA RETRIEVAL (The Pull)
    if (method === "GET") {
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify(globalMissionShelf)
        };
    }

    // Handle Pre-flight for CORS (Crucial for mobile browsers)
    if (method === "OPTIONS") {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
            }
        };
    }
};
