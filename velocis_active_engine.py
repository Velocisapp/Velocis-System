import cv2
import numpy as np
import zxingcpp
import os
from datetime import datetime

def decode_air_hub_date(julian_day_str):
    """Converts IATA Julian day (e.g. 178) to a readable date (e.g. June 27)."""
    try:
        day_num = int(julian_day_str)
        # Assuming current year 2026 as per Command Active status
        date_obj = datetime.strptime(f"2026-{day_num}", "%Y-%j")
        return date_obj.strftime("%B %d")
    except:
        return f"Day {julian_day_str}"

def process_velocis_telemetry(raw_text):
    """Organizes IATA data for the Global Mobility Command center."""
    try:
        # Standard Slicing (Protected by Try/Except)
        name = raw_text[2:22].strip()
        pnr = raw_text[23:30].strip()
        route = f"{raw_text[30:33]} ➔ {raw_text[33:36]}"
        airline = raw_text[36:38]
        flight = raw_text[38:43].strip()
        seat = raw_text[48:52].strip()
        
        # New: Human-Readable Date
        readable_date = decode_air_hub_date(raw_text[44:47])

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
    except:
        print(f"\n📡 [AIR HUB] RAW TELEMETRY: {raw_text}")

def activate_velocis_engine():
    # --- SCANNER CORE: UNTOUCHED GOLD STANDARDS ---
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
    
    print("🚀 VELOCIS AIR HUB ENGINE: ONLINE")
    last_data = None

    try:
        while True:
            ret, frame = cap.read()
            if not ret: break

            # Working Coordinates for M4 iMac Camera
            y1, y2, x1, x2 = 210, 510, 440, 840
            crop = frame[y1:y2, x1:x2]
            
            # TRIPLE-BUFFER ENGINE (DO NOT TOUCH)
            gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
            super_res = cv2.resize(gray, (0,0), fx=2.5, fy=2.5, interpolation=cv2.INTER_LANCZOS4)
            _, high_contrast = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
            results = None
            for attempt in [gray, super_res, high_contrast]:
                results = zxingcpp.read_barcodes(attempt)
                if results: break

            if results:
                for result in results:
                    if result.text != last_data:
                        last_data = result.text
                        os.system('printf "\a"') 
                        process_velocis_telemetry(last_data)
                    
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 4)
            else:
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 255, 255), 2)

            cv2.imshow("Velocis Air Hub - Command View", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'): break
    finally:
        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    activate_velocis_engine()
