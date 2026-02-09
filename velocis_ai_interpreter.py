import ollama
import json
import os

def generate_system_briefing(data_json):
    """
    Interprets raw flight logistics into a professional 
    human-language briefing using local AI.
    """
    
    # The 'System Prompt' defines the personality: Elite, calm, and helpful.
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
        # Dynamic error handling: uses whatever flight number is currently in the data
        return f"Interpreter Error: Ensure Ollama is active on the local engine. Flight: {data_json.get('flight_number', 'Unknown')}"

# --- DYNAMIC DATA HAND-OFF ---
if __name__ == "__main__":
    print("\n--- VELOCIS SYSTEM INTERPRETER ---")
    
    # The system now looks for this file instead of using a hardcoded list
    data_file = "mission_data.json"

    if os.path.exists(data_file):
        try:
            with open(data_file, 'r') as f:
                current_data = json.load(f)
            
            # Run the AI briefing with the real data found in the file
            briefing = generate_system_briefing(current_data)
            print(f"\n{briefing}\n")
            
        except Exception as e:
            print(f"Status: Error reading mission data file. {e}")
    else:
        # If the scanner hasn't run yet, the Butler stays in professional standby
        print("Status: Standby. Waiting for scanner to transmit mission data...")
