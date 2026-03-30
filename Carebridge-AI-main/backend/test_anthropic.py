import os
import anthropic
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("ANTHROPIC_API_KEY")
print(f"Using API Key: {api_key[:10]}...")

try:
    client = anthropic.Anthropic(api_key=api_key)
    message = client.messages.create(
        model="claude-3-5-sonnet-20240620",
        max_tokens=10,
        messages=[{"role": "user", "content": "Hello"}]
    )
    print("Success!")
    print(message.content[0].text)
except Exception as e:
    print(f"Failed: {e}")
