import cv2
import numpy as np
import zxingcpp
import os
import json
import requests
import base64
import time
from datetime import datetime

# --- GLOBAL CONFIGURATION ---
NETLIFY_URL = "https://velocis-global-mobility-system.netlify.app/api/mission_bridge"

def decode_air_hub_date(julian_day_str):
    """Converts IATA Julian day (e.g. 178) to a readable date (e.g. June 27)."""
    try:
        day_num = int(julian_day_str)
        date_obj = datetime.strptime(f"2026-{day_num}", "%Y-%j")
        return date_obj.strftime("%B %d")
    except:
        return f"Day {julian_day_str}"

def process_velocis_telemetry(raw_text):
    """Organizes IATA data and BEAMS it to the Global Cloud Bridge."""
    try:
        # Standard Slicing (Untouched Gold Standards)
        name = raw_text[2:22].strip()
        pnr = raw_text[23:30].strip()
        origin = raw_text[30:33]
        dest = raw_text[33:36]
        route = f"{origin} ➔ {dest}"
        airline = raw_text[36:38]
        flight = raw_text[38:43].strip()
        seat = raw_text[48:52].strip()
        
        readable_date = decode_air_hub_date(raw_text[44:47])

        # --- THE COMMAND CENTER VIEW ---
        print("\n" + "═"*55)
        print(f"🛰️  VELOCIS™ GLOBAL MOBILITY COMMAND | AIR HUB ACTIVE")
        print("═"*55)
        print(f"║ 👤 PASSENGER: {name:<35} ║")
        print(f"║ ✈️  CARRIER:   {airline} {flight:<31} ║")
        print(f"║ 📍 ROUTE:     {route:<35} ║")
        print(f"║ 💺 SEAT:      {seat:<35} ║")
        print(f"║ 🗓️  DATE:      {readable_date:<35} ║")
        print(f"║ 🆔 RECORD:    PNR {pnr:<31} ║")
        print("═"*55 + "\n")

        # --- THE GLOBAL HANDSHAKE ---
        mission_payload = {
            "passenger": name,
            "airport": origin,
            "destination": dest,
            "flight_number": f"{airline}{flight}",
            "raw_data": raw_text,
            "status": "Active",
            "timestamp": datetime.now().isoformat()
        }

        # Beaming to Cloud Bridge (triggers iPhone UI Success)
        requests.post(NETLIFY_URL, json=mission_payload)
        
        # Keeping local file for redundancy
        with open("mission_data.json", "w") as f:
            json.dump(mission_payload, f, indent=4)
            
        print("📡 [SYSTEM] Telemetry beamed to Global Cloud Bridge.")
        return True

    except Exception as e:
        print(f"\n📡 [AIR HUB] RAW TELEMETRY ERROR: {e}")
        return False

def decode_cloud_image(base64_string):
    """Processes image from iPhone using the Triple-Buffer Zxing Engine."""
    try:
        # 1. Convert Base64 from iPhone to OpenCV frame
        img_data = base64.b64decode(base64_string.split(',')[1])
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # 2. TRIPLE-BUFFER ENGINE (Applied to Cloud Image)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        super_res = cv2.resize(gray, (0,0), fx=2.5, fy=2.5, interpolation=cv2.INTER_LANCZOS4)
        _, high_contrast = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        results = None
        for attempt in [gray, super_res, high_contrast]:
            results = zxingcpp.read_barcodes(attempt)
            if results: break
        
        if results:
            for result in results:
                return result.text
        return None
    except:
        return None

def activate_velocis_engine():
    # --- SILENT COMMAND MODE: NO WEBCAM ACTIVATION ---
    print("🚀 VELOCIS GLOBAL HUB: LISTENING FOR IPHONE TELEMETRY...")
    last_cloud_timestamp = None

    while True:
        try:
            # Poll the Bridge for iPhone Data
            response = requests.get(NETLIFY_URL, timeout=1)
            cloud_data = response.json()
            
            # Detect new Mission from iPhone
            if cloud_data.get("image") and cloud_data.get("timestamp") != last_cloud_timestamp:
                print("📸 [CLOUD] Image received from iPhone. Processing...")
                
                decoded_text = decode_cloud_image(cloud_data["image"])
                
                if decoded_text:
                    os.system('printf "\a"') # Alert beep on iMac
                    process_velocis_telemetry(decoded_text)
                    last_cloud_timestamp = cloud_data.get("timestamp")
                else:
                    print("⚠️  [CLOUD] Decoding failed. Awaiting higher resolution...")
                    # Update status to tell iPhone to try again
                    requests.post(NETLIFY_URL, json={"status": "Retry"})
                    
        except Exception:
            # Silent catch for connection flickers
            pass
        
        # 1-second interval to avoid spamming the Netlify Function
        time.sleep(1)

if __name__ == "__main__":
    activate_velocis_engine()
