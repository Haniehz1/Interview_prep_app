import { NextRequest, NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

const ROLE_LABELS: Record<string, string> = {
  ai_pm: "AI Product Manager",
  eng_manager: "Engineering Manager",
  designer: "Product Designer"
};

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { role, resumeText = "", blurb = "", jobDescription = "" } = (body ?? {}) as Record<string, unknown>;

  if (!role || typeof role !== "string" || !ROLE_LABELS[role]) {
    return NextResponse.json({ error: "Invalid role provided." }, { status: 400 });
  }

  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    return NextResponse.json({ error: "Job description is required." }, { status: 400 });
  }

  const roleLabel = ROLE_LABELS[role];
  const safeResume = typeof resumeText === "string" ? resumeText : "";
  const safeBlurb = typeof blurb === "string" ? blurb : "";
  const safeJobDescription = typeof jobDescription === "string" ? jobDescription : "";

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are an interview prep coach for tech roles. The user will give you a target role, resume text, short blurb, and job description. Output ONE high-signal interview question that is relevant to the role, aligns with the job description, and is behavioral or scenario-based. Respond with only the question text."
        },
        {
          role: "user",
          content: `Role: ${roleLabel}\nResume: ${safeResume}\nBlurb: ${safeBlurb}\nJob Description: ${safeJobDescription}`
        }
      ]
    });

    const question = completion.choices[0]?.message?.content?.trim();

    if (!question) {
      throw new Error("No question returned from model");
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("/api/generate-question error", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
