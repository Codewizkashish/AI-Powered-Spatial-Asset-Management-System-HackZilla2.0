import os
import json
import google.generativeai as genai
from groq import Groq
from dotenv import load_dotenv

# Load the environment variables
load_dotenv()

# --- Setup Gemini ---
gemini_api_key = os.getenv("GEMINI_API_KEY")
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

# --- Setup Groq Fallback ---
groq_api_key = os.getenv("GROQ_API_KEY")
groq_client = Groq(api_key=groq_api_key) if groq_api_key else None

def chat_with_spatial_data(user_query: str, asset_data: list):
    """
    Takes the user's question and the YOLOv8 JSON output.
    Tries Gemini first. If Gemini fails, instantly falls back to Groq.
    """
    prompt = f"""
    You are an AI Spatial Asset Management assistant. 
    The user has uploaded an image. Our computer vision model detected these assets:
    {json.dumps(asset_data)}
    
    Answer the user's question based ONLY on this data. Be concise and helpful.
    User Question: {user_query}
    """

    # === ATTEMPT 1: GEMINI ===
    try:
        # Using your confirmed working Gemini model
        model = genai.GenerativeModel('gemini-2.5-flash') 
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as gemini_error:
        print(f"⚠️ Gemini API failed/busy: {gemini_error}. Booting up Groq Fallback...")
        
        # === ATTEMPT 2: GROQ ===
        if not groq_client:
            return "AI Chat unavailable. Groq key not found."
            
        try:
            chat_completion = groq_client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a highly efficient spatial AI assistant."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                # Using your confirmed working Groq model (Instant for speed)
                model="llama-3.1-8b-instant", 
            )
            return chat_completion.choices[0].message.content
            
        except Exception as groq_error:
            return f"❌ Both AI engines failed. Groq Error: {str(groq_error)}"