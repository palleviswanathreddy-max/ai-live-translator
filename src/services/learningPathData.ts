import { LevelNode, Lesson } from '../types';

export const LEVEL_NODES: LevelNode[] = [
  {
    id: 1,
    title: 'Level 1 – Alphabet & Sounds',
    teluguTitle: 'అక్షరాలు మరియు శబ్దాలు (Phonics & Vowels)',
    description: 'Master English vowel sounds, consonants, and phonetic pronunciation.',
    icon: 'Volume2',
    unlocked: true,
    completedLessons: 1,
    totalLessons: 3,
    badgeName: 'Phonics Pioneer'
  },
  {
    id: 2,
    title: 'Level 2 – Basic Words',
    teluguTitle: 'ప్రాథమిక పదాలు (Daily Basic Words)',
    description: 'Learn essential everyday words for greetings, family, numbers, and colors.',
    icon: 'BookOpen',
    unlocked: true,
    completedLessons: 0,
    totalLessons: 3,
    badgeName: 'Vocabulary Starter'
  },
  {
    id: 3,
    title: 'Level 3 – Daily Vocabulary',
    teluguTitle: 'నిత్య జీవిత పదజాలం (Life Vocab)',
    description: 'Expand vocabulary for food, home items, emotions, and places.',
    icon: 'Layers',
    unlocked: false,
    completedLessons: 0,
    totalLessons: 3,
    badgeName: 'Word Master'
  },
  {
    id: 4,
    title: 'Level 4 – Basic Sentences',
    teluguTitle: 'సాధారణ వాక్యాలు (Sentence Building)',
    description: 'Construct Subject-Verb-Object sentences and ask simple questions.',
    icon: 'AlignLeft',
    unlocked: false,
    completedLessons: 0,
    totalLessons: 3,
    badgeName: 'Sentence Builder'
  },
  {
    id: 5,
    title: 'Level 5 – Daily Conversations',
    teluguTitle: 'దైనందిన సంభాషణలు (Daily Talk)',
    description: 'Engage in small talk about weather, hobbies, and morning routines.',
    icon: 'MessageSquare',
    unlocked: false,
    completedLessons: 0,
    totalLessons: 3,
    badgeName: 'Conversation Champ'
  },
  {
    id: 6,
    title: 'Level 6 – Grammar Mastery',
    teluguTitle: 'వ్యాకరణ ప్రావీణ్యం (Tenses & Prepositions)',
    description: 'Master Present, Past, Future tenses, prepositions, and modal verbs.',
    icon: 'CheckCircle2',
    unlocked: false,
    completedLessons: 0,
    totalLessons: 3,
    badgeName: 'Grammar Doctor'
  },
  {
    id: 7,
    title: 'Level 7 – Pronunciation & Accent',
    teluguTitle: 'ఉచ్ఛారణ & యాస (Speech Clarity)',
    description: 'Perfect word stress, intonation, and difficult consonant sounds.',
    icon: 'Mic',
    unlocked: false,
    completedLessons: 0,
    totalLessons: 3,
    badgeName: 'Clarity Star'
  },
  {
    id: 8,
    title: 'Level 8 – Listening Practice',
    teluguTitle: 'వినే శిక్షణ (Native Audio Drills)',
    description: 'Train your ears with native speed audio clips and dictation.',
    icon: 'Headphones',
    unlocked: false,
    completedLessons: 0,
    totalLessons: 3,
    badgeName: 'Audio Ninja'
  },
  {
    id: 9,
    title: 'Level 9 – Speaking Practice',
    teluguTitle: 'మాట్లాడే ప్రాక్టీస్ (Spoken Fluency)',
    description: 'Practice impromptu speaking, expressing opinions, and storytelling.',
    icon: 'Sparkles',
    unlocked: false,
    completedLessons: 0,
    totalLessons: 3,
    badgeName: 'Fluency Speaker'
  },
  {
    id: 10,
    title: 'Level 10 – Real-Life Mastery',
    teluguTitle: 'పరిపూర్ణ సంభాషణలు (Real-World Roleplay)',
    description: 'Complete immersive roleplays: Job Interview, Airport, Hospital & Business.',
    icon: 'Award',
    unlocked: false,
    completedLessons: 0,
    totalLessons: 3,
    badgeName: 'English Master'
  }
];

export const MASTER_LESSONS: Lesson[] = [
  // Level 1 Lessons
  {
    id: 'les-1-1',
    levelId: 1,
    title: 'Vowel Sounds & Phonics',
    teluguTitle: 'అచ్చు శబ్దాలు (A, E, I, O, U)',
    type: 'pronunciation',
    xpReward: 50,
    coinReward: 20,
    completed: true,
    questions: [
      {
        id: 'q-1-1-1',
        type: 'mcq',
        prompt: 'Which word has the short vowel sound /æ/ like in "Apple"?',
        teluguPrompt: '"Apple" లో వలె /æ/ శబ్దం ఉన్న పదం ఏది?',
        options: [
          { id: 'opt-1', text: 'Cat', teluguText: 'పిల్లి', isCorrect: true },
          { id: 'opt-2', text: 'Car', teluguText: 'కారు', isCorrect: false },
          { id: 'opt-3', text: 'Cake', teluguText: 'కేకు', isCorrect: false },
          { id: 'opt-4', text: 'Cold', teluguText: 'చల్లని', isCorrect: false }
        ],
        explanation: '"Cat" uses the short /æ/ vowel sound, just like "Apple"!'
      },
      {
        id: 'q-1-1-2',
        type: 'speak_repeat',
        prompt: 'Speak aloud clearly: "The cat sat on the mat."',
        teluguPrompt: 'ఈ వాక్యాన్ని బిగ్గరగా స్పష్టంగా ఉచ్ఛరించండి:',
        targetSentence: 'The cat sat on the mat.',
        explanation: 'Notice how the short /æ/ vowel sound repeats in cat, sat, and mat.'
      }
    ]
  },
  {
    id: 'les-1-2',
    levelId: 1,
    title: 'Consonant Blend Practice',
    teluguTitle: 'హల్లుల కలయిక శబ్దాలు (Br, Cr, St, Sh)',
    type: 'pronunciation',
    xpReward: 50,
    coinReward: 20,
    completed: false,
    questions: [
      {
        id: 'q-1-2-1',
        type: 'mcq',
        prompt: 'Choose the word starting with the "SH" sound /ʃ/:',
        teluguPrompt: '"SH" శబ్దంతో ప్రారంభమయ్యే పదాన్ని ఎంచుకోండి:',
        options: [
          { id: 'opt-1', text: 'Ship', teluguText: 'ఓడ', isCorrect: true },
          { id: 'opt-2', text: 'Sip', teluguText: 'గోరువెచ్చగా తాగడం', isCorrect: false },
          { id: 'opt-3', text: 'Chip', teluguText: 'ముక్క', isCorrect: false },
          { id: 'opt-4', text: 'Skip', teluguText: 'దాటవేయడం', isCorrect: false }
        ],
        explanation: '"Ship" starts with the soft "SH" sound /ʃ/.'
      }
    ]
  },

  // Level 2 Lessons
  {
    id: 'les-2-1',
    levelId: 2,
    title: 'Polite Greetings & Introductions',
    teluguTitle: 'మర్యాదపూర్వక పలకరింపులు',
    type: 'vocabulary',
    xpReward: 60,
    coinReward: 25,
    completed: false,
    questions: [
      {
        id: 'q-2-1-1',
        type: 'mcq',
        prompt: 'How do you respond when someone says "How do you do?"',
        teluguPrompt: 'ఎవరైనా "How do you do?" అని అడిగితే ఎలా సమాధానం చెప్పాలి?',
        options: [
          { id: 'opt-1', text: 'How do you do?', teluguText: 'నమస్కారం (సమాన మర్యాద)', isCorrect: true },
          { id: 'opt-2', text: 'I am eating food', teluguText: 'నేను అన్నం తింటున్నాను', isCorrect: false },
          { id: 'opt-3', text: 'No thanks', teluguText: 'వద్దు ధన్యవాదాలు', isCorrect: false },
          { id: 'opt-4', text: 'Goodbye', teluguText: 'వెళ్లివస్తాను', isCorrect: false }
        ],
        explanation: '"How do you do?" is a formal greeting. The traditional polite reply is also "How do you do?" or "Pleased to meet you."'
      },
      {
        id: 'q-2-1-2',
        type: 'sentence_builder',
        prompt: 'Build the polite greeting sentence: "Nice to meet you"',
        teluguPrompt: 'వాక్యాన్ని సరైన వరసలో పేర్చండి: "మిమ్మల్ని కలవడం సంతోషంగా ఉంది"',
        targetSentence: 'Nice to meet you',
        wordBank: ['meet', 'Nice', 'you', 'to'],
        explanation: 'Standard order: "Nice" + "to" + "meet" + "you".'
      }
    ]
  },

  // Level 4 Lessons (Sentence Building)
  {
    id: 'les-4-1',
    levelId: 4,
    title: 'Subject-Verb-Object Structure',
    teluguTitle: 'కర్త - క్రియ - కర్మ వాక్య నిర్మాణం',
    type: 'sentence_building',
    xpReward: 75,
    coinReward: 30,
    completed: false,
    questions: [
      {
        id: 'q-4-1-1',
        type: 'sentence_builder',
        prompt: 'Arrange words in correct order: "I want to learn English."',
        teluguPrompt: 'పదాలను సరియైన క్రమంలో అమర్చండి: "నేను ఇంగ్లీష్ నేర్చుకోవాలనుకుంటున్నాను."',
        targetSentence: 'I want to learn English',
        wordBank: ['learn', 'English', 'I', 'to', 'want'],
        explanation: 'English sentence order is Subject (I) + Verb (want to learn) + Object (English).'
      },
      {
        id: 'q-4-1-2',
        type: 'sentence_builder',
        prompt: 'Arrange words in correct order: "She speaks English fluently."',
        teluguPrompt: 'పదాలను సరైన క్రమంలో పేర్చండి: "ఆమె ఇంగ్లీష్ ధారాళంగా మాట్లాడుతుంది."',
        targetSentence: 'She speaks English fluently',
        wordBank: ['speaks', 'fluently', 'She', 'English'],
        explanation: 'Subject (She) + Verb (speaks) + Object (English) + Adverb (fluently).'
      }
    ]
  },

  // Level 5 Lessons (Daily Conversation)
  {
    id: 'les-5-1',
    levelId: 5,
    title: 'Small Talk & Weather Discussion',
    teluguTitle: 'వాతావరణం మరియు దైనందిన మాట్లాట',
    type: 'conversation',
    xpReward: 80,
    coinReward: 35,
    completed: false,
    questions: [
      {
        id: 'q-5-1-1',
        type: 'roleplay',
        prompt: 'Friend asks: "The weather is so pleasant today! What are your plans?"',
        teluguPrompt: 'స్నేహితుడు: "ఈరోజు వాతావరణం చాలా బాగుంది! మీ ప్లాన్స్ ఏమిటి?"',
        targetSentence: 'I plan to go for a pleasant walk in the park.',
        explanation: 'Respond naturally by sharing your weekend or daily walking plans!'
      }
    ]
  },

  // Level 10 Lessons (Real-Life Roleplay)
  {
    id: 'les-10-1',
    levelId: 10,
    title: 'Job Interview Excellence',
    teluguTitle: 'ఉద్యోగ ఇంటర్వ్యూ విజయం',
    type: 'role_play',
    xpReward: 120,
    coinReward: 50,
    completed: false,
    questions: [
      {
        id: 'q-10-1-1',
        type: 'roleplay',
        prompt: 'Interviewer asks: "Tell me about your greatest professional strength."',
        teluguPrompt: 'ఇంటర్వ్యూయర్: "మీ గొప్ప ప్రొఫెషనల్ బలం గురించి చెప్పండి."',
        targetSentence: 'My key strength is clear communication and quick problem solving.',
        explanation: 'Frame your strength with positive action words like clear communication, teamwork, and quick problem solving.'
      }
    ]
  }
];
