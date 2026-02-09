import numpy as np
import zxingcpp
import os
import json
import requests
import base64
import time
from datetime import datetime

# --- GLOBAL CONFIGURATION ---
NETLIFY_URL = "https://velocis-global-mobility-system.netlify.app/.netlify/functions/mission_bridge"

def decode_air_hub_date(julian_day_str):
    """Core Function: Preserved with f-string fix."""
    try:
        day_num = int(julian_day_str)
        # Fix: Removed the colon after 'f' to ensure proper string formatting
        date_obj = datetime.strptime(f"2026-{day_num}", "%Y-%j")
        return date_obj.strftime("%B %d")
    except:
        return f"Day {julian_day_str}"

def process_velocis_telemetry(raw_text):
    """Core Function: Preserved Slicing Logic."""
    try:
        name = raw_text[2:22].strip()
        pnr = raw_text[23:30].strip()
        origin = raw_text[30:33]
        dest = raw_text[33:36]
        airline = raw_text[36:38]
        flight = raw_text[38:43].strip()
        seat = raw_text[48:52].strip()
        readable_date = decode_air_hub_date(raw_text[44:47])

        # --- COMMAND CENTER VIEW ---
        print("\n" + "═"*55)
        print(f"🛰️  VELOCIS™ GLOBAL COMMAND | FIELD TELEMETRY RECEIVED")
        print("═"*55)
        print(f"║ 👤 PASSENGER: {name:<35} ║")
        print(f"║ ✈️  CARRIER:   {airline} {flight:<31} ║")
        print(f"║ 📍 ROUTE:     {origin} ➔ {dest:<28} ║")
        print(f"║ 💺 SEAT:      {seat:<35} ║")
        print(f"║ 🗓️  DATE:      {readable_date:<35} ║")
        print("═"*55 + "\n")

        mission_payload = {
            "passenger": name,
            "airport": origin,
            "destination": dest,
            "flight_number": f"{airline}{flight}",
            "status": "Active",
            "timestamp": datetime.now().isoformat()
        }

        # Beaming back to Netlify to update iPhone UI
        requests.post(NETLIFY_URL, json=mission_payload)
        
        # Local redundancy for AI Butler
        with open("mission_data.json", "w") as f:
            json.dump(mission_payload, f, indent=4)
            
        return True
    except Exception as e:
        print(f"❌ Telemetry Parsing Error: {e}")
        return False

def decode_cloud_image(base64_string):
    """Engine: Processes iPhone photo without touching iMac Hardware."""
    try:
        img_bytes = base64.b64decode(base64_string.split(',')[1])
        nparr = np.frombuffer(img_bytes, np.uint8)
        
        # Hardware Protection: cv2 is imported here only as a decoder
        import cv2
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Applying your Triple-Buffer Engine
        results = zxingcpp.read_barcodes(frame)
        if results:
            return results[0].text
        return None
    except Exception as e:
        return None

def run_field_ops_listener():
    print("🚀 VELOCIS COMMAND: LISTENING FOR IPHONE TELEMETRY...")
    last_cloud_timestamp = None

    while True:
        try:
            response = requests.get(NETLIFY_URL, timeout=5)
            cloud_data = response.json()
            
            # Check for new data from iPhone
            if cloud_data.get("image") and cloud_data.get("timestamp") != last_cloud_timestamp:
                print("📸 Telemetry inbound from Field Unit. Decoding...")
                decoded_text = decode_cloud_image(cloud_data["image"])
                
                if decoded_text:
                    os.system('printf "\a"') # Alert beep on success
                    process_velocis_telemetry(decoded_text)
                    last_cloud_timestamp = cloud_data.get("timestamp")
        except:
            pass
        time.sleep(1)

if __name__ == "__main__":
    run_field_ops_listener()
