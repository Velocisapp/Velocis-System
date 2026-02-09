import ollama
import json

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
        return f"Interpreter Error: Ensure Ollama is active on the local engine. Flight: {data_json.get('flight_number')}"

# --- SIMULATED DATA HAND-OFF ---
if __name__ == "__main__":
    # This matches the clean JSON format your scanner produces
    current_data = {
        "passenger": "Velocis Traveler",
        "airport": "MIA",
        "terminal": "D",
        "destination": "Madrid",
        "flight_number": "UX098",
        "departure": "7:45 AM",
        "status": "Check-in"
    }

    print("\n--- VELOCIS SYSTEM INTERPRETER ---")
    briefing = generate_system_briefing(current_data)
    print(f"\n{briefing}\n")
