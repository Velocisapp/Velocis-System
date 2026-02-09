// netlify/functions/mission_bridge.js

// This variable lives in the "cloud memory" as long as the function is warm
let globalMissionShelf = { status: "Standby", message: "Waiting for first scan..." };

exports.handler = async (event) => {
    const method = event.httpMethod;

    // 1. IPHONE UPLOAD: The scanner sends data here
    if (method === "POST") {
        try {
            const incomingData = JSON.parse(event.body);
            globalMissionShelf = {
                ...incomingData,
                timestamp: new Date().toISOString(),
                status: "Active"
            };
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Mission Transmitted to Bridge." })
            };
        } catch (err) {
            return { statusCode: 400, body: "Invalid Mission Data" };
        }
    }

    // 2. IMAC PULL: The AI Interpreter asks "Is there any news?"
    if (method === "GET") {
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" // Allows global access
            },
            body: JSON.stringify(globalMissionShelf)
        };
    }
};
