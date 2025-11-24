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

  const {
    role,
    resumeText = "",
    blurb = "",
    jobDescription = "",
    question = "",
    answer = ""
  } = (body ?? {}) as Record<string, unknown>;

  if (!role || typeof role !== "string" || !ROLE_LABELS[role]) {
    return NextResponse.json({ error: "Invalid role provided." }, { status: 400 });
  }

  if (typeof jobDescription !== "string" || !jobDescription.trim()) {
    return NextResponse.json({ error: "Job description is required." }, { status: 400 });
  }

  if (typeof question !== "string" || !question.trim()) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  if (typeof answer !== "string" || !answer.trim()) {
    return NextResponse.json({ error: "Answer is required." }, { status: 400 });
  }

  const roleLabel = ROLE_LABELS[role];
  const safeResume = typeof resumeText === "string" ? resumeText : "";
  const safeBlurb = typeof blurb === "string" ? blurb : "";
  const safeJobDescription = typeof jobDescription === "string" ? jobDescription : "";
  const safeQuestion = typeof question === "string" ? question : "";
  const safeAnswer = typeof answer === "string" ? answer : "";
  const providedKey = req.headers.get("x-openai-api-key") ?? undefined;

  try {
    const completion = await getOpenAI(providedKey || undefined).chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "You are an expert interview coach for tech roles. You will receive a role, candidate resume text, blurb, job description, interview question, and the candidate's answer. Respond ONLY with valid JSON: { \"score\": <integer 1-5>, \"summary\": \"<1-2 sentence verdict>\", \"improvedAnswer\": \"<rewritten answer>\", \"watchouts\": [\"<short bullet about what to improve or avoid>\", ...] }."
        },
        {
          role: "user",
          content: `Role: ${roleLabel}\nResume: ${safeResume}\nBlurb: ${safeBlurb}\nJob Description: ${safeJobDescription}\nQuestion: ${safeQuestion}\nAnswer: ${safeAnswer}`
        }
      ]
    });

    const rawContent = completion.choices[0]?.message?.content?.trim();

    if (!rawContent) {
      throw new Error("Empty response from model");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch (parseError) {
      console.error("coach-answer parse error", parseError, rawContent);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    const { score, summary, improvedAnswer, watchouts } = (parsed ?? {}) as Record<string, unknown>;

    if (
      typeof score !== "number" ||
      typeof summary !== "string" ||
      typeof improvedAnswer !== "string" ||
      !Array.isArray(watchouts)
    ) {
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      score,
      summary,
      improvedAnswer,
      watchouts
    });
  } catch (error) {
    console.error("/api/coach-answer error", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
