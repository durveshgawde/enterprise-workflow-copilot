from google import genai
import os, json
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("🧪 Testing gemini-2.5-pro...")

response = client.models.generate_content(
    model="gemini-2.5-pro",  # ← YOUR WORKING MODEL
    contents='Convert "Send customer welcome email" to JSON workflow. Return ONLY JSON: {"title":"str","steps":[{"title":"str","description":"str"}]}'
)

print("✅ GEMINI WORKS!")
print("\n📝 Raw response:")
print(response.text)
print("\n" + "="*50)

# Try to parse JSON (handle markdown code blocks)
content = response.text.strip()
if content.startswith("```json"):
    content = content.replace("```json", "").replace("```", "").strip()
elif content.startswith("```"):
    content = content.replace("```", "").strip()

try:
    workflow = json.loads(content)
    print("\n✅ Parsed JSON:")
    print(json.dumps(workflow, indent=2))
except json.JSONDecodeError as e:
    print(f"\n❌ JSON parse error: {e}")
    print(f"Content was: {content}")
