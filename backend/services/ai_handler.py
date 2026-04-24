import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

def classify_intent(user_response: str) -> str:
    """
    Classifies user response into CONFIRM, CANCEL, or UNCLEAR.
    """
    prompt = f"""Classify the following user response into exactly one of these categories: CONFIRM, CANCEL, or UNCLEAR.
    
User response: "{user_response}"

Rules:
- CONFIRM: user agrees, says yes, okay, haan, sari, ho, confirm, 1
- CANCEL: user disagrees, says no, nahi, cancel, band karo, 2
- UNCLEAR: anything else

Respond with only one word: CONFIRM, CANCEL, or UNCLEAR."""

    try:
        response = model.generate_content(prompt)
        result = response.text.strip().upper()
        if result in ["CONFIRM", "CANCEL", "UNCLEAR"]:
            return result
        return "UNCLEAR"
    except Exception as e:
        print(f"Gemini error: {e}")
        return "UNCLEAR"
