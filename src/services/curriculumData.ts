export interface CurriculumExercise {
  id: string;
  type: 'mcq' | 'fill_blank' | 'speak';
  question: string;
  teluguQuestion: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  teluguTitle: string;
  topic: string;
  conceptSummary: string;
  examples: Array<{ en: string; te: string; note?: string }>;
  vocabularyList: Array<{ word: string; meaning: string; teluguMeaning: string }>;
  exercise: CurriculumExercise;
}

export interface CurriculumLevel {
  id: number;
  slug: string;
  levelTitle: string;
  teluguTitle: string;
  icon: string;
  badgeColor: string;
  description: string;
  topicsCovered: string[];
  lessons: CurriculumLesson[];
}

export const PROFESSIONAL_8_LEVEL_CURRICULUM: CurriculumLevel[] = [
  {
    id: 1,
    slug: 'foundation',
    levelTitle: 'LEVEL 1 - FOUNDATION',
    teluguTitle: 'ప్రారంభ పునాది స్థాయి',
    icon: '🔤',
    badgeColor: 'from-emerald-500 to-teal-600',
    description: 'English Alphabet, Phonics, Pronunciation, Syllables, Reading Practice, 1000+ Words, and all Parts of Speech.',
    topicsCovered: [
      'English Alphabet & Sound System',
      'Vowels & Consonants',
      'Letter Sounds (Phonics)',
      'Pronunciation & Syllable Stress',
      'Reading Practice & Basic Vocabulary (1000+ Words)',
      'Parts of Speech: Nouns, Pronouns, Articles',
      'Determiners, Adjectives, Adverbs',
      'Prepositions, Conjunctions & Interjections'
    ],
    lessons: [
      {
        id: 'l1-1',
        title: 'English Alphabet & Phonics Sounds',
        teluguTitle: 'అక్షరాల శబ్దాలు & Phonics',
        topic: 'Alphabet & Phonics',
        conceptSummary: 'English has 26 letters producing 44 unique phonetic sounds. Master long vowels, short vowels, and consonant digraphs.',
        examples: [
          { en: 'Apple (/æ/) - An apple a day keeps the doctor away.', te: 'ఆపిల్ - ప్రతిరోజూ ఒక ఆపిల్ తినడం ఆరోగ్యం.' },
          { en: 'Cat (/kæ t/) - The cat is sitting on the mat.', te: 'పిల్లి మ్యాట్ మీద కూర్చుంది.' }
        ],
        vocabularyList: [
          { word: 'Alphabet', meaning: 'Set of letters in a language', teluguMeaning: 'అక్షరమాల' },
          { word: 'Phonics', meaning: 'Method of teaching reading by matching sounds', teluguMeaning: 'శబ్దాల పద్ధతి' }
        ],
        exercise: {
          id: 'ex-l1-1',
          type: 'mcq',
          question: 'How many vowel letters are there in the English alphabet?',
          teluguQuestion: 'ఇంగ్లీష్ అక్షరమాలలో ఎన్ని అచ్చులు (Vowels) ఉన్నాయి?',
          options: ['5 (A, E, I, O, U)', '21', '26', '12'],
          correctAnswer: '5 (A, E, I, O, U)',
          explanation: 'English has 5 vowel letters (A, E, I, O, U) producing 20 vowel sounds.'
        }
      },
      {
        id: 'l1-2',
        title: 'Nouns & Pronouns Basics',
        teluguTitle: 'నామవాచకాలు & సర్వనామాలు',
        topic: 'Parts of Speech',
        conceptSummary: 'A Noun names a person, place, thing, or idea. A Pronoun replaces a noun (I, You, He, She, It, We, They).',
        examples: [
          { en: 'Raju is a student. He studies every day.', te: 'రాజు విద్యార్థి. అతడు ప్రతిరోజూ చదువుతాడు.' },
          { en: 'Hyderabad is a beautiful city. It is famous for biryani.', te: 'హైదరాబాద్ అందమైన నగరం.' }
        ],
        vocabularyList: [
          { word: 'Noun', meaning: 'Name of a person, place or thing', teluguMeaning: 'నామవాచకం' },
          { word: 'Pronoun', meaning: 'Word used in place of a noun', teluguMeaning: 'సర్వనామం' }
        ],
        exercise: {
          id: 'ex-l1-2',
          type: 'mcq',
          question: 'Identify the pronoun in: "Priya said that she loves reading."',
          teluguQuestion: 'ఈ వాక్యంలో సర్వనామం ఏది: "Priya said that she loves reading."',
          options: ['she', 'Priya', 'loves', 'reading'],
          correctAnswer: 'she',
          explanation: '"She" replaces the noun "Priya".'
        }
      },
      {
        id: 'l1-3',
        title: 'Articles (A, An, The) & Prepositions',
        teluguTitle: 'ఆర్టికల్స్ & ఉపసర్గలు',
        topic: 'Articles & Prepositions',
        conceptSummary: 'Use "A" before consonant sounds, "An" before vowel sounds, and "The" for specific nouns. Prepositions (In, On, At, Under) show position.',
        examples: [
          { en: 'An umbrella is on the table.', te: 'గొడుగు బల్లపై ఉంది.' },
          { en: 'The Sun rises in the East.', te: 'సూర్యుడు తూర్పున ఉదయిస్తాడు.' }
        ],
        vocabularyList: [
          { word: 'Preposition', meaning: 'Word showing location, direction, or time', teluguMeaning: 'ఉపసర్గ (Preposition)' },
          { word: 'Article', meaning: 'Determiner specifying definiteness of a noun', teluguMeaning: 'ఆర్టికల్ (A, An, The)' }
        ],
        exercise: {
          id: 'ex-l1-3',
          type: 'mcq',
          question: 'Which article goes before "honest person"?',
          teluguQuestion: '"honest person" కంటే ముందు ఏ ఆర్టికల్ వాడాలి?',
          options: ['An', 'A', 'The', 'No article'],
          correctAnswer: 'An',
          explanation: '"Honest" begins with a silent H, producing a vowel sound (/ɒnɪst/).'
        }
      }
    ]
  },
  {
    id: 2,
    slug: 'basic-grammar',
    levelTitle: 'LEVEL 2 - BASIC GRAMMAR',
    teluguTitle: 'ప్రాథమిక వ్యాకరణ స్థాయి',
    icon: '📝',
    badgeColor: 'from-cyan-500 to-blue-600',
    description: 'Be Verbs, Helping Verbs, Main Verbs, Verb Forms (V1-V5), Subject-Verb Agreement, WH Questions & Sentence Patterns.',
    topicsCovered: [
      'Be Verbs (Is, Am, Are, Was, Were)',
      'Helping & Main Verbs',
      'Verb Forms (V1 Present, V2 Past, V3 Past Participle, V4 -ing, V5 -s/es)',
      'Regular & Irregular Verbs',
      'Subject-Verb Agreement Rules',
      'Countable vs Uncountable Nouns & Possessives',
      'Question Formation: WH Questions (What, Where, When) & Yes/No Questions',
      'Sentence Structure: Positive, Negative & Interrogative'
    ],
    lessons: [
      {
        id: 'l2-1',
        title: 'Be Verbs & Helping Verbs (Is, Am, Are, Was, Were)',
        teluguTitle: 'Be Verbs మరియు సహాయక క్రియలు',
        topic: 'Verb Systems',
        conceptSummary: 'Be verbs indicate state of being or ongoing actions. Use "Is/Am/Are" for Present state and "Was/Were" for Past state.',
        examples: [
          { en: 'I am learning Spoken English today.', te: 'నేను ఈరోజు స్పోకెన్ ఇంగ్లీష్ నేర్చుకుంటున్నాను.' },
          { en: 'They were present at the meeting yesterday.', te: 'వారు నిన్న సమావేశంలో ఉన్నారు.' }
        ],
        vocabularyList: [
          { word: 'Helping Verb', meaning: 'Auxiliary verb supporting the main verb', teluguMeaning: 'సహాయక క్రియ' },
          { word: 'Agreement', meaning: 'Harmonious match between subject and verb', teluguMeaning: 'సమ్మతి / పొంతన' }
        ],
        exercise: {
          id: 'ex-l2-1',
          type: 'mcq',
          question: 'Choose the correct verb: "She ___ preparing for her exam right now."',
          teluguQuestion: 'సరైన క్రియను ఎంచుకోండి: "She ___ preparing for her exam right now."',
          options: ['is', 'are', 'were', 'am'],
          correctAnswer: 'is',
          explanation: 'Third-person singular subject "She" takes "is" in Present Continuous.'
        }
      },
      {
        id: 'l2-2',
        title: 'Verb Forms (V1, V2, V3, V4, V5) & Irregular Verbs',
        teluguTitle: 'క్రియా రూపాలు (V1-V5)',
        topic: 'Verb Forms',
        conceptSummary: 'Every English verb has 5 key forms: V1 (Base), V2 (Past), V3 (Past Participle), V4 (Present Participle -ing), V5 (3rd person singular -s/es).',
        examples: [
          { en: 'V1: Speak | V2: Spoke | V3: Spoken | V4: Speaking | V5: Speaks', te: 'మాట్లాడుట క్రియా రూపాలు' },
          { en: 'He speaks English fluently. Yesterday he spoke at the conference.', te: 'అతడు నిన్న సభలో మాట్లాడాడు.' }
        ],
        vocabularyList: [
          { word: 'Irregular Verb', meaning: 'Verb whose past tense does not end in -ed', teluguMeaning: 'క్రమరహిత క్రియ' },
          { word: 'Participle', meaning: 'Verb form used in continuous or perfect tenses', teluguMeaning: 'క్రియా విశేషణ రూపం' }
        ],
        exercise: {
          id: 'ex-l2-2',
          type: 'mcq',
          question: 'What is the V3 (Past Participle) form of the verb "Write"?',
          teluguQuestion: '"Write" క్రియ యొక్క V3 రూపం ఏది?',
          options: ['Written', 'Wrote', 'Writing', 'Writes'],
          correctAnswer: 'Written',
          explanation: 'Write (V1) ➔ Wrote (V2) ➔ Written (V3) ➔ Writing (V4) ➔ Writes (V5).'
        }
      },
      {
        id: 'l2-3',
        title: 'WH Questions & Sentence Patterns',
        teluguTitle: 'ప్రశ్నల నిర్మాణం (WH Questions)',
        topic: 'Question Formation',
        conceptSummary: 'Form WH Questions using: WH Word + Helping Verb + Subject + Main Verb? (e.g. "What do you do?", "Where do you live?")',
        examples: [
          { en: 'Where are you going for the weekend?', te: 'మీరు వారాంతంలో ఎక్కడికి వెళ్తున్నారు?' },
          { en: 'Why did you call me last night?', te: 'మీరు నిన్న రాత్రి నన్ను ఎందుకు పిలిచారు?' }
        ],
        vocabularyList: [
          { word: 'Interrogative', meaning: 'Asking a question', teluguMeaning: 'ప్రశ్నార్థక' },
          { word: 'Formation', meaning: 'The manner in which something is built', teluguMeaning: 'నిర్మాణం' }
        ],
        exercise: {
          id: 'ex-l2-3',
          type: 'mcq',
          question: 'Which question structure is grammatically correct?',
          teluguQuestion: 'వ్యాకరణపరంగా ఏ ప్రశ్నా నిర్మాణం సరైనది?',
          options: ['Where do you live?', 'Where you live?', 'Where living you?', 'Live you where?'],
          correctAnswer: 'Where do you live?',
          explanation: 'WH Question order: WH Word (Where) + Auxiliary (do) + Subject (you) + Verb (live).'
        }
      }
    ]
  },
  {
    id: 3,
    slug: 'tenses',
    levelTitle: 'LEVEL 3 - TENSES (ALL 12 TENSES)',
    teluguTitle: 'కాలాల సమగ్ర సాధన (12 Tenses)',
    icon: '⏳',
    badgeColor: 'from-amber-500 to-orange-600',
    description: 'Master all 12 English tenses across Present, Past, and Future with structured formulas, daily examples, and practice drills.',
    topicsCovered: [
      'Present Simple & Present Continuous',
      'Present Perfect & Present Perfect Continuous',
      'Past Simple & Past Continuous',
      'Past Perfect & Past Perfect Continuous',
      'Future Simple & Future Continuous',
      'Future Perfect & Future Perfect Continuous',
      'Tense Conversion & Time Marker Practice'
    ],
    lessons: [
      {
        id: 'l3-1',
        title: 'Present Simple vs Present Continuous',
        teluguTitle: 'సాధారణ & నిరంతర వర్తమాన కాలం',
        topic: 'Present Tenses',
        conceptSummary: 'Present Simple (Subject + V1/V5) is used for habits and truths. Present Continuous (Subject + am/is/are + V4) is used for actions happening right now.',
        examples: [
          { en: 'Present Simple: I work in IT. (Habitual fact)', te: 'నేను IT లో పనిచేస్తాను.' },
          { en: 'Present Continuous: I am working on a new project now. (Active right now)', te: 'నేను ఇప్పుడు ప్రాజెక్ట్‌పై పనిచేస్తున్నాను.' }
        ],
        vocabularyList: [
          { word: 'Habitual', meaning: 'Done constantly or regularly', teluguMeaning: 'అలవాటుగా చేసే' },
          { word: 'Continuous', meaning: 'Without interruption; ongoing', teluguMeaning: 'నిరంతరంగా జరిగే' }
        ],
        exercise: {
          id: 'ex-l3-1',
          type: 'mcq',
          question: 'Fill in: "Look! The children ___ in the garden."',
          teluguQuestion: 'ఖాళీని పూరించండి: "Look! The children ___ in the garden."',
          options: ['are playing', 'plays', 'played', 'have play'],
          correctAnswer: 'are playing',
          explanation: '"Look!" signals an ongoing action happening right now (Present Continuous).'
        }
      },
      {
        id: 'l3-2',
        title: 'Present Perfect vs Past Simple',
        teluguTitle: 'Present Perfect & Past Simple పోలిక',
        topic: 'Perfect Tenses',
        conceptSummary: 'Past Simple (Subject + V2) specifies a finished time (yesterday, in 2020). Present Perfect (Subject + has/have + V3) connects past events to the present without a fixed past time.',
        examples: [
          { en: 'Past Simple: I visited Delhi last year. (Finished time)', te: 'నేను పోయిన సంవత్సరం ఢిల్లీ చూశాను.' },
          { en: 'Present Perfect: I have visited Delhi twice. (Life experience up to now)', te: 'నేను రెండుసార్లు ఢిల్లీకి వెళ్లాను.' }
        ],
        vocabularyList: [
          { word: 'Experience', meaning: 'Practical contact with events or facts', teluguMeaning: 'అనుభవం' },
          { word: 'Specified', meaning: 'Stated clearly and explicitly', teluguMeaning: 'స్పష్టంగా తెలిపిన' }
        ],
        exercise: {
          id: 'ex-l3-2',
          type: 'mcq',
          question: 'Which sentence correctly uses Present Perfect?',
          teluguQuestion: 'ఏ వాక్యం Present Perfect సరైన రితీలో ఉపయోగించింది?',
          options: ['I have completed my assignment.', 'I completed my assignment yesterday.', 'I have completed my assignment yesterday.', 'I am completing my assignment yesterday.'],
          correctAnswer: 'I have completed my assignment.',
          explanation: 'Present Perfect does not take past time adverbs like "yesterday".'
        }
      },
      {
        id: 'l3-3',
        title: 'Future Simple & Future Continuous ("Will / Going to")',
        teluguTitle: 'భవిష్యత్తు కాలం (Future Tenses)',
        topic: 'Future Tenses',
        conceptSummary: 'Use Future Simple (Subject + will + V1) for instant decisions and predictions. Use Future Continuous (Subject + will be + V4) for actions in progress in the future.',
        examples: [
          { en: 'Future Simple: I will assist you with the presentation.', te: 'నేను ప్రెజెంటేషన్‌లో సహాయం చేస్తాను.' },
          { en: 'Future Continuous: Tomorrow at 10 AM, I will be attending a workshop.', te: 'రేపు ఉదయం 10 గంటలకు నేను వర్క్‌షాప్‌లో ఉంటాను.' }
        ],
        vocabularyList: [
          { word: 'Prediction', meaning: 'A statement about what will happen', teluguMeaning: 'ముందస్తు అంచనా' },
          { word: 'Intention', meaning: 'An aim or plan', teluguMeaning: 'ఉద్దేశం' }
        ],
        exercise: {
          id: 'ex-l3-3',
          type: 'mcq',
          question: 'Complete: "Don\'t call me at 8 PM tonight because I ___ dinner."',
          teluguQuestion: 'ఖాళీని పూరించండి: "Don\'t call me at 8 PM tonight because I ___ dinner."',
          options: ['will be having', 'have', 'had', 'was having'],
          correctAnswer: 'will be having',
          explanation: 'Describes an action that will be in progress at a specific future time (Future Continuous).'
        }
      }
    ]
  },
  {
    id: 4,
    slug: 'advanced-grammar',
    levelTitle: 'LEVEL 4 - ADVANCED GRAMMAR',
    teluguTitle: 'ఉన్నత వ్యాకరణ స్థాయి',
    icon: '🔮',
    badgeColor: 'from-purple-500 to-indigo-600',
    description: 'Active/Passive Voice, Direct/Indirect Speech, Modals, Conditionals, Gerunds, Infinitives, Clauses & Question Tags.',
    topicsCovered: [
      'Active & Passive Voice Transformation',
      'Direct & Indirect (Reported) Speech',
      'Modal Auxiliaries (Can, Could, Should, Would, Must, Might)',
      'Conditionals (Zero, 1st, 2nd & 3rd Conditionals)',
      'Infinitives, Gerunds & Participles',
      'Noun, Adjective & Relative Clauses',
      'Degrees of Comparison & Question Tags'
    ],
    lessons: [
      {
        id: 'l4-1',
        title: 'Active Voice vs Passive Voice',
        teluguTitle: 'ఆక్టివ్ & ప్యాసివ్ వాయిస్',
        topic: 'Voice Transformation',
        conceptSummary: 'In Active Voice, the subject performs the action. In Passive Voice (Object + Be verb + V3 + by Subject), focus shifts to the receiver of the action.',
        examples: [
          { en: 'Active: The manager approved the project.', te: 'మేనేజర్ ప్రాజెక్ట్‌ను ఆమోదించారు.' },
          { en: 'Passive: The project was approved by the manager.', te: 'ప్రాజెక్ట్ మేనేజర్‌చే ఆమోదించబడింది.' }
        ],
        vocabularyList: [
          { word: 'Transformation', meaning: 'A marked change in form or nature', teluguMeaning: 'మార్పు / రూపాంతరం' },
          { word: 'Receiver', meaning: 'The person or thing receiving an action', teluguMeaning: 'స్వీకరించేవారు' }
        ],
        exercise: {
          id: 'ex-l4-1',
          type: 'mcq',
          question: 'Transform to Passive: "They built this bridge in 1995."',
          teluguQuestion: 'ప్యాసివ్ వాయిస్‌లోకి మార్చండి: "They built this bridge in 1995."',
          options: ['This bridge was built in 1995.', 'This bridge built in 1995.', 'This bridge is built in 1995.', 'This bridge has built in 1995.'],
          correctAnswer: 'This bridge was built in 1995.',
          explanation: 'Past Simple passive formula: Object + was/were + V3 (built).'
        }
      },
      {
        id: 'l4-2',
        title: 'Direct Speech to Indirect Reported Speech',
        teluguTitle: 'ప్రత్యక్ష & పరోక్ష కథనం (Reported Speech)',
        topic: 'Reported Speech',
        conceptSummary: 'Reported speech conveys what someone said without exact quotes. Shift tenses back (Present ➔ Past) and change pronouns appropriately.',
        examples: [
          { en: 'Direct: She said, "I am happy today."', te: 'ఆమె చెప్పింది, "నేను ఆనందంగా ఉన్నాను."' },
          { en: 'Indirect: She said that she was happy that day.', te: 'ఆమె ఆ రోజు ఆనందంగా ఉన్నానని చెప్పింది.' }
        ],
        vocabularyList: [
          { word: 'Reported', meaning: 'Stated or described by someone', teluguMeaning: 'నివేదించబడిన / పరోక్ష కథనం' },
          { word: 'Appropriately', meaning: 'In a proper or suitable manner', teluguMeaning: 'తగిన విధంగా' }
        ],
        exercise: {
          id: 'ex-l4-2',
          type: 'mcq',
          question: 'Report this: He said, "I can solve this problem."',
          teluguQuestion: 'పరోక్ష కథనంలో చెప్పండి: He said, "I can solve this problem."',
          options: ['He said that he could solve that problem.', 'He said he can solve this problem.', 'He told that he could solved.', 'He says he can solve.'],
          correctAnswer: 'He said that he could solve that problem.',
          explanation: 'Modal verb "can" changes to "could", and "this" changes to "that".'
        }
      },
      {
        id: 'l4-3',
        title: 'Conditionals (If Clauses: 1st, 2nd & 3rd)',
        teluguTitle: 'నిబంధన వాక్యాలు (Conditionals)',
        topic: 'Conditionals',
        conceptSummary: '1st Conditional (If + Present, Will + V1) = Real future condition. 2nd Conditional (If + Past, Would + V1) = Imaginary present. 3rd Conditional (If + Past Perfect, Would have + V3) = Impossible past regret.',
        examples: [
          { en: '1st: If you study hard, you will clear the exam.', te: 'నువ్వు బాగా చదివితే పరీక్ష పాస్ అవుతావు.' },
          { en: '2nd: If I had a million dollars, I would travel the world.', te: 'నా దగ్గర మిలియన్ డాలర్లు ఉంటే ప్రపంచం చుట్టివచ్చేవాడిని.' }
        ],
        vocabularyList: [
          { word: 'Imaginary', meaning: 'Existing only in the imagination', teluguMeaning: 'ఊహాజనిత' },
          { word: 'Regret', meaning: 'Sadness over something done or lost', teluguMeaning: 'పశ్చాత్తాపం' }
        ],
        exercise: {
          id: 'ex-l4-3',
          type: 'mcq',
          question: 'Identify the 2nd Conditional: "If I ___ rich, I would buy a yacht."',
          teluguQuestion: '2nd Conditional ఖాళీని పూరించండి: "If I ___ rich, I would buy a yacht."',
          options: ['were', 'am', 'was been', 'will be'],
          correctAnswer: 'were',
          explanation: '2nd Conditional uses subjunctive "were" for all subjects in formal English.'
        }
      }
    ]
  },
  {
    id: 5,
    slug: 'vocabulary',
    levelTitle: 'LEVEL 5 - VOCABULARY & IDIOMS (5000+ WORDS)',
    teluguTitle: 'పదజాలం, జాతీయాలు & సామెతలు',
    icon: '📚',
    badgeColor: 'from-rose-500 to-pink-600',
    description: '5000+ Daily Words, Synonyms, Antonyms, Homophones, Idioms, Phrasal Verbs, Collocations, Root Words, Prefixes & Suffixes.',
    topicsCovered: [
      '5000+ Essential Spoken & Academic Words',
      'Synonyms & Antonyms Mastery',
      'Homophones (Their/There) & Homonyms',
      'High-Frequency English Idioms & Expressions',
      'Essential Phrasal Verbs (Break down, Carry on, Look up)',
      'Collocations (Make a decision, Do homework)',
      'Etymology: Root Words, Prefixes & Suffixes'
    ],
    lessons: [
      {
        id: 'l5-1',
        title: 'Top Phrasal Verbs for Daily Conversations',
        teluguTitle: 'నిత్యజీవితంలో వాడే Phrasal Verbs',
        topic: 'Phrasal Verbs',
        conceptSummary: 'A Phrasal Verb is a verb + preposition/adverb combination with a idiomatic meaning distinct from its separate parts.',
        examples: [
          { en: 'Call off = Cancel. They called off the meeting due to rain.', te: 'వర్షం వల్ల మీటింగ్‌ను రద్దు చేశారు.' },
          { en: 'Look forward to = Anticipate with pleasure. I look forward to meeting you.', te: 'నిన్ను కలవడానికి ఆసక్తిగా ఎదురుచూస్తున్నాను.' }
        ],
        vocabularyList: [
          { word: 'Call off', meaning: 'To cancel an event or agreement', teluguMeaning: 'రద్దు చేయు' },
          { word: 'Carry on', meaning: 'To continue doing something', teluguMeaning: 'కొనసాగించు' }
        ],
        exercise: {
          id: 'ex-l5-1',
          type: 'mcq',
          question: 'What does "break down" mean in: "The car broke down on the highway"?',
          teluguQuestion: 'ఈ వాక్యంలో "break down" అర్థం ఏమిటి: "The car broke down on the highway"?',
          options: ['Stopped functioning due to mechanical failure', 'Started driving faster', 'Exploded', 'Turned around'],
          correctAnswer: 'Stopped functioning due to mechanical failure',
          explanation: '"Break down" means a machine or vehicle stops working.'
        }
      },
      {
        id: 'l5-2',
        title: 'Popular Idioms & Natural Expressions',
        teluguTitle: 'ప్రముఖ జాతీయాలు (Idioms)',
        topic: 'Idioms',
        conceptSummary: 'Idioms are figurative expressions whose meaning cannot be deduced from individual literal words.',
        examples: [
          { en: 'Break the ice = Make people feel comfortable in a conversation.', te: 'సంభాషణలో బిడియం పోగొట్టడం.' },
          { en: 'Piece of cake = Extremely easy task.', te: 'చాలా సులువైన పని.' }
        ],
        vocabularyList: [
          { word: 'Idiom', meaning: 'Figurative phrase with non-literal meaning', teluguMeaning: 'జాతీయం' },
          { word: 'Figurative', meaning: 'Departing from literal sense of words', teluguMeaning: 'అలంకారిక' }
        ],
        exercise: {
          id: 'ex-l5-2',
          type: 'mcq',
          question: 'What does the idiom "once in a blue moon" mean?',
          teluguQuestion: '"once in a blue moon" అనే జాతీయానికి అర్థం ఏమిటి?',
          options: ['Very rarely', 'Every night', 'Once a month', 'Very frequently'],
          correctAnswer: 'Very rarely',
          explanation: '"Once in a blue moon" describes an event that happens extremely rarely.'
        }
      }
    ]
  },
  {
    id: 6,
    slug: 'spoken-english',
    levelTitle: 'LEVEL 6 - REAL-LIFE SPOKEN ENGLISH',
    teluguTitle: 'నిజజీవిత స్పోకెన్ ఇంగ్లీష్ సంభాషణలు',
    icon: '🗣️',
    badgeColor: 'from-violet-500 to-purple-700',
    description: 'Self-Introduction, Office, Shopping, Banking, Hospital, Airport, Customer Support, Storytelling, Debates & Public Speaking.',
    topicsCovered: [
      'Self Introduction & Networking',
      'Conversations with Family & Friends',
      'School, College & Campus Life English',
      'Office, Shopping, Banking & Hospital Scenarios',
      'Travel, Airport & Hotel Conversations',
      'Customer Support & Telephone Etiquette',
      'Public Speaking, Storytelling & Group Discussions'
    ],
    lessons: [
      {
        id: 'l6-1',
        title: 'Professional Self-Introduction & Networking',
        teluguTitle: 'వృత్తిపరమైన పరిచయం (Self-Intro)',
        topic: 'Self Introduction',
        conceptSummary: 'A structured self-introduction includes: Greet ➔ Name ➔ Background/Role ➔ Current Goal ➔ Polite Closing statement.',
        examples: [
          { en: 'Good morning! My name is Suresh. I have 3 years of experience in software sales, and I am passionate about customer success.', te: 'నమస్కారం! నా పేరు సురేష్.' },
          { en: 'Pleased to meet you! I am currently expanding my spoken fluency to lead international client calls.', te: 'మిమ్మల్ని కలవడం చాలా సంతోషం!' }
        ],
        vocabularyList: [
          { word: 'Networking', meaning: 'Connecting with people for professional benefit', teluguMeaning: 'నెట్‌వర్కింగ్ / సంబంధాలు పెంచుకోవడం' },
          { word: 'Background', meaning: 'A person’s education and work history', teluguMeaning: 'నేపథ్యం' }
        ],
        exercise: {
          id: 'ex-l6-1',
          type: 'mcq',
          question: 'Which opening greeting is most appropriate for a formal interview introduction?',
          teluguQuestion: 'ఫార్మల్ ఇంటర్వ్యూ పరిచయానికి ఏ పలకరింపు అత్యంత తగినది?',
          options: ['Good morning / Good afternoon, sir/madam.', 'Hey bro, what\'s up?', 'Yo guys!', 'Hi there buddy.'],
          correctAnswer: 'Good morning / Good afternoon, sir/madam.',
          explanation: 'Use formal time-based greetings in professional interviews.'
        }
      },
      {
        id: 'l6-2',
        title: 'Shopping, Banking & Hospital Conversations',
        teluguTitle: 'షాపింగ్, బ్యాంక్ & హాస్పిటల్ సంభాషణలు',
        topic: 'Daily Situations',
        conceptSummary: 'Master polite request frames: "Could you please help me with...?", "I would like to open a bank account.", "Where can I find...?"',
        examples: [
          { en: 'Excuse me, could you tell me where the cash counter is?', te: 'క్షమించండి, క్యాష్ కౌంటర్ ఎక్కడ ఉందో చెప్పగలరా?' },
          { en: 'I need to deposit this check into my savings account.', te: 'నా సేవింగ్స్ ఖాతాలో ఈ చెక్కు జమ చేయాలి.' }
        ],
        vocabularyList: [
          { word: 'Deposit', meaning: 'Put money into a bank account', teluguMeaning: 'జమ చేయు' },
          { word: 'Assistance', meaning: 'The action of helping someone', teluguMeaning: 'సహాయం' }
        ],
        exercise: {
          id: 'ex-l6-2',
          type: 'mcq',
          question: 'How do you politely ask for a discount while shopping?',
          teluguQuestion: 'షాపింగ్ చేసేటప్పుడు డిస్కౌంట్ గురించి మర్యాదగా ఎలా అడగాలి?',
          options: ['Is there any discount available on this item?', 'Give me this cheap!', 'Price is too high, lower it now!', 'Discount give me.'],
          correctAnswer: 'Is there any discount available on this item?',
          explanation: 'Use indirect polite phrases like "Is there any discount available on...?"'
        }
      }
    ]
  },
  {
    id: 7,
    slug: 'business-english',
    levelTitle: 'LEVEL 7 - BUSINESS ENGLISH',
    teluguTitle: 'కార్పొరేట్ & బిజినెస్ ఇంగ్లీష్',
    icon: '💼',
    badgeColor: 'from-amber-600 to-yellow-700',
    description: 'Corporate Communication, Professional Email Writing, Workplace Vocabulary, Meetings, Client Presentations & Executive Leadership.',
    topicsCovered: [
      'Professional Corporate Communication',
      'Formal Email Writing & Email Etiquette',
      'Office & Corporate Jargon Vocabulary',
      'Leading & Participating in Business Meetings',
      'Client Presentations & Proposal Pitching',
      'Executive Leadership Communication & Negotiations'
    ],
    lessons: [
      {
        id: 'l7-1',
        title: 'Professional Email Writing & Business Etiquette',
        teluguTitle: 'ప్రొఫెషనల్ ఈమెయిల్ రచన',
        topic: 'Email Writing',
        conceptSummary: 'Structure formal emails: Clear Subject Line ➔ Professional Salutation ➔ Concise Body Paragraphs ➔ Call to Action ➔ Professional Sign-off.',
        examples: [
          { en: 'Subject: Project Status Update - Q3 Deliverables | Salutation: Dear Team,', te: 'ఈమెయిల్ సబ్జెక్ట్ & సంబోధన' },
          { en: 'I am writing to share the updated project timeline. Please find the attached report for your review.', te: 'తాజా నివేదికను పంపిస్తున్నాను.' }
        ],
        vocabularyList: [
          { word: 'Deliverable', meaning: 'A tangible product or result to be submitted', teluguMeaning: 'అప్పగించాల్సిన పని/ఫలితం' },
          { word: 'Concise', meaning: 'Giving a lot of information clearly and briefly', teluguMeaning: 'సంక్షిప్తమైన' }
        ],
        exercise: {
          id: 'ex-l7-1',
          type: 'mcq',
          question: 'Which sign-off is standard for formal business email communication?',
          teluguQuestion: 'ఫార్మల్ బిజినెస్ ఈమెయిల్‌కి ఏ ముగింపు (Sign-off) ప్రామాణికమైనది?',
          options: ['Best regards, / Sincerely,', 'Bye bye!', 'Thx bro', 'See ya later'],
          correctAnswer: 'Best regards, / Sincerely,',
          explanation: '"Best regards," and "Sincerely," are professional standard sign-offs.'
        }
      },
      {
        id: 'l7-2',
        title: 'Leading & Participating in Corporate Meetings',
        teluguTitle: 'బిజినెస్ మీటింగ్ నిర్వహణ',
        topic: 'Meetings & Presentations',
        conceptSummary: 'Master meeting phrases: "Let us get down to business.", "I would like to hand over to...", "Does anyone have questions regarding...?"',
        examples: [
          { en: 'Thank you for joining today. Let us review our quarterly achievements.', te: 'ఈరోజు హాజరైనందుకు ధన్యవాదాలు.' },
          { en: 'Allow me to highlight our key performance indicators for this quarter.', te: 'ముఖ్యమైన ప్రదర్శన సూచికలను వివరిస్తాను.' }
        ],
        vocabularyList: [
          { word: 'Agenda', meaning: 'A list of items to be discussed at a meeting', teluguMeaning: 'కార్యక్రమ పట్టిక' },
          { word: 'Consensus', meaning: 'General agreement among a group', teluguMeaning: 'ఏకగ్రీవ అభిప్రాయం' }
        ],
        exercise: {
          id: 'ex-l7-2',
          type: 'mcq',
          question: 'How do you politely interrupt a meeting speaker to add a point?',
          teluguQuestion: 'మీటింగ్‌లో మాట్లాడే వారిని మర్యాదగా ఆపి మన అభిప్రాయం చెప్పడం ఎలా?',
          options: ['May I add a quick point here?', 'Stop talking, it\'s my turn!', 'Shut up!', 'Listen to me now.'],
          correctAnswer: 'May I add a quick point here?',
          explanation: '"May I add a quick point here?" is a polite professional interruption phrase.'
        }
      }
    ]
  },
  {
    id: 8,
    slug: 'interview-prep',
    levelTitle: 'LEVEL 8 - INTERVIEW PREPARATION',
    teluguTitle: 'ఇంటర్వ్యూ సాధన & Fluency Mastery',
    icon: '🏆',
    badgeColor: 'from-red-600 to-rose-700',
    description: 'HR Interview, Technical Interview, Resume Speaking, Confidence Building, Accent Neutralization, Mock Interviews & Final Certification.',
    topicsCovered: [
      'HR Interview Questions & STAR Technique Answers',
      'Technical & Managerial Interview Confidence',
      'Resume Speaking & Project Experience Delivery',
      'Fluency Training & Accent Neutralization',
      'Overcoming Stage Fear & Building Public Confidence',
      'Real-Life Mock Interviews & Final Certification Exam'
    ],
    lessons: [
      {
        id: 'l8-1',
        title: 'Mastering HR Interview Questions with STAR Method',
        teluguTitle: 'HR ఇంటర్వ్యూ - STAR పద్ధతి',
        topic: 'Interview Skills',
        conceptSummary: 'Answer behavioral interview questions using STAR: Situation ➔ Task ➔ Action ➔ Result.',
        examples: [
          { en: 'Situation: In my previous job, we faced a tight deadline. Task: My goal was to deliver the code without bugs. Action: I organized daily huddles. Result: We delivered 2 days early.', te: 'STAR పద్ధతి సమాధానం' },
          { en: 'What is your greatest strength? - "My greatest strength is my problem-solving ability under high pressure."', te: 'నా గొప్ప బలం ఒత్తిడిలో పనిచేయడం.' }
        ],
        vocabularyList: [
          { word: 'STAR Method', meaning: 'Situation, Task, Action, Result framework', teluguMeaning: 'STAR సమాధాన చట్రం' },
          { word: 'Behavioral', meaning: 'Relating to how a candidate reacts in work scenarios', teluguMeaning: 'ప్రవర్తనా సంబంధిత' }
        ],
        exercise: {
          id: 'ex-l8-1',
          type: 'mcq',
          question: 'What does the "A" in the STAR interview technique stand for?',
          teluguQuestion: 'STAR ఇంటర్వ్యూ పద్ధతిలో "A" దేనికి సంకేతం?',
          options: ['Action', 'Attitude', 'Aptitude', 'Accuracy'],
          correctAnswer: 'Action',
          explanation: 'STAR = Situation, Task, Action (the specific steps you took), Result.'
        }
      },
      {
        id: 'l8-2',
        title: 'Fluency Training & Accent Neutralization',
        teluguTitle: 'స్పోకెన్ ఫ్లూయెన్సీ & యాస సాధన',
        topic: 'Fluency & Accent',
        conceptSummary: 'Neutralize heavy local accents by focusing on clear vowel elongation, steady sentence rhythm, and pausing at punctuation.',
        examples: [
          { en: 'Focus on clear rhythm: "Practice makes a speaker natural, fluent, and confident."', te: 'స్పష్టమైన స్వరస్థాయి సాధన' },
          { en: 'Eliminate filler words ("um", "uh", "like") by taking natural 1-second pauses.', te: 'సహజమైన చిన్న విరామాలు ఇవ్వండి.' }
        ],
        vocabularyList: [
          { word: 'Neutralization', meaning: 'Making an accent clear and universally understood', teluguMeaning: 'స్పష్టమైన సార్వత్రిక యాస' },
          { word: 'Elongation', meaning: 'Lengthening of sound duration', teluguMeaning: 'స్వరాన్ని సాగదీయడం' }
        ],
        exercise: {
          id: 'ex-l8-2',
          type: 'mcq',
          question: 'What is the best way to eliminate filler words ("um", "like", "you know") during speaking?',
          teluguQuestion: 'మాట్లాడేటప్పుడు "um", "like" వంటి వృధా పదాలను నివారించడానికి ఉత్తమ మార్గం ఏది?',
          options: ['Take a silent 1-second pause when thinking', 'Speak extremely fast without stopping', 'Repeat the filler words louder', 'Close your eyes'],
          correctAnswer: 'Take a silent 1-second pause when thinking',
          explanation: 'Taking a silent brief pause projects confidence and eliminates filler words.'
        }
      }
    ]
  }
];
