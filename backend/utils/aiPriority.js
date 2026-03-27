const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

exports.analyzeComplaint = async (title, description, issues = []) => {
  try {
    let issuesContext = '';
    if (issues && issues.length > 0) {
      issuesContext = `\n### USER SELECTED ISSUES (IMPORTANT):\nThe student explicitly identified these specific issues: [${issues.join(', ')}]\nFactor these into your categorization and priority reasoning.\n`;
    }

    const prompt = `You are an intelligent campus facility management assistant.

Your task is to analyze a complaint and return ONLY a valid JSON response. Do not include any explanation or extra text outside JSON.

---

### OBJECTIVE:

Classify the complaint into relevant categories and assign a priority level.

---

### INPUT HANDLING:

* Complaint Description may be EMPTY.
* If description is missing:
  → Use ONLY the title.
* If both exist:
  → Use both.

---

### ALLOWED CATEGORIES (STRICT):

["Electrical", "Plumbing", "Lab Management", "IT Systems", "Infrastructure"]

DO NOT return "Other" or any category outside this list.

---

### MULTI-CATEGORY RULE (VERY IMPORTANT):

* You MUST return at least 2 categories whenever possible.

* Maximum 3 categories allowed.

* If both location and issue are present:
  → You MUST include BOTH categories.

* Returning only 1 category when multiple are applicable is incorrect.

---

### LOCATION vs PROBLEM LOGIC:

LOCATION indicators:

* "lab" → map to "Lab Management"

PROBLEM indicators:

* "AC", "fan", "cooling" → Electrical, Infrastructure
* "wiring", "switch", "spark" → Electrical
* "computer", "system", "projector" → IT Systems
* "water", "leak", "pipe" → Plumbing
* "wall", "ceiling", "bench", "structure" → Infrastructure

---

### IMPORTANT LOGIC:

* Always prioritize the actual problem over location.
* If both exist:
  → Include BOTH categories.
* Try to infer additional relevant category if applicable.

---

### PRIORITY ASSIGNMENT:

["Low", "Medium", "High", "Urgent"]

* Urgent → safety risk (fire, spark, severe leakage)
* High → major disruption (AC failure, system failure)
* Medium → moderate issue
* Low → minor issue

---

### ESTIMATED FIX TIME:

* Return realistic hours between 1 and 72

---

### OUTPUT FORMAT (STRICT JSON):

{
"categories": ["Category1", "Category2"],
"priority": "Low | Medium | High | Urgent",
"estimatedFixTimeHours": number,
"isInappropriate": boolean,
"safetyReason": "Detailed reason if flagged as inappropriate, else null"
}

---

### FEW-SHOT EXAMPLES (LEARN FROM THESE):

Example 1:
Complaint Title: projector not working in lab
Complaint Description: projector is not working in lab
Output:
{
  "categories": ["IT Systems", "Lab Management"],
  "priority": "Medium",
  "estimatedFixTimeHours": 24
}

Example 2:
Complaint Title: sparking wire from AC in classroom 3
Complaint Description: 
Output:
{
  "categories": ["Electrical", "Infrastructure", "Lab Management"],
  "priority": "Urgent",
  "estimatedFixTimeHours": 2
}

---

---

### SAFETY & DECORUM RULE (CRITICAL):

* You MUST detect if the complaint contains:
  → Profanity or Abusive language (English or Hindi/Hinglish).
  → Vulgar or sexually explicit content.
  → Disrespectful or threatening language towards college authorities.
  → Spam or completely irrelevant/gibberish content.

* If any of the above are detected:
  → Set "isInappropriate" to true.
  → Provide the reason in "safetyReason".
* Otherwise:
  → Set "isInappropriate" to false.
  → Set "safetyReason" to null.

---

### FINAL RULES:

* Return ONLY JSON
* No explanation
* No markdown
* No extra text
* Categories must exactly match allowed list
* NEVER return "Other"
* Prefer 2 or more categories when possible
${issuesContext}
Complaint Title: \${title}
Complaint Description: \${description}`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    // Ensure we parse correctly
    let resultText = response.choices[0].message.content.trim();
    // Sometimes models wrap json in code blocks
    if (resultText.startsWith('```json')) {
      resultText = resultText.replace('```json', '').replace('```', '').trim();
    }

    return JSON.parse(resultText);
  } catch (error) {
    console.error('Groq API Error:', error);
    return null;
  }
};
