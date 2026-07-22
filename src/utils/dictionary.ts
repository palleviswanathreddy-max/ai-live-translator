import { StudentBreakdown } from '../types';

export interface DictionaryEntry {
  telugu: string;
  english: string;
  phonetic: string;
  grammarTip: string;
  keywords: Array<{ word: string; meaning: string; type: string }>;
  simpleAlternative?: string;
  usageContext: string;
}

export const TELUGU_ENGLISH_DICTIONARY: DictionaryEntry[] = [
  {
    telugu: "నమస్కారం! మీరు ఎలా ఉన్నారు?",
    english: "Hello! How are you?",
    phonetic: "Namaskāram! Mīru elā unnāru?",
    grammarTip: "'How are you' is used to greet someone politely. In response, say 'I am fine, thank you.'",
    keywords: [
      { word: "Namaskaram", meaning: "Hello / Greetings", type: "Noun" },
      { word: "Miru", meaning: "You (Respectful)", type: "Pronoun" },
      { word: "Ela", meaning: "How", type: "Adverb" }
    ],
    simpleAlternative: "Hi! How do you do?",
    usageContext: "Daily Greetings"
  },
  {
    telugu: "నా పేరు సంతోష్. మీ పేరేమిటి?",
    english: "My name is Santosh. What is your name?",
    phonetic: "Nā pēru Santōṣ. Mī pērēmiṭi?",
    grammarTip: "'What is your name?' introduces yourself. Use 'is' for singular noun 'name'.",
    keywords: [
      { word: "Naa peru", meaning: "My name", type: "Phrase" },
      { word: "Mee peru", meaning: "Your name", type: "Phrase" }
    ],
    simpleAlternative: "I am Santosh. May I know your name?",
    usageContext: "Introductions"
  },
  {
    telugu: "నేను ఇంగ్లీష్ నేర్చుకోవాలనుకుంటున్నాను.",
    english: "I want to learn English.",
    phonetic: "Nēnu iṅglīṣ nērčukōvālanukuṇṭunnānu.",
    grammarTip: "'want to + verb' expresses a desire or goal (e.g., want to learn, want to speak).",
    keywords: [
      { word: "Nenu", meaning: "I", type: "Pronoun" },
      { word: "Nerchukovalanukuntunnanu", meaning: "Want to learn", type: "Verb" }
    ],
    simpleAlternative: "I am interested in learning English.",
    usageContext: "Education & Learning"
  },
  {
    telugu: "దయచేసి కొంచెం నెమ్మదిగా మాట్లాడగలరా?",
    english: "Could you please speak a bit slower?",
    phonetic: "Dayacēsi koñcaṁ nemmadigā māṭlāḍagalarā?",
    grammarTip: "'Could you please...' is a very polite modal verb phrase for requesting assistance.",
    keywords: [
      { word: "Dayachesi", meaning: "Please", type: "Adverb" },
      { word: "Nemmadiga", meaning: "Slower / Slowly", type: "Adverb" },
      { word: "Matladagalara", meaning: "Can you speak", type: "Verb" }
    ],
    simpleAlternative: "Please speak slowly.",
    usageContext: "Spoken English Practice"
  },
  {
    telugu: "నాకు సహాయం చేయగలరా?",
    english: "Can you help me?",
    phonetic: "Nāku sahāyaṁ cēyagalarā?",
    grammarTip: "'Can you + help + me' uses the modal 'can' to ask for assistance.",
    keywords: [
      { word: "Naaku", meaning: "To me / Me", type: "Pronoun" },
      { word: "Sahayam", meaning: "Help", type: "Noun" }
    ],
    simpleAlternative: "Could you give me a hand?",
    usageContext: "General Assistance"
  },
  {
    telugu: "ధన్యవాదాలు! చాలా సంతోషం.",
    english: "Thank you! Very happy to meet you.",
    phonetic: "Dhanyavādālu! Cālā santōṣam.",
    grammarTip: "'Thank you' shows gratitude. 'Happy to meet you' expresses pleasure in meeting.",
    keywords: [
      { word: "Dhanyavadalu", meaning: "Thank you", type: "Expression" },
      { word: "Chala", meaning: "Very / Much", type: "Adverb" },
      { word: "Santosham", meaning: "Happiness", type: "Noun" }
    ],
    simpleAlternative: "Thanks a lot! Nice to meet you.",
    usageContext: "Gratitude & Conversation"
  },
  {
    telugu: "ఈ పుస్తకం ఎంత?",
    english: "How much is this book?",
    phonetic: "Ī pustakaṁ enta?",
    grammarTip: "Use 'How much is...' to ask the price of a singular item.",
    keywords: [
      { word: "Ee", meaning: "This", type: "Demonstrative" },
      { word: "Pustakam", meaning: "Book", type: "Noun" },
      { word: "Entha", meaning: "How much", type: "Question Word" }
    ],
    simpleAlternative: "What is the cost of this book?",
    usageContext: "Shopping & Travel"
  },
  {
    telugu: "నేను బస్సు స్టాప్‌కు ఎలా వెళ్లాలి?",
    english: "How do I get to the bus stop?",
    phonetic: "Nēnu bassu sṭāp-ku elā veḷḷāli?",
    grammarTip: "'How do I get to + location' is the standard way to ask for directions.",
    keywords: [
      { word: "Vellali", meaning: "Must go / Should go", type: "Verb" },
      { word: "Ela", meaning: "How", type: "Adverb" }
    ],
    simpleAlternative: "Where is the bus stop?",
    usageContext: "Travel & Directions"
  },
  {
    telugu: "నాకు ఆకలిగా ఉంది.",
    english: "I am feeling hungry.",
    phonetic: "Nāku ākaligā undi.",
    grammarTip: "'I am feeling + adjective' describes physical sensations or emotions.",
    keywords: [
      { word: "Aakali", meaning: "Hunger", type: "Noun" },
      { word: "Undi", meaning: "Is present / Am", type: "Verb" }
    ],
    simpleAlternative: "I am hungry.",
    usageContext: "Daily Life"
  },
  {
    telugu: "ఈరోజు వాతావరణం చాలా బాగుంది.",
    english: "The weather is very good today.",
    phonetic: "Īrōju vātāvaraṇaṁ cālā bāgundi.",
    grammarTip: "'Today' can come at the beginning or end of a sentence for time reference.",
    keywords: [
      { word: "Eeroju", meaning: "Today", type: "Noun" },
      { word: "Vaathavaranam", meaning: "Weather", type: "Noun" },
      { word: "Baagundi", meaning: "Is good", type: "Adjective" }
    ],
    simpleAlternative: "It is a nice day today.",
    usageContext: "Small Talk"
  }
];

export function findLocalTranslation(text: string, fromLang: string): DictionaryEntry | null {
  const clean = text.trim().toLowerCase();
  
  return TELUGU_ENGLISH_DICTIONARY.find(entry => {
    if (fromLang === 'te-IN') {
      return entry.telugu.toLowerCase().includes(clean) || clean.includes(entry.telugu.toLowerCase());
    } else {
      return entry.english.toLowerCase().includes(clean) || clean.includes(entry.english.toLowerCase());
    }
  }) || null;
}

export function generateStudentBreakdown(englishText: string, teluguText: string): StudentBreakdown {
  const words = englishText.split(' ').filter(w => w.length > 2);
  const mainKeywords = words.slice(0, 3).map((w, idx) => ({
    word: w.replace(/[^a-zA-Z]/g, ''),
    meaning: idx === 0 ? "Key concept verb/subject" : idx === 1 ? "Action modifier" : "Context object",
    type: idx === 0 ? "Verb/Subject" : "Noun"
  }));

  // Estimate phonetic transliteration
  const phonetic = teluguText + " (Spoken: " + englishText + ")";

  return {
    phonetic: phonetic,
    grammarTip: `Tip for Learners: Notice how standard English uses Subject + Verb + Object order ("${englishText.slice(0, 20)}..."). Practice saying this phrase aloud 3 times.`,
    keywords: mainKeywords.length > 0 ? mainKeywords : [{ word: "English Phrase", meaning: "Daily Spoken Expression", type: "Phrase" }],
    simpleAlternative: `Easy spoken version: "${englishText}"`,
    usageContext: "Spoken English Practice"
  };
}
