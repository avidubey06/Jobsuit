import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ResumeData, AnalysisResult } from "../types";

// Using the recommended client instantiation
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schemas for structured output

const resumeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    contactInfo: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        linkedin: { type: Type.STRING },
        location: { type: Type.STRING },
      },
    },
    summary: { type: Type.STRING },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          company: { type: Type.STRING },
          role: { type: Type.STRING },
          dates: { type: Type.STRING },
          location: { type: Type.STRING },
          description: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          school: { type: Type.STRING },
          degree: { type: Type.STRING },
          dates: { type: Type.STRING },
        },
      },
    },
  },
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER },
    categories: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          status: { type: Type.STRING, enum: ["good", "warning", "critical"] },
        },
      },
    },
    keywordGaps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    formattingIssues: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    topStrengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    tailoringSuggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
};

export const parseResumeFile = async (file: File): Promise<ResumeData> => {
  const base64Data = await fileToBase64(file);

  // Using a multimodal capable model for document parsing
  const modelName = "gemini-2.5-flash-latest"; 

  const prompt = `
    You are an expert ATS Resume Parser. 
    Extract the structured data from this resume document.
    Normalize the data into clean JSON.
    For 'id' fields, generate a unique string.
    Ensure 'description' in experience is an array of bullet point strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { mimeType: file.type, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: resumeSchema,
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as ResumeData;
      return { ...data, rawText: "Extracted from file" }; // Keep track that it was parsed
    }
    throw new Error("No data returned from parsing");
  } catch (error) {
    console.error("Parsing Error:", error);
    throw error;
  }
};

export const analyzeResume = async (resume: ResumeData, jobDescription: string): Promise<AnalysisResult> => {
  // Using the powerful text model for reasoning and scoring
  const modelName = "gemini-3-flash-preview";

  const prompt = `
    You are an advanced ATS (Applicant Tracking System) simulator and Resume Coach.
    
    RESUME DATA:
    ${JSON.stringify(resume)}

    TARGET JOB DESCRIPTION:
    ${jobDescription || "No specific job description provided. Analyze for general best practices."}

    TASK:
    Analyze the resume against the job description (if provided) or general ATS standards.
    Provide a score (0-100) and detailed breakdown.
    
    SCORING RUBRIC:
    - Parsing Success: Is the data structured well?
    - Keyword Match: Do skills match the JD?
    - Impact: Do bullets use action verbs and metrics?
    - Formatting: Are there potential parsing risks?
    
    Return strict JSON matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: { thinkingBudget: 1024 } // Allow some thinking for accurate scoring
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No analysis generated");
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const rewriteBulletPoint = async (bullet: string, roleContext: string): Promise<string> => {
  const modelName = "gemini-3-flash-preview";
  
  const prompt = `
    Rewrite the following resume bullet point to be more ATS-friendly and impactful.
    Use strong action verbs.
    Quantify results where possible (use placeholders like [X]% if needed).
    Context: This is for a ${roleContext} role.

    Original Bullet: "${bullet}"
    
    Return ONLY the rewritten bullet point text, nothing else.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  return response.text?.trim() || bullet;
};

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URI prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
