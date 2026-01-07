from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("🔍 Available models:")
try:
    models = client.models.list()
    for model in models:
        print(f"  ✅ {model.name}")
        print(f"     display_name: {getattr(model, 'display_name', 'N/A')}")
        print(f"     description: {getattr(model, 'description', 'N/A')[:100]}...")
        print()
except Exception as e:
    print(f"❌ Error listing models: {e}")
