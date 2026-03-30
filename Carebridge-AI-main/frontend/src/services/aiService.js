const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function analyzeSymptoms(text, language) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/analyze-symptoms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, language }),
        });

        if (!response.ok) {
            throw new Error('AI analysis failed');
        }

        const data = await response.json();
        return {
            ...data,
            is_tamil: language === 'ta'
        };
    } catch (error) {
        console.error('Error analyzing symptoms:', error);
        // Fallback for demo if backend is not running
        return getFallbackSymptomResponse(text, language);
    }
}

export async function analyzeReport(ocrText, language) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/analyze-report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ocr_text: ocrText, language }),
        });

        if (!response.ok) {
            throw new Error('Report analysis failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error analyzing report:', error);
        return getFallbackReportResponse(ocrText, language);
    }
}

// Fallback logic for hackathon demo if backend is unavailable
function getFallbackSymptomResponse(text, language) {
    const isTamil = language === 'ta';
    const isEmergency = /chest pain|heart attack|breathing|மார்பு வலி|மூச்சு திணறல்/i.test(text);

    if (isEmergency) {
        return {
            severity: 'emergency',
            possible_conditions: [isTamil ? 'இதய பாதிப்பு' : 'Heart Issues', isTamil ? 'சுவாச கோளாறு' : 'Respiratory Distress'],
            immediate_actions: [isTamil ? 'அவசரமாக 108 அழைக்கவும்' : 'Call 108 immediately', isTamil ? 'ஓய்வு எடுக்கவும்' : 'Rest and sit down'],
            should_see_doctor: true,
            urgency: 'IMMEDIATE',
            response_text: isTamil
                ? "உங்களுக்கு தீவிரமான அறிகுறி இருக்கலாம். உடனடியாக மருத்துவரை அணுகுங்கள்."
                : "You are experiencing critical symptoms. Please seek emergency care immediately.",
            is_emergency: true,
            emergency_message: isTamil ? "அவசரநிலை - உடனடியாக 108 அழைக்கவும்" : "EMERGENCY DETECTED - Please call 108 immediately",
            is_tamil: isTamil
        };
    }

    return {
        severity: 'low',
        possible_conditions: [isTamil ? 'சாதாரண காய்ச்சல்' : 'Common Flu', isTamil ? 'சளி' : 'Cold'],
        immediate_actions: [isTamil ? 'ஓய்வு எடுக்கவும்' : 'Take rest', isTamil ? 'நிறைய தண்ணீர் குடிக்கவும்' : 'Drink plenty of fluids'],
        should_see_doctor: false,
        urgency: 'Monitor at home',
        response_text: isTamil
            ? "உங்களுக்கு சாதாரண வைரஸ் காய்ச்சல் இருக்கலாம். கவலை வேண்டாம்."
            : "You likely have a mild viral fever. Rest well.",
        is_emergency: false,
        emergency_message: null,
        is_tamil: isTamil
    };
}

function getFallbackReportResponse(ocrText, language) {
    return {
        report_type: "Blood Test",
        patient_name: "Demo User",
        test_date: new Date().toISOString().split('T')[0],
        parameters: [
            {
                name: "Hemoglobin",
                value: "10.2 g/dL",
                normal_range: "12-17",
                status: "LOW",
                simple_explanation: "Your blood has low oxygen-carrying capacity. You may feel tired and weak."
            },
            {
                name: "WBC",
                value: "7.5 K/uL",
                normal_range: "4.5-11.0",
                status: "NORMAL",
                simple_explanation: "Your immune system looks healthy."
            },
            {
                name: "Platelets",
                value: "1.5 L/uL",
                normal_range: "150-400",
                status: "LOW",
                simple_explanation: "Blood clotting may be slower. Avoid injuries."
            }
        ],
        overall_summary: "Clinical analysis indicates anemia (low hemoglobin) and significant thrombocytopenia (low platelets). This requires non-emergency medical consultation to investigate iron levels and clotting factors.",
        flags: ["Low Hemoglobin", "Low Platelets"],
        recommendation: "Increase iron-rich foods and avoid contact sports. Schedule a follow-up with your primary physician.",
        doctor_visit_needed: true
    };
}

export async function chatWithAI(message, history, language) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, history, language }),
        });

        if (!response.ok) throw new Error('Chat failed');
        return await response.json();
    } catch (error) {
        console.error('Chat error:', error);
        // Fallback demo response if backend is down
        const isTamil = language === 'ta';
        const isEmergency = /chest pain|heart attack|breathing|மார்பு வலி|மூச்சு திணறல்/i.test(message);
        
        if (isEmergency) {
            return {
                text: isTamil 
                    ? "⚠️ அவசரநிலை: உடனடியாக 108 அழைக்கவும்!"
                    : "⚠️ EMERGENCY: Please call 108 immediately!",
                is_emergency: true
            };
        }

        return {
            text: isTamil 
                ? "மன்னிக்கவும், என்னால் இப்போது பதிலளிக்க முடியவில்லை. உங்கள் இணைய இணைப்பைச் சரிபார்க்கவும்."
                : "I am sorry, I am having trouble connecting right now. Please check your connection.",
            is_emergency: false
        };
    }
}
