import {
  GrammarCorrection,
  VocabWord,
  PronunciationResult,
  SpeakingScenario,
  SpeakingChatMessage,
  WordOfTheDayItem,
  DailyChallengeItem,
  SmartSuggestionItem,
  LearningLevel
} from '../types';

// Curated Master Dictionaries & Knowledge Base
export const GRAMMAR_PATTERNS: Array<{
  pattern: RegExp;
  fix: (match: string) => string;
  explanation: string;
  whyWrong: string;
  betterAlternative: string;
}> = [
  {
    pattern: /\b(he|she|it|this|that) (go|want|like|need|know|come|think|say|work|live)\b/i,
    fix: (m) => m.replace(/\b(go|want|like|need|know|come|think|say|work|live)\b/i, (w) => {
      const map: Record<string, string> = {
        go: 'goes', want: 'wants', like: 'likes', need: 'needs',
        know: 'knows', come: 'comes', think: 'thinks', say: 'says',
        work: 'works', live: 'lives'
      };
      return map[w.toLowerCase()] || w + 's';
    }),
    explanation: 'In Present Simple, third-person singular subjects (He, She, It) require an "s" or "es" at the end of the verb.',
    whyWrong: 'Using the base verb with third-person singular violates Subject-Verb Agreement.',
    betterAlternative: 'Make sure to add "s" to the action word when talking about one person or thing.'
  },
  {
    pattern: /\bi am agree\b/i,
    fix: () => 'I agree',
    explanation: '"Agree" is already a main verb in English. You do not need "am" before it.',
    whyWrong: 'Adding "am" creates an unnecessary auxiliary verb in front of an active verb.',
    betterAlternative: 'Say "I agree" or "I completely agree with you".'
  },
  {
    pattern: /\bdidn't (went|came|saw|ate|took|gave|wrote|said|told)\b/i,
    fix: (m) => m.replace(/(went|came|saw|ate|took|gave|wrote|said|told)/i, (w) => {
      const map: Record<string, string> = {
        went: 'go', came: 'come', saw: 'see', ate: 'eat',
        took: 'take', gave: 'give', wrote: 'write', said: 'say', told: 'tell'
      };
      return map[w.toLowerCase()] || w;
    }),
    explanation: 'After "didn\'t" (did not), always use the base form (V1) of the verb, not the past tense (V2).',
    whyWrong: 'Using double past tense ("didn\'t" + past verb) is grammatically incorrect.',
    betterAlternative: 'Always use base verb after "didn\'t", e.g., "I didn\'t go".'
  },
  {
    pattern: /\b(he|she|it) don't\b/i,
    fix: (m) => m.replace(/don't/i, "doesn't"),
    explanation: 'Use "doesn\'t" for singular subjects (He, She, It) and "don\'t" for I, You, We, They.',
    whyWrong: '"Don\'t" is plural; third-person singular requires "doesn\'t".',
    betterAlternative: 'He doesn\'t like tea / She doesn\'t work on Sundays.'
  },
  {
    pattern: /\bmore (better|taller|faster|bigger|smarter|longer|harder)\b/i,
    fix: (m) => m.replace(/more /i, ''),
    explanation: 'Do not double-compare! Words ending in "-er" are already comparative.',
    whyWrong: '"More" and "-er" both mark comparative degree; using both is redundant.',
    betterAlternative: 'Say "Much better" or simply "Better".'
  },
  {
    pattern: /\bme and my friend (went|went to|are|were|have)\b/i,
    fix: (m) => m.replace(/me and my friend/i, 'My friend and I'),
    explanation: 'When you are the subject doing the action, use "I" instead of "me", and put the other person first.',
    whyWrong: '"Me" is an object pronoun and polite English lists the other person first.',
    betterAlternative: 'My friend and I went to the park.'
  },
  {
    pattern: /\bwhere (you are|you going|you live|you work)\b/i,
    fix: (m) => {
      if (/you are/i.test(m)) return m.replace(/you are/i, 'are you');
      if (/you going/i.test(m)) return 'where are you going';
      if (/you live/i.test(m)) return 'where do you live';
      if (/you work/i.test(m)) return 'where do you work';
      return m;
    },
    explanation: 'In English questions, the helper verb (are/do) comes BEFORE the subject (you).',
    whyWrong: 'Putting subject before auxiliary verb turns a question into a statement format.',
    betterAlternative: 'Where are you going? / Where do you live?'
  }
];

export function analyzeGrammar(text: string, level: LearningLevel = 'beginner'): GrammarCorrection {
  const cleanText = text.trim();
  if (!cleanText) {
    return {
      originalText: '',
      correctedText: '',
      explanation: 'Please enter a sentence to check.',
      whyWrong: '',
      betterAlternative: '',
      highlights: []
    };
  }

  let correctedText = cleanText;
  let explanation = 'Your sentence looks grammatically clear and natural!';
  let whyWrong = 'No major grammar mistakes were detected.';
  let betterAlternative = cleanText;
  const highlights: GrammarCorrection['highlights'] = [];

  let foundMatch = false;

  for (const patternObj of GRAMMAR_PATTERNS) {
    if (patternObj.pattern.test(cleanText)) {
      foundMatch = true;
      const match = cleanText.match(patternObj.pattern)?.[0] || '';
      const fixedSegment = patternObj.fix(match);
      correctedText = cleanText.replace(patternObj.pattern, fixedSegment);
      explanation = patternObj.explanation;
      whyWrong = patternObj.whyWrong;
      betterAlternative = patternObj.betterAlternative;

      highlights.push({
        text: match,
        type: 'error',
        explanation: `Original mistake: "${match}"`
      });
      highlights.push({
        text: fixedSegment,
        type: 'correction',
        explanation: `Correction: "${fixedSegment}"`
      });
      break;
    }
  }

  if (!foundMatch) {
    // Check general stylistic / fluency enhancements based on Level
    if (level === 'beginner') {
      betterAlternative = cleanText.charAt(0).toUpperCase() + cleanText.slice(1);
      if (!/[.!?]$/.test(betterAlternative)) betterAlternative += '.';
    } else if (level === 'intermediate') {
      betterAlternative = `In polite conversation: "${cleanText}" can be phrased as "${cleanText.replace(/\b(want|need)\b/gi, 'would like')}".`;
    } else {
      betterAlternative = `Professional tone: "${cleanText.replace(/\b(good|nice)\b/gi, 'exceptional')}".`;
    }

    highlights.push({
      text: cleanText,
      type: 'suggestion',
      explanation: 'Sentence structure is valid and grammatically correct.'
    });
  }

  return {
    originalText: cleanText,
    correctedText,
    explanation,
    whyWrong,
    betterAlternative,
    highlights
  };
}

// Master Vocabulary Knowledge Base
export const MASTER_VOCAB_DB: VocabWord[] = [
  {
    id: 'v-1',
    word: 'Fluency',
    meaning: 'The ability to speak or write a language easily and accurately.',
    partOfSpeech: 'Noun',
    pronunciation: 'FLOO-un-see',
    ipa: '/ˈfluː.ən.si/',
    teluguMeaning: 'ధారాళంగా మాట్లాడే సామర్థ్యం (ధారాళత)',
    synonyms: ['Eloquence', 'Articulateness', 'Command'],
    antonyms: ['Hesitation', 'Inarticulateness'],
    exampleSentences: [
      'Daily speaking practice increases your English fluency.',
      'She speaks English with great confidence and fluency.'
    ],
    difficulty: 'intermediate',
    isSaved: true,
    sourceSentence: 'Practice every day to build English fluency.'
  },
  {
    id: 'v-2',
    word: 'Vocabulary',
    meaning: 'The body of words used in a particular language or by a person.',
    partOfSpeech: 'Noun',
    pronunciation: 'voh-KAB-yuh-ler-ee',
    ipa: '/vəˈkæb.jə.ler.i/',
    teluguMeaning: 'పదజాలం (మాట్లాడే పదాలు)',
    synonyms: ['Lexicon', 'Terminology', 'Wordbook'],
    antonyms: ['Silence'],
    exampleSentences: [
      'Learning 5 new words daily grows your vocabulary rapidly.',
      'A rich vocabulary helps you express complex ideas clearly.'
    ],
    difficulty: 'beginner',
    isSaved: true,
    sourceSentence: 'Expand your vocabulary with daily challenges.'
  },
  {
    id: 'v-3',
    word: 'Articulate',
    meaning: 'Expressing oneself clearly and effectively in speech.',
    partOfSpeech: 'Adjective / Verb',
    pronunciation: 'ar-TIK-yuh-lit',
    ipa: '/ɑːrˈtɪk.jə.lət/',
    teluguMeaning: 'విస్పష్టంగా వ్యక్తీకరించుట',
    synonyms: ['Expressive', 'Clear', 'Eloquent'],
    antonyms: ['Inarticulate', 'Unclear'],
    exampleSentences: [
      'An articulate speaker easily convinces the audience.',
      'Try to articulate each syllable slowly while practicing.'
    ],
    difficulty: 'advanced',
    isSaved: false,
    sourceSentence: 'Be articulate in job interviews.'
  },
  {
    id: 'v-4',
    word: 'Perseverance',
    meaning: 'Continued effort to do something despite difficulties or delays.',
    partOfSpeech: 'Noun',
    pronunciation: 'pur-suh-VEER-unss',
    ipa: '/ˌpɜː.sɪˈvɪə.rəns/',
    teluguMeaning: 'పట్టుదల / స్థిరమైన ప్రయత్నం',
    synonyms: ['Persistence', 'Determination', 'Tenacity'],
    antonyms: ['Giving up', 'Apathy'],
    exampleSentences: [
      'Mastering spoken English takes time and perseverance.',
      'With perseverance, you will overcome language barriers.'
    ],
    difficulty: 'advanced',
    isSaved: true,
    sourceSentence: 'Perseverance is key to learning any new language.'
  },
  {
    id: 'v-5',
    word: 'Polite',
    meaning: 'Having or showing behavior that is respectful and considerate.',
    partOfSpeech: 'Adjective',
    pronunciation: 'puh-LYTE',
    ipa: '/pəˈlaɪt/',
    teluguMeaning: 'మర్యాదగల / వినయపూర్వకమైన',
    synonyms: ['Courteous', 'Respectful', 'Civil'],
    antonyms: ['Rude', 'Impolite'],
    exampleSentences: [
      'Always use polite phrases like "Excuse me" and "Thank you".',
      'He gave a polite answer to the customer query.'
    ],
    difficulty: 'beginner',
    isSaved: false,
    sourceSentence: 'Use polite words in daily communication.'
  }
];

export function extractVocabulary(englishSentence: string, teluguSentence: string = ''): VocabWord[] {
  const cleanWords = englishSentence
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const results: VocabWord[] = [];

  cleanWords.forEach((wordStr, index) => {
    const lower = wordStr.toLowerCase();
    const existing = MASTER_VOCAB_DB.find((v) => v.word.toLowerCase() === lower);
    if (existing) {
      results.push({ ...existing, sourceSentence: englishSentence });
    } else {
      // Dynamic fallback vocabulary generator
      const ipaEstimated = `/${lower}/`;
      results.push({
        id: `dyn-${wordStr}-${index}`,
        word: wordStr.charAt(0).toUpperCase() + wordStr.slice(1).toLowerCase(),
        meaning: `Essential word used in sentence: "${englishSentence.slice(0, 30)}..."`,
        partOfSpeech: index % 2 === 0 ? 'Noun/Verb' : 'Adjective/Adverb',
        pronunciation: wordStr.toUpperCase(),
        ipa: ipaEstimated,
        teluguMeaning: teluguSentence ? `ముఖ్యమైన పదం (${wordStr})` : `ఇంగ్లీష్ పదం (${wordStr})`,
        synonyms: ['Term', 'Expression'],
        antonyms: ['N/A'],
        exampleSentences: [`"${englishSentence}"`],
        difficulty: wordStr.length > 7 ? 'advanced' : wordStr.length > 5 ? 'intermediate' : 'beginner',
        isSaved: false,
        sourceSentence: englishSentence
      });
    }
  });

  return results.length > 0 ? results.slice(0, 4) : MASTER_VOCAB_DB.slice(0, 2);
}

// Pronunciation Coach Analyzer
export function analyzePronunciation(targetText: string, spokenText: string): PronunciationResult {
  const cleanTarget = targetText.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(Boolean);
  const cleanSpoken = spokenText.toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(Boolean);

  if (cleanSpoken.length === 0) {
    return {
      overallScore: 0,
      phoneticGuidance: 'No speech detected. Please press the mic and speak clearly into your microphone.',
      wordScores: cleanTarget.map((w) => ({
        word: w,
        score: 0,
        difficulty: w.length > 7 ? 'hard' : w.length > 5 ? 'medium' : 'easy',
        ipa: `/${w}/`,
        suggestion: `Listen to audio reference and practice saying "${w}".`
      }))
    };
  }

  let totalScoreSum = 0;
  const wordScores: PronunciationResult['wordScores'] = [];

  cleanTarget.forEach((word) => {
    let wordScore = 0;
    if (cleanSpoken.includes(word)) {
      wordScore = 95 + Math.floor(Math.random() * 5);
    } else {
      // Check partial match / Levenshtein similarity
      const partial = cleanSpoken.some((sw) => sw.startsWith(word.slice(0, 3)) || word.startsWith(sw.slice(0, 3)));
      wordScore = partial ? 65 : 40;
    }
    totalScoreSum += wordScore;

    const diff: 'easy' | 'medium' | 'hard' = word.length > 7 ? 'hard' : word.length > 5 ? 'medium' : 'easy';

    wordScores.push({
      word,
      score: wordScore,
      difficulty: diff,
      ipa: `/${word}/`,
      suggestion:
        wordScore > 85
          ? 'Excellent articulation!'
          : wordScore > 60
          ? `Focus on clear vowel sounds in "${word}".`
          : `Practice breaking "${word}" into syllables.`
    });
  });

  const overallScore = Math.min(100, Math.round(totalScoreSum / Math.max(1, cleanTarget.length)));

  let phoneticGuidance = '';
  if (overallScore >= 90) {
    overallScore >= 95 ? (phoneticGuidance = 'Outstanding native-like pronunciation!') : (phoneticGuidance = 'Clear articulation and strong rhythm.');
  } else if (overallScore >= 70) {
    phoneticGuidance = 'Good effort! Pay attention to the highlighted difficult words for smoother fluency.';
  } else {
    phoneticGuidance = 'Slow down slightly and focus on pronouncing each word clearly. Use Native Audio preview to listen first.';
  }

  return {
    overallScore,
    phoneticGuidance,
    wordScores,
    transcription: spokenText
  };
}

// Speaking Practice Partner Scenarios
export interface ScenarioDetail {
  id: SpeakingScenario;
  title: string;
  description: string;
  iconName: string;
  initialPrompt: string;
  suggestedUserPhrases: string[];
  partnerRole: string;
}

export const SCENARIO_DETAILS: ScenarioDetail[] = [
  {
    id: 'Interview',
    title: 'Job Interview',
    description: 'Practice answering HR and professional career questions with an AI Hiring Manager.',
    iconName: 'Briefcase',
    initialPrompt: 'Welcome to our interview today! Could you please introduce yourself and share your background?',
    suggestedUserPhrases: [
      'Hello! My name is Santosh, and I have experience in software development.',
      'Thank you for giving me this opportunity.',
      'I am hard-working, enthusiastic, and eager to learn new skills.'
    ],
    partnerRole: 'AI Hiring Manager'
  },
  {
    id: 'Shopping',
    title: 'Supermarket & Shopping',
    description: 'Practice asking prices, bargaining, requesting sizes, and checkout conversations.',
    iconName: 'ShoppingBag',
    initialPrompt: 'Hello! Welcome to Smart Supermarket. How can I help you find what you need today?',
    suggestedUserPhrases: [
      'Excuse me, where can I find fresh milk?',
      'How much does this pair of shoes cost?',
      'Is there any discount available on this item?'
    ],
    partnerRole: 'Store Executive'
  },
  {
    id: 'Hotel',
    title: 'Hotel Check-in & Stay',
    description: 'Practice room booking, room service requests, and asking about hotel amenities.',
    iconName: 'Building',
    initialPrompt: 'Good evening! Welcome to Grand Palace Hotel. Do you have a reservation with us?',
    suggestedUserPhrases: [
      'Yes, I booked a deluxe room under the name of Santosh.',
      'Could you please provide the Wi-Fi password?',
      'What time is breakfast served in the morning?'
    ],
    partnerRole: 'Hotel Receptionist'
  },
  {
    id: 'Airport',
    title: 'Airport Check-in & Immigration',
    description: 'Practice boarding pass inquiries, baggage check-in, and security clearance answers.',
    iconName: 'Plane',
    initialPrompt: 'Good morning! Passport and ticket, please. Where are you flying to today?',
    suggestedUserPhrases: [
      'Here is my passport and e-ticket. I am flying to London.',
      'Is this bag considered hand luggage?',
      'Where is boarding gate number 12?'
    ],
    partnerRole: 'Immigration Officer'
  },
  {
    id: 'Restaurant',
    title: 'Dining & Food Order',
    description: 'Practice ordering food, asking for menu recommendations, and paying the bill.',
    iconName: 'Utensils',
    initialPrompt: 'Welcome to Royal Dining! Table for how many people today?',
    suggestedUserPhrases: [
      'A table for two, please.',
      'What is today’s chef special recommendation?',
      'Could we please have the check / bill?'
    ],
    partnerRole: 'Restaurant Server'
  },
  {
    id: 'Hospital',
    title: 'Doctor Consultation & Health',
    description: 'Practice describing symptoms, asking for medical advice, and pharmacy pickup.',
    iconName: 'HeartPulse',
    initialPrompt: 'Hello! Please take a seat. What symptoms or problems are you experiencing today?',
    suggestedUserPhrases: [
      'Doctor, I have had a headache and fever since yesterday.',
      'How many times a day should I take this medicine?',
      'Will I need any blood tests?'
    ],
    partnerRole: 'Doctor'
  },
  {
    id: 'College',
    title: 'College & University Life',
    description: 'Practice talking with professors, joining group studies, and library inquiries.',
    iconName: 'GraduationCap',
    initialPrompt: 'Hey! Are you attending the computer science lecture at 10 AM?',
    suggestedUserPhrases: [
      'Yes! I am going there now. Would you like to walk together?',
      'Could you share your lecture notes with me?',
      'Where is the main library building located?'
    ],
    partnerRole: 'Classmate'
  },
  {
    id: 'Office',
    title: 'Office Team Meeting',
    description: 'Practice project status updates, giving feedback, and polite workplace requests.',
    iconName: 'Laptop',
    initialPrompt: 'Good morning team! Let’s start our weekly update. Santosh, how is your project progressing?',
    suggestedUserPhrases: [
      'Everything is on track. We finished the first phase yesterday.',
      'Could you clarify the deadline for this task?',
      'I agree with your proposal for the project schedule.'
    ],
    partnerRole: 'Team Lead'
  },
  {
    id: 'Daily Conversation',
    title: 'Casual Daily Talk',
    description: 'Practice making friends, talking about hobbies, weather, weekend plans, and daily routine.',
    iconName: 'MessageCircle',
    initialPrompt: 'Hey there! How has your week been going so far? Doing anything fun this weekend?',
    suggestedUserPhrases: [
      'Hi! It has been busy, but good. I plan to relax and watch movies this weekend.',
      'The weather is very pleasant today!',
      'What are your favorite hobbies?'
    ],
    partnerRole: 'AI Friend'
  }
];

export function generatePartnerReply(
  scenario: SpeakingScenario,
  userText: string,
  level: LearningLevel = 'beginner'
): { text: string; grammarCorrection?: GrammarCorrection } {
  const grammarCorrection = analyzeGrammar(userText, level);

  const lower = userText.toLowerCase();
  let replyText = '';

  if (scenario === 'Interview') {
    if (lower.includes('hello') || lower.includes('name is') || lower.includes('experience')) {
      replyText = 'Impressive! Thank you for sharing. What would you say is your greatest strength in teamwork?';
    } else if (lower.includes('strength') || lower.includes('hard') || lower.includes('learn')) {
      replyText = 'That is great to hear. Can you tell me about a challenge you faced and how you overcame it?';
    } else {
      replyText = 'Thank you for that response! Do you have any questions for me about our company environment?';
    }
  } else if (scenario === 'Shopping') {
    if (lower.includes('milk') || lower.includes('find') || lower.includes('where')) {
      replyText = 'You can find fresh dairy products in Aisle 3 on the right. Is there anything else you are looking for?';
    } else if (lower.includes('cost') || lower.includes('price') || lower.includes('discount')) {
      replyText = 'This item is currently 20% off! The final discounted price comes out to $15. Would you like me to pack it for you?';
    } else {
      replyText = 'Sure thing! You can head over to Counter 2 for quick billing. Have a wonderful day!';
    }
  } else if (scenario === 'Restaurant') {
    if (lower.includes('table') || lower.includes('two') || lower.includes('menu')) {
      replyText = 'Right this way, please! Here are your menus. May I start you off with water or fresh juice?';
    } else if (lower.includes('recommend') || lower.includes('special') || lower.includes('food')) {
      replyText = 'Our chef special today is Grilled Lemon Herb Chicken served with garlic rice. It is delicious!';
    } else {
      replyText = 'Excellent choice! I will place your order right away. It will be ready in about 15 minutes.';
    }
  } else {
    // General conversational response
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('good morning')) {
      replyText = 'Hello! It is great talking to you. How can I assist you further today?';
    } else if (lower.includes('thank') || lower.includes('thanks')) {
      replyText = 'You are very welcome! Keep up the awesome spoken English practice!';
    } else {
      replyText = 'That sounds fantastic! Tell me more about that or ask me another question.';
    }
  }

  // Adjust complexity based on Level
  if (level === 'beginner') {
    // Keep sentences short and clear
  } else if (level === 'advanced') {
    replyText += ' Furthermore, feel free to elaborate on your thoughts in detail.';
  }

  return {
    text: replyText,
    grammarCorrection: grammarCorrection.highlights.some((h) => h.type === 'error') ? grammarCorrection : undefined
  };
}

// Featured Word of the Day
export const WORD_OF_THE_DAY: WordOfTheDayItem = {
  id: 'wotd-1',
  word: 'Enthusiastic',
  meaning: 'Having or showing intense and eager enjoyment, interest, or approval.',
  partOfSpeech: 'Adjective',
  ipa: '/ɪnˌθjuː.ziˈæs.tɪk/',
  teluguMeaning: 'ఉత్సాహపూరితమైన / మిక్కిలి ఆసక్తి గల',
  usage: 'Used to describe someone who shows high energy, interest, and positive attitude.',
  example: 'She is very enthusiastic about improving her spoken English skills.',
  quiz: {
    question: 'Which word is a SYNONYM of "Enthusiastic"?',
    options: ['Eager & Passionate', 'Sleepy', 'Hesitant', 'Angry'],
    answerIndex: 0,
    explanation: '"Eager & Passionate" means full of enthusiasm and positive energy!'
  }
};

// Daily Challenges Initial Data
export const INITIAL_DAILY_CHALLENGES: DailyChallengeItem[] = [
  {
    id: 'c-1',
    title: 'Morning Speaking Practice',
    category: 'Speaking',
    description: 'Record yourself speaking 3 complete sentences about your daily morning routine.',
    targetGoal: 'Score > 80% on Pronunciation Coach',
    completed: true,
    score: 92
  },
  {
    id: 'c-2',
    title: 'Grammar Master Drill',
    category: 'Grammar',
    description: 'Identify and fix 3 Subject-Verb agreement sentence errors in the Grammar Checker.',
    targetGoal: 'Correct 3 sentences cleanly',
    completed: false
  },
  {
    id: 'c-3',
    title: 'Vocabulary Expander',
    category: 'Vocabulary',
    description: 'Learn and save 3 new English words with Telugu meanings to your Personal List.',
    targetGoal: 'Save 3 words',
    completed: true,
    score: 100
  },
  {
    id: 'c-4',
    title: 'Listening & Repeat Challenge',
    category: 'Listening',
    description: 'Listen to native accent audio 3 times and repeat with matching speech rate.',
    targetGoal: 'Complete 3 audio replays',
    completed: false
  },
  {
    id: 'c-5',
    title: 'Airport Roleplay Partner',
    category: 'Conversation',
    description: 'Complete a 5-turn dialogue exchange in the Airport immigration scenario.',
    targetGoal: '5 message exchanges',
    completed: false
  }
];

// Smart Suggestions Knowledge Base
export const MASTER_SMART_SUGGESTIONS: SmartSuggestionItem[] = [
  {
    id: 's-1',
    category: 'Better Words',
    original: 'Very good',
    suggested: 'Exceptional / Outstanding / Splendid',
    explanation: 'Using precise adjectives makes your spoken English sound sophisticated and confident.',
    contextExample: 'Instead of "It was a very good performance", say "It was an outstanding performance!"'
  },
  {
    id: 's-2',
    category: 'Natural Expressions',
    original: 'I am fine',
    suggested: 'I’m doing great! / Can’t complain! / Never better!',
    explanation: 'Native speakers frequently use lively expressions instead of repetitive textbook phrases.',
    contextExample: 'Friend: "How are you?" -> You: "Doing great, thanks! How about you?"'
  },
  {
    id: 's-3',
    category: 'Idioms',
    original: 'It is very easy',
    suggested: 'A piece of cake / Easy as pie',
    explanation: '"A piece of cake" is a common idiom meaning something is effortless to achieve.',
    contextExample: 'Don’t worry about the English quiz, it will be a piece of cake for you!'
  },
  {
    id: 's-4',
    category: 'Phrasal Verbs',
    original: 'Cancel the meeting',
    suggested: 'Call off the meeting',
    explanation: '"Call off" is a phrasal verb widely used in professional business communication.',
    contextExample: 'We had to call off the afternoon meeting due to unexpected heavy rain.'
  },
  {
    id: 's-5',
    category: 'Professional',
    original: 'I want job',
    suggested: 'I am actively seeking career opportunities in your organization',
    explanation: 'Rephrasing plain desires into professional career statements showcases maturity.',
    contextExample: 'Interview context: "I am actively seeking career opportunities where I can add value."'
  },
  {
    id: 's-6',
    category: 'Business',
    original: 'Give me update',
    suggested: 'Could you please keep me posted on the project status?',
    explanation: '"Keep me posted" is polite and standard corporate etiquette.',
    contextExample: 'Please keep me posted once the client approves the final document.'
  },
  {
    id: 's-7',
    category: 'Formal',
    original: 'Thanks a lot',
    suggested: 'I truly appreciate your assistance and guidance',
    explanation: 'Formal language demonstrates high respect in written emails and official letters.',
    contextExample: 'Dear Sir, I truly appreciate your timely guidance on my application.'
  },
  {
    id: 's-8',
    category: 'Informal',
    original: 'What is your opinion?',
    suggested: 'What do you think? / What’s your take on this?',
    explanation: '"What’s your take?" is friendly and casual for peer discussions.',
    contextExample: 'We are deciding where to go for lunch—what’s your take?'
  }
];
