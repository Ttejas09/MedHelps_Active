import os
import google.generativeai as genai
from dotenv import load_dotenv

print("--- Starting Gemini Diagnostic Test ---")
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("--- 🔴 ERROR: GOOGLE_API_KEY not found in .env file! ---")
else:
    print(f"--- ✅ API Key found. Key starts with: {api_key[:4]}... ---")

    try:
        genai.configure(api_key=api_key)

        print("--- ℹ️  Attempting to list models... ---")
        # This list will show us what your key has access to.
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"    - {m.name}")

        print("\n--- ℹ️  Attempting to configure 'gemini-pro'... ---")
        model = genai.GenerativeModel('gemini-pro')

        print("--- ℹ️  Sending test prompt to 'gemini-pro'... ---")
        response = model.generate_content("What is 1+1?")

        print("\n--- ✅ SUCCESS! AI Response: ---")
        print(response.text)

    except Exception as e:
        print(f"\n--- 🔴 ERROR DURING API CALL: {e} ---")

print("\n--- Test Complete ---")