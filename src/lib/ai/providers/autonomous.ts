import {
  UserPreferences,
  DocumentPage,
  ConceptNode,
  DocumentMemory,
  ImLostDiagnosis,
  UnderstandingCheck,
} from '@/types';

export interface AutonomousContext {
  currentPage?: DocumentPage;
  surroundingPages?: DocumentPage[];
  allConcepts?: ConceptNode[];
  preferences?: UserPreferences;
  memory?: DocumentMemory;
  selectedText?: string;
  query?: string;
  documentTitle?: string;
}

export class AutonomousKnowledgeEngine {
  /**
   * Generates a context-aware pedagogical chat answer calibrated to the user's learning style and difficulty level.
   */
  static generateResponse(ctx: AutonomousContext): string {
    const {
      currentPage,
      query = '',
      preferences = {
        explanationStyle: 'intuitive',
        difficultyLevel: 'intermediate',
        responseLength: 'balanced',
        visualPreference: 'visual_first',
        autoPromptUnderstandingCheck: true,
      },
      allConcepts = [],
      selectedText,
    } = ctx;

    const pageNum = currentPage?.pageNumber || 1;
    const pageText = currentPage?.text || '';
    const totalPages = ctx.surroundingPages?.length || 1;
    const activeHeading = currentPage?.headings[0] || 'Current Section';
    const style = preferences.explanationStyle || 'intuitive';
    const difficulty = preferences.difficultyLevel || 'intermediate';
    const username = preferences.username || 'Student';

    const trimmed = query.trim();
    const cleanQuery = trimmed.toLowerCase().replace(/[!.,?]+$/, '').trim();

    // 1. Casual Greetings Check
    const isGreeting = /^(sup|hey|hi|hello|yo|howdy|what'?s\s*up|wassup|how\s*are\s*you|how('?s| is)\s*it\s*going|good\s*(morning|afternoon|evening)|gm|gn|hola|greet(ings)?)$/i.test(cleanQuery);
    if (isGreeting && !selectedText) {
      const casualGreetings = [
        `Hey ${username}! Ready to dive into Page ${pageNum}? What would you like to explore or break down?`,
        `Hi ${username}! I'm tracking your reading on Page ${pageNum} (${activeHeading}). How can I help?`,
        `Hey ${username}! I'm ready in **${style.replace('_', ' ')}** mode. Ask me anything about Page ${pageNum}!`,
      ];
      return casualGreetings[cleanQuery.length % casualGreetings.length];
    }

    // 2. Affirmations / Small Talk
    const isAffirmation = /^(thanks|thank\s*you|thx|ty|got\s*it|cool|nice|ok|okay|k|alright|sweet|sounds\s*good|perfect|awesome|great)$/i.test(cleanQuery);
    if (isAffirmation && !selectedText) {
      return `Got you, ${username}! Let me know whenever you want to test your understanding or break down another concept on Page ${pageNum}.`;
    }

    // 3. Location & Navigation Awareness
    const lowerQuery = query.toLowerCase();
    if (
      lowerQuery.includes('which page') ||
      lowerQuery.includes('what page') ||
      lowerQuery.includes('where am i') ||
      lowerQuery.includes('what page am i on')
    ) {
      const prevPage = ctx.surroundingPages?.find((p) => p.pageNumber === pageNum - 1);
      const nextPage = ctx.surroundingPages?.find((p) => p.pageNumber === pageNum + 1);

      return `You are currently on **Page ${pageNum} of ${totalPages}** (*${activeHeading}*) in **${ctx.documentTitle || 'your document'}**.\n\n` +
        `### 🗺️ Connection Map:\n` +
        `- **Active Focus (Page ${pageNum})**: ${currentPage?.headings.join(', ') || 'Core concepts on this section'}.\n` +
        (prevPage ? `- **Previous Foundation (Page ${pageNum - 1})**: Explored *${prevPage.headings.join(', ') || 'earlier topics'}*.\n` : '') +
        (nextPage ? `- **Next Up (Page ${pageNum + 1})**: Moves into *${nextPage.headings.join(', ') || 'upcoming topics'}*.\n` : '');
    }

    const activeConcepts = allConcepts.filter((c) => currentPage?.conceptIds?.includes(c.id));
    const matchedConcept = allConcepts.find(
      (c) =>
        query.toLowerCase().includes(c.name.toLowerCase()) ||
        (selectedText && selectedText.toLowerCase().includes(c.name.toLowerCase()))
    ) || activeConcepts[0];

    const prereqs = matchedConcept?.prerequisites
      ?.map((pid) => allConcepts.find((item) => item.id === pid))
      .filter(Boolean) as ConceptNode[] | undefined;

    const conceptName = matchedConcept?.name || activeHeading;
    const conceptDef = matchedConcept?.definition || pageText.slice(0, 300);

    // Apply specific Learning Style formatting:
    let response = '';

    if (selectedText) {
      response += `> "${selectedText.length > 140 ? selectedText.slice(0, 140) + '...' : selectedText}"\n\n`;
    }

    switch (style) {
      case 'eli5': {
        response += `### 🧒 Explain Like I’m 5: ${conceptName}\n\n`;
        response += `Imagine you are building a LEGO castle. ${conceptDef.replace(/[\w\s]+(?:is|are)\s+/i, '')}\n\n`;
        response += `**How it works simply:**\n`;
        response += `- Think of this like a helper that takes messy pieces and snaps them neatly into place.\n`;
        response += `- You don't have to worry about tiny gears; you just know that when you press the button, the magic happens!\n\n`;
        if (matchedConcept?.analogy) {
          response += `**Everyday Picture:** 🧸 ${matchedConcept.analogy}\n\n`;
        }
        response += `**Takeaway:**\nThis makes complex things simple so you can move forward with confidence!`;
        break;
      }

      case 'analogy': {
        response += `### 💡 Real-World Metaphor: ${conceptName}\n\n`;
        response += `**The Core Idea:**\n${conceptDef}\n\n`;
        const analogyText = matchedConcept?.analogy ||
          `Think of ${conceptName} like a postal sorting facility: incoming parcels (raw inputs) are scanned, categorized by zip code (routing), and loaded onto delivery trucks without ever mixing up the addresses.`;
        response += `**Analogy:**\n${analogyText}\n\n`;
        response += `**Why this analogy fits:**\nJust like the sorting center ensures packages arrive at the right doorstep, ${conceptName} guarantees data and operations flow smoothly through the system pipeline.\n\n`;
        response += `**Takeaway:**\nMaster the metaphor first, and the technical mechanics on Page ${pageNum} will feel natural!`;
        break;
      }

      case 'step_by_step': {
        response += `### 📋 Step-by-Step Breakdown: ${conceptName}\n\n`;
        response += `Here is how ${conceptName} operates sequentially:\n\n`;
        response += `1. **Initial Setup & Input Phase**: Collect the prerequisite variables and initialize the operating state on Page ${pageNum}.\n`;
        response += `2. **Core Transformation Mechanism**: Execute the fundamental transition: ${conceptDef.slice(0, 150)}.\n`;
        response += `3. **Validation & Verification**: Check output consistency against boundary constraints.\n`;
        response += `4. **Integration & Hand-off**: Pass the processed output to downstream components for subsequent sections.\n\n`;
        if (prereqs && prereqs.length > 0) {
          response += `**Prerequisite Anchor:** Requires understanding **${prereqs[0].name}** from Page ${prereqs[0].pageNumber}.\n\n`;
        }
        response += `**Takeaway:**\nFollow this sequence step by step to solve exercises and apply this in practice.`;
        break;
      }

      case 'academic': {
        response += `### 🎓 Formal Analysis: ${conceptName}\n\n`;
        response += `**Formal Definition & Scope:**\nLet the system on Page ${pageNum} define ${conceptName} as an invariant operational construct where: ${conceptDef}\n\n`;
        response += `**Theoretical Framework:**\n`;
        response += `- **Rigorous Foundations**: Operates under specified mathematical and domain constraints.\n`;
        response += `- **Optimization & Convergence**: Ensures bounded runtime and deterministic behavior.\n\n`;
        if (prereqs && prereqs.length > 0) {
          response += `- **Formal Dependency**: Formally depends on Lemma/Concept *${prereqs[0].name}* (Page ${prereqs[0].pageNumber}).\n\n`;
        }
        response += `**Takeaway:**\nThis provides the theoretical bedrock necessary for rigorous proofs and analytical derivation.`;
        break;
      }

      case 'intuitive':
      default: {
        response += `### 🧠 Intuitive Mental Model: ${conceptName}\n\n`;
        response += `**The "Why It Works":**\n${conceptDef}\n\n`;
        if (matchedConcept?.analogy) {
          response += `**Analogy:**\n${matchedConcept.analogy}\n\n`;
        }
        response += `**Mental Anchor:**\n`;
        response += `Instead of memorizing steps, picture the fundamental forces at play on Page ${pageNum}. When inputs change, the system shifts equilibrium to maintain stability.\n\n`;
        if (prereqs && prereqs.length > 0) {
          response += `🔍 **Foundation Link**: Connects directly to **${prereqs[0].name}** (Page ${prereqs[0].pageNumber}).\n\n`;
        }
        response += `**Takeaway:**\nOnce you grasp this physical intuition, the equations and implementations become second nature.`;
        break;
      }
    }

    return response;
  }

  /**
   * Generates a structured "I'm Lost" Recovery Diagnosis.
   */
  static generateImLostDiagnosis(ctx: AutonomousContext): ImLostDiagnosis {
    const {
      currentPage,
      allConcepts = [],
      preferences = {
        explanationStyle: 'intuitive',
        difficultyLevel: 'intermediate',
        responseLength: 'balanced',
        visualPreference: 'visual_first',
        autoPromptUnderstandingCheck: true,
      },
      memory,
      selectedText,
    } = ctx;

    const pageNum = currentPage?.pageNumber || 1;
    const activeConcepts = allConcepts.filter((c) => currentPage?.conceptIds?.includes(c.id));
    const primaryConcept = activeConcepts[0] || {
      id: 'core-concept',
      name: 'Current Document Section',
      definition: 'Foundational concepts on Page ' + pageNum,
      pageNumber: pageNum,
      sectionTitle: currentPage?.headings[0] || 'Current Section',
      difficulty: 'intermediate',
      prerequisites: [],
      dependents: [],
    };

    const unmasteredPrereqs = (primaryConcept.prerequisites || [])
      .map((pid) => allConcepts.find((c) => c.id === pid))
      .filter(Boolean)
      .filter((p) => !memory?.masteredConceptIds?.includes(p!.id)) as ConceptNode[];

    const missingPrereq = unmasteredPrereqs[0] || (primaryConcept.prerequisites.length > 0
      ? allConcepts.find((c) => c.id === primaryConcept.prerequisites[0])
      : undefined);

    const missingName = missingPrereq ? missingPrereq.name : primaryConcept.name;
    const missingPage = missingPrereq ? missingPrereq.pageNumber : Math.max(1, pageNum - 1);

    const struggleMsg = selectedText
      ? `You highlighted material involving ${primaryConcept.name}. It relies on foundational principles from ${missingName}.`
      : `Page ${pageNum} explores ${primaryConcept.name}, which builds on the prerequisite foundations of ${missingName}.`;

    const bridgeExp = missingPrereq?.definition
      ? `${missingPrereq.name} (from Page ${missingPage}) establishes the foundation: ${missingPrereq.definition}. With this anchor in mind, the mechanisms on Page ${pageNum} become straightforward.`
      : `${primaryConcept.name} works by taking raw inputs and applying systematic transformation. Page ${pageNum} feels overwhelming because it assumes prior familiarity with this signal pipeline.`;

    const analogy = missingPrereq?.analogy || primaryConcept.analogy ||
      'Imagine tuning a radio dial: if you skip adjusting the main frequency band (the prerequisite), fine-tuning the volume (the current page) will only give you louder static.';

    const visual = missingPrereq?.visualDiagram || primaryConcept.visualDiagram ||
      `+--------------------+        +------------------------+
| ${missingName} (P.${missingPage}) | -----> | ${primaryConcept.name} (P.${pageNum}) [You] |
+--------------------+        +------------------------+`;

    const understandingCheck: UnderstandingCheck = {
      id: `check-${Date.now()}`,
      conceptId: missingPrereq ? missingPrereq.id : primaryConcept.id,
      conceptName: missingName,
      question: `How does mastering ${missingName} (Page ${missingPage}) unlock the core idea of Page ${pageNum}?`,
      options: [
        {
          id: 'opt_1',
          text: `It provides the prerequisite transformation and mental model that Page ${pageNum} builds upon.`,
          isCorrect: true,
          explanation: `Correct! Grounding yourself in ${missingName} clarifies the subsequent mechanisms without cognitive overload.`,
        },
        {
          id: 'opt_2',
          text: `It completely replaces the need to understand Page ${pageNum}.`,
          isCorrect: false,
          explanation: `Incorrect. The prerequisite is a stepping stone, not a complete replacement.`,
        },
        {
          id: 'opt_3',
          text: `It introduces unrelated terminology that contradicts Page ${pageNum}.`,
          isCorrect: false,
          explanation: `Incorrect. The concepts are coherent and sequentially linked.`,
        },
      ],
    };

    return {
      currentPage: pageNum,
      currentSection: currentPage?.headings[0] || 'Current Section',
      detectedStruggle: struggleMsg,
      missingPrerequisiteId: missingPrereq?.id,
      missingPrerequisiteName: missingName,
      missingPrerequisitePage: missingPage,
      whyItMatters: `Mastering ${missingName} resolves the ambiguity on Page ${pageNum} and solidifies retention.`,
      bridgeExplanation: bridgeExp,
      analogyExplanation: analogy,
      visualDiagram: visual,
      quickTakeaway: `Anchor yourself in ${missingName} on Page ${missingPage} before advancing further on Page ${pageNum}.`,
      stepByStepPoints: [
        `1. Ground yourself in ${missingName} (Page ${missingPage})`,
        `2. Trace how its output transforms into ${primaryConcept.name} (Page ${pageNum})`,
        `3. Re-read Page ${pageNum} with this mental pipeline in mind`,
      ],
      understandingCheck,
      returnToPage: pageNum,
    };
  }
}
