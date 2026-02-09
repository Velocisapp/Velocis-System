import ollama
import json
import os
import requests
import time

# --- PROJECT CONSTANTS ---
BRIDGE_URL = "https://velocis-global-mobility-system.netlify.app/api/mission_bridge"
DATA_FILE = "mission_data.json"

def generate_system_briefing(data_json):
    """
    PRESERVED: Interprets raw flight logistics into a professional 
    human-language briefing using local AI.
    """
    system_instructions = (
        "You are the Velocis Global Mobility System Interpreter. "
        "Your tone is professional, elite, and concise. "
        "Do not use slang, emojis, or neon-hacker terminology. "
        "Provide a 2-sentence briefing based on the travel data provided."
    )

    try:
        response = ollama.chat(model='llama3', messages=[
            {'role': 'system', 'content': system_instructions},
            {'role': 'user', 'content': f"Interpret this mission data: {json.dumps(data_json)}"}
        ])
        return response['message']['content']
    except Exception as e:
        return f"Interpreter Error: Ensure Ollama is active on the local engine. Flight: {data_json.get('flight_number', 'Unknown')}"

def run_automated_butler():
    """
    NEW: Automates the hand-off. Listens to the bridge and triggers 
    the briefing the moment the iPhone scan is detected.
    """
    print("\n--- VELOCIS SYSTEM INTERPRETER: ACTIVE LISTENING ---")
    last_processed_timestamp = None

    while True:
        try:
            # 1. Check the Bridge for the iPhone's data
            response = requests.get(BRIDGE_URL, timeout=5)
            current_data = response.json()

            # 2. If the data is 'Active' and it's a new timestamp, trigger the AI
            if current_data.get("status") == "Active" and current_data.get("timestamp") != last_processed_timestamp:
                
                # Save locally for redundancy (preserving your logic)
                with open(DATA_FILE, 'w') as f:
                    json.dump(current_data, f, indent=4)

                # Generate the Elite Briefing
                briefing = generate_system_briefing(current_data)
                
                print(f"\n✅ NEW MISSION DETECTED")
                print(f"🎙️  {briefing}\n")
                
                # Make the iMac speak the briefing out loud
                os.system(f"say '{briefing}'")
                
                last_processed_timestamp = current_data.get("timestamp")
                
        except Exception as e:
            # Silent standby if bridge is temporarily unreachable
            pass
        
        time.sleep(2) # Checks every 2 seconds

if __name__ == "__main__":
    run_automated_butler()
