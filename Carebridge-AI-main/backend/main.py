from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import anthropic
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="CarebridgeAI API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

class AnalysisRequest(BaseModel):
    text: str
    language: str

class ReportRequest(BaseModel):
    ocr_text: str
    language: str

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "CarebridgeAI API is active"}

@app.post("/api/analyze-symptoms")
async def analyze_symptoms(req: AnalysisRequest):
    system_prompt = """
    You are CarebridgeAI, a compassionate medical assistant for rural Indian patients. 
    Your role is to help patients understand their symptoms in simple, clear language.

    STRICT RULES:
    1. NEVER diagnose. Always say "this MIGHT be" or "this COULD indicate"
    2. ALWAYS recommend seeing a doctor for confirmation
    3. Keep explanations simple - assume 8th grade education level
    4. If input is in Tamil, respond in Tamil. If English, respond in English.
    5. Response format must be JSON with these exact fields:
       {
         "severity": "low/medium/high/emergency",
         "possible_conditions": ["condition1", "condition2"],
         "immediate_actions": ["action1", "action2"],
         "should_see_doctor": true/false,
         "urgency": "within 24hrs/within a week/monitor at home",
         "response_text": "Full friendly explanation in patient's language",
         "is_emergency": true/false,
         "emergency_message": "message if emergency, else null"
       }

    EMERGENCY KEYWORDS (trigger is_emergency: true):
    - chest pain, heart attack, breathing problem, severe bleeding,
    - stroke, unconscious, seizure, மார்பு வலி, மூச்சு திணறல்
    """

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=1000,
            system=system_prompt,
            messages=[
                {"role": "user", "content": f"Analyze these symptoms: {req.text}"}
            ]
        )
        # Extract JSON from response
        response_text = message.content[0].text
        # Ensure we only get the JSON part
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        return json.loads(response_text[json_start:json_end])
    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail="AI analysis failed")

@app.post("/api/chat")
async def chat_with_ai(message: str = Body(..., embed=True), history: list = Body(..., embed=True), language: str = Body(..., embed=True)):
    system_prompt = """
    You are CareBridge AI, a compassionate medical assistant 
    for rural Indian patients. Rules:
    - Never give same response twice
    - Answer the EXACT question asked
    - If input is Tamil, reply in Tamil
    - If input is English, reply in English  
    - Never diagnose, always say "may be" or "could be"
    - Always recommend doctor for serious symptoms
    - Keep responses under 80 words
    - If chest pain/breathing/மார்பு வலி/மூச்சு detected,
      reply: "⚠️ EMERGENCY: Please call 108 immediately!"
    - Be conversational, warm, helpful
    - Remember previous messages in conversation
    """
    
    try:
        # Construct message history for Claude
        formatted_messages = []
        for msg in history:
            role = "user" if msg.get("role") == "user" else "assistant"
            # Ensure content is string
            content = msg.get("text", "")
            if content:
                formatted_messages.append({"role": role, "content": content})
        
        # Add current message
        formatted_messages.append({"role": "user", "content": message})

        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=1000,
            system=system_prompt,
            messages=formatted_messages
        )
        
        ai_text = response.content[0].text
        is_emergency = any(word in ai_text.lower() for word in ["emergency", "108", "அவசரநிலை"])
        
        return {
            "text": ai_text,
            "is_emergency": is_emergency
        }
    except Exception as e:
        print(f"Chat AI Error: {e}")
        raise HTTPException(status_code=500, detail="Chat failed")

@app.post("/api/analyze-report")
async def analyze_report(req: ReportRequest):
    system_prompt = """
    You are a medical report interpreter for patients with low medical literacy.

    Given this medical report text, extract and explain it simply:

    EXTRACT in JSON format:
    {
      "report_type": "blood test/urine test/X-ray/etc",
      "patient_name": "if found",
      "test_date": "if found",
      "parameters": [
        {
          "name": "parameter name",
          "value": "value with unit",
          "normal_range": "normal range",
          "status": "normal/low/high/critical",
          "simple_explanation": "what this means in simple words"
        }
      ],
      "overall_summary": "2-3 sentence plain English/Tamil summary",
      "flags": ["list of abnormal values"],
      "recommendation": "what patient should do next",
      "doctor_visit_needed": true/false
    }
    """

    try:
        message = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=2000,
            system=system_prompt,
            messages=[
                {"role": "user", "content": f"Interpret this report: {req.ocr_text}"}
            ]
        )
        response_text = message.content[0].text
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        return json.loads(response_text[json_start:json_end])
    except Exception as e:
        print(f"AI Error: {e}")
        raise HTTPException(status_code=500, detail="Report analysis failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
