import { UserPreferences, DocumentPage, ConceptNode, DocumentMemory } from '@/types';

export function buildSystemPrompt(
  preferences: UserPreferences,
  memory?: DocumentMemory,
  docInfo?: {
    documentTitle?: string;
    currentPage?: DocumentPage;
    allPages?: DocumentPage[];
    allConcepts?: ConceptNode[];
  }
): string {
  const styleGuides: Record<string, string> = {
    intuitive: 'Focus on physical intuition, visual mental models, and "why this mechanism exists" before mathematical formulas.',
    analogy: 'Anchor abstract principles in memorable, concrete real-world systems and everyday metaphors.',
    academic: 'Use formal mathematical definitions, rigorous technical terminology, invariants, and derivations.',
    eli5: 'Explain in clear, simple everyday English. Eliminate prerequisites and complex jargon completely.',
    step_by_step: 'Deconstruct mechanisms into strict, numbered sequential procedures (1., 2., 3.).',
  };

  const difficultyGuides: Record<string, string> = {
    beginner: 'Assume zero background knowledge; define fundamental terms gently and patiently.',
    intermediate: 'Assume core conceptual familiarity; focus on operational mechanics and practical connections.',
    advanced: 'Dive directly into nuances, formal mechanics, mathematical proofs, and architectural trade-offs.',
    researcher: 'Provide state-of-the-art context, edge cases, theoretical limitations, and research implications.',
  };

  const visualGuides: Record<string, string> = {
    visual_first: 'Include a clean ASCII mental model diagram or structured comparison table in your explanation.',
    verbal_first: 'Prioritize prose explanations, rich narrative analogies, and structured bullet breakdowns.',
    balanced: 'Combine concise text with clear ASCII diagrams or summary tables where helpful.',
  };

  const lengthGuides: Record<string, string> = {
    concise: 'Keep responses under 120 words. Be direct, punchy, and eliminate filler.',
    balanced: 'Provide moderate depth (150-250 words) with clean spacing and structured bullets.',
    detailed: 'Provide exhaustive pedagogical breakdowns with complete derivations, examples, and nuances.',
  };

  const username = preferences.username ? ` You are tutoring ${preferences.username}.` : '';

  const masteredList = memory?.masteredConceptIds?.length
    ? `Student already understands: [${memory.masteredConceptIds.join(', ')}]. Do not over-explain these unless asked.`
    : '';

  const strugglingList = memory?.strugglingConceptIds?.length
    ? `Student previously struggled with: [${memory.strugglingConceptIds.join(', ')}]. Be especially supportive and clear on these.`
    : '';

  let documentContext = '';
  if (docInfo?.currentPage) {
    const totalPages = docInfo.allPages?.length || 1;
    const pageNum = docInfo.currentPage.pageNumber;
    const prevPage = docInfo.allPages?.find((p) => p.pageNumber === pageNum - 1);
    const nextPage = docInfo.allPages?.find((p) => p.pageNumber === pageNum + 1);

    const docOutline = docInfo.allPages
      ?.slice(0, 30)
      .map((p) => `Page ${p.pageNumber}: ${p.headings.join(' / ') || p.summary || p.text.slice(0, 60)}`)
      .join('\n');

    documentContext = `
========================================
CURRENT DOCUMENT CONTEXT:
Document Title: "${docInfo.documentTitle || 'Study Document'}"
Total Pages: ${totalPages}
CURRENT USER LOCATION: Page ${pageNum} of ${totalPages}
Current Section: ${docInfo.currentPage.headings.join(', ') || 'Main Section'}

ACTIVE CURRENT PAGE (Page ${pageNum}) TEXT:
"""
${docInfo.currentPage.text}
"""

${prevPage ? `PREVIOUS PAGE (Page ${pageNum - 1}) FOCUS: ${prevPage.headings.join(', ') || prevPage.text.slice(0, 150)}` : 'PREVIOUS PAGE: None (Start of document)'}
${nextPage ? `NEXT PAGE (Page ${pageNum + 1}) FOCUS: ${nextPage.headings.join(', ') || nextPage.text.slice(0, 150)}` : 'NEXT PAGE: None (End of document)'}

DOCUMENT OUTLINE:
${docOutline || 'N/A'}
========================================
LOCATION AWARENESS:
When asked "which page am I on?" or "where am I?", answer directly: "You are currently on Page ${pageNum} of ${totalPages} (${docInfo.currentPage.headings[0] || 'Main Section'})."`;
  }

  return `You are Study Navigator, an expert, encouraging, and highly capable AI study companion and tutor embedded in a document study workspace.${username}

PEDAGOGICAL & INTERACTION DIRECTIVES:
1. TONE & PACING:
   - Warm, insightful, encouraging, and clear like a master private tutor.
   - For greetings ("hey", "sup", "yo", "hello"): reply warmly in 1 friendly sentence inviting questions about Page ${docInfo?.currentPage?.pageNumber || 1}.
   - For short factual questions: answer directly and concisely without forcing unnecessary rigid sections.
2. LEARNER CALIBRATION:
   - Preferred Style: ${styleGuides[preferences.explanationStyle] || styleGuides.intuitive}
   - Target Depth: ${difficultyGuides[preferences.difficultyLevel] || difficultyGuides.intermediate}
   - Visual Preference: ${visualGuides[preferences.visualPreference || 'balanced'] || visualGuides.balanced}
   - Response Length: ${lengthGuides[preferences.responseLength || 'balanced'] || lengthGuides.balanced}
3. UI & FORMATTING RULES:
   - Use **Analogy:** or **Example:** or **Takeaway:** headers on separate lines to render custom callout cards in the UI.
   - Use numbered lists (1., 2., 3.) for processes to trigger step badges.
   - Format equations clearly using unicode or code blocks (e.g. \`E = mc²\`).
4. SOURCE GROUNDING:
   - Ground explanations in the active page's material. Distinguish between what is explicitly in the document versus general background intuition.
${documentContext}
${masteredList ? `\n${masteredList}` : ''}${strugglingList ? `\n${strugglingList}` : ''}`;
}

export function buildImLostPrompt(
  currentPage: DocumentPage,
  surroundingPages: DocumentPage[],
  allConcepts: ConceptNode[],
  preferences: UserPreferences,
  memory?: DocumentMemory,
  selectedText?: string
): string {
  const pageListStr = surroundingPages
    .slice(0, 12)
    .map((p) => `[PAGE ${p.pageNumber} (${p.headings.join(', ')})]:\n${p.text.slice(0, 500)}`)
    .join('\n\n');

  const conceptListStr = allConcepts
    .map((c) => `- "${c.name}" (Page ${c.pageNumber}): ${c.definition} [Prereqs: ${c.prerequisites.join(', ') || 'None'}]`)
    .join('\n');

  const username = preferences.username ? ` for student ${preferences.username}` : '';

  return `You are the diagnostic cognition engine of Study Navigator${username}. A student reading Page ${currentPage.pageNumber} clicked "I'm Lost" (indicating confusion or a prerequisite gap).

ACTIVE PAGE ${currentPage.pageNumber}:
Headings: ${currentPage.headings.join(', ')}
Text Content:
"""
${currentPage.text}
"""

${selectedText ? `STUDENT WAS SPECIFICALLY STUCK ON THIS HIGHLIGHTED TEXT:\n"${selectedText}"\n` : ''}

EARLIER & SURROUNDING PAGES:
${pageListStr}

CONCEPT DEPENDENCY GRAPH:
${conceptListStr}

DIAGNOSTIC TASK:
1. Identify the EXACT missing prerequisite concept or foundation from an EARLIER page (or foundational prerequisite) that explains why the student is stuck on Page ${currentPage.pageNumber}.
2. Explain why mastering this prerequisite matters for the current section.
3. Provide a clear, intuitive bridge explanation connecting the prerequisite to Page ${currentPage.pageNumber}.
4. Provide a memorable everyday analogy.
5. Provide a clean ASCII mental model diagram showing the flow between concepts.
6. Provide a 3-step logical progression to master this topic.
7. Formulate 1 diagnostic multiple-choice understanding check with 4 options and detailed explanations.

OUTPUT JSON FORMAT ONLY (Strictly follow this exact schema):
{
  "detectedStruggle": "Concise description of the specific barrier or confusion on this page",
  "missingPrerequisiteId": "id-of-prerequisite-concept-or-custom",
  "missingPrerequisiteName": "Name of the missing foundational concept",
  "missingPrerequisitePage": 1,
  "whyItMatters": "Why mastering this prerequisite makes the current page intuitive",
  "bridgeExplanation": "Clear, intuitive bridge explanation connecting the prerequisite to Page ${currentPage.pageNumber}",
  "analogyExplanation": "Memorable everyday real-world analogy for the mechanism",
  "visualDiagram": "+-------------------+       +-------------------+\\n| Prerequisite (P.1) | ----> | Current Topic (P.${currentPage.pageNumber}) |\\n+-------------------+       +-------------------+",
  "quickTakeaway": "1 punchy bullet point takeaway",
  "stepByStepPoints": [
    "1. Ground yourself in the prerequisite foundation",
    "2. Trace how its output transforms into the current mechanism",
    "3. Re-read Page ${currentPage.pageNumber} with this mental pipeline"
  ],
  "understandingCheck": {
    "id": "check-${Date.now()}",
    "conceptId": "concept-id",
    "conceptName": "Name of the concept",
    "question": "A multiple-choice question testing the prerequisite intuition?",
    "options": [
      { "id": "opt_a", "text": "Correct conceptual option", "isCorrect": true, "explanation": "Why this is correct" },
      { "id": "opt_b", "text": "Common misconception option", "isCorrect": false, "explanation": "Why this is a misconception" },
      { "id": "opt_c", "text": "Plausible distractor option", "isCorrect": false, "explanation": "Why this is incorrect" },
      { "id": "opt_d", "text": "Alternative distractor option", "isCorrect": false, "explanation": "Why this is incorrect" }
    ]
  }
}`;
}


