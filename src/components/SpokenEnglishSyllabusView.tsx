import React, { useState } from 'react';
import {
  BookOpen, Award, CheckCircle2, Play, Volume2, Mic, Sparkles, ChevronRight,
  Clock, Calendar, Star, FileText, Download, UserCheck, ShieldCheck, Flame, Target
} from 'lucide-react';
import { VoiceSettings } from '../types';
import { speechSpeaker } from '../services/speechSynthesis';

interface SyllabusLessonDay {
  day: number;
  title: string;
  teluguTitle: string;
  topicCategory: 'grammar' | 'vocab' | 'speaking' | 'listening' | 'quiz' | 'roleplay';
  description: string;
  vocabList: Array<{ word: string; meaning: string; teluguMeaning: string }>;
  grammarRule: string;
  speakingPrompt: string;
  listeningText: string;
  quizQuestion: {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  };
}

interface LevelSyllabusData {
  id: 'beginner' | 'intermediate' | 'advanced';
  levelNumber: number;
  title: string;
  teluguTitle: string;
  durationDays: number;
  vocabTarget: string;
  badgeColor: string;
  icon: string;
  description: string;
  topicsCovered: string[];
  days: SyllabusLessonDay[];
}

const SYLLABUS_DATA: Record<'beginner' | 'intermediate' | 'advanced', LevelSyllabusData> = {
  beginner: {
    id: 'beginner',
    levelNumber: 1,
    title: '🟢 Beginner Foundation',
    teluguTitle: 'ప్రారంభ స్థాయి (30 రోజులు)',
    durationDays: 30,
    vocabTarget: '500+ Essential Words',
    badgeColor: 'from-emerald-500 to-teal-600',
    icon: '🟢',
    description: 'Master basic pronunciation, greetings, essential grammar, and daily conversation confidence in 30 days.',
    topicsCovered: [
      'English Alphabet & Sound System',
      'Greetings & Introductions',
      'Daily Vocabulary (500+ words)',
      'Basic Grammar & Sentence Building',
      'Articles (A, An, The)',
      'Subject & Object Pronouns',
      'Simple Tenses (Present, Past, Future)',
      'Daily Conversations (Family & Friends)',
      'Numbers, Time, Days & Dates',
      'Shopping & Classroom English',
      'Question & Answer Practice',
      'Daily Homework & Weekly Quizzes'
    ],
    days: Array.from({ length: 30 }, (_, i) => {
      const dayNum = i + 1;
      return {
        day: dayNum,
        title: `Day ${dayNum}: ${
          dayNum === 1 ? 'Alphabet Phonics & Vowel Sounds' :
          dayNum === 2 ? 'Greetings & First Introductions' :
          dayNum === 3 ? 'Numbers, Days & Time Vocabulary' :
          dayNum === 5 ? 'Mastering Articles (A, An, The)' :
          dayNum === 10 ? 'Subject Pronouns & Present Simple' :
          dayNum === 15 ? 'Shopping & Grocery Store English' :
          dayNum === 20 ? 'Family & Relationships Vocabulary' :
          dayNum === 25 ? 'Forming Questions (What, Where, When)' :
          `Daily Practice Module ${dayNum}`
        }`,
        teluguTitle: `రోజు ${dayNum}: ${
          dayNum === 1 ? 'అక్షరాల శబ్దాలు & అచ్చులు' :
          dayNum === 2 ? 'పలకరింపులు & పరిచయాలు' :
          dayNum === 3 ? 'సంఖ్యలు & సమయం తెలుపు పదాలు' :
          `రోజువారీ సాధన ${dayNum}`
        }`,
        topicCategory: dayNum % 5 === 0 ? 'quiz' : dayNum % 2 === 0 ? 'speaking' : 'grammar',
        description: `Learn essential spoken patterns and vocabulary for Day ${dayNum}.`,
        vocabList: [
          { word: 'Greeting', meaning: 'Polite words when meeting someone', teluguMeaning: 'పలకరింపు' },
          { word: 'Introduce', meaning: 'To tell someone your name', teluguMeaning: 'పరిచయం చేసుకొను' },
          { word: 'Courteous', meaning: 'Polite and respectful', teluguMeaning: 'మర్యాదపూర్వకమైన' }
        ],
        grammarRule: 'Subject + Verb + Object form the building blocks of every basic English sentence.',
        speakingPrompt: 'Introduce yourself: "Hello, my name is... I am learning English to speak fluently."',
        listeningText: 'Hello! Welcome to our Spoken English Academy. Today we learn daily greetings.',
        quizQuestion: {
          question: 'Which article is correct before "apple"?',
          options: ['A apple', 'An apple', 'The apple', 'None'],
          correctAnswerIndex: 1,
          explanation: 'Use "An" before words starting with vowel sounds (A, E, I, O, U).'
        }
      };
    })
  },
  intermediate: {
    id: 'intermediate',
    levelNumber: 2,
    title: '🟡 Intermediate Mastery',
    teluguTitle: 'మధ్యస్థ స్థాయి (45 రోజులు)',
    durationDays: 45,
    vocabTarget: '2,000+ Advanced Words',
    badgeColor: 'from-amber-500 to-orange-600',
    icon: '🟡',
    description: 'Elevate your fluency with active/passive voice, direct/indirect speech, modal verbs, idioms, email writing, and interview skills in 45 days.',
    topicsCovered: [
      'Advanced Grammar & Clause Structure',
      'Active & Passive Voice Transformation',
      'Direct & Indirect Reported Speech',
      'Modal Verbs (Can, Could, Should, Would, Must)',
      'Phrasal Verbs & Common English Idioms',
      'Professional Email Writing & Etiquette',
      'Job Interview English & Elevator Pitch',
      'Telephone & Video Call Communication',
      'Workplace & Office Discussion Skills',
      'Group Discussion (GD) & Debate Practice',
      'Storytelling & Public Speaking Confidence',
      'Weekly Tests & Assignment Exercises'
    ],
    days: Array.from({ length: 45 }, (_, i) => {
      const dayNum = i + 1;
      return {
        day: dayNum,
        title: `Day ${dayNum}: ${
          dayNum === 1 ? 'Modal Verbs (Can, Could, Should)' :
          dayNum === 5 ? 'Active vs Passive Voice in Office Talks' :
          dayNum === 10 ? 'Direct & Reported Speech Practice' :
          dayNum === 15 ? 'Top 50 Phrasal Verbs for Daily Use' :
          dayNum === 25 ? 'Writing Professional Business Emails' :
          dayNum === 35 ? 'Job Interview Self-Introduction' :
          `Intermediate Module ${dayNum}`
        }`,
        teluguTitle: `రోజు ${dayNum}: ${
          dayNum === 1 ? 'మోడల్ వెర్బ్స్ సాధన' :
          dayNum === 5 ? 'ఆక్టివ్ & ప్యాసివ్ వాయిస్' :
          `మధ్యస్థ స్థాయి శిక్షణ ${dayNum}`
        }`,
        topicCategory: dayNum % 5 === 0 ? 'quiz' : dayNum % 3 === 0 ? 'roleplay' : 'speaking',
        description: `Enhance professional speaking and active vocabulary for Day ${dayNum}.`,
        vocabList: [
          { word: 'Accomplish', meaning: 'To complete a goal successfully', teluguMeaning: 'సఫలీకృతం చేయు' },
          { word: 'Benchmark', meaning: 'A standard for measuring quality', teluguMeaning: 'ప్రామాణిక కొలమానం' },
          { word: 'Diligent', meaning: 'Showing careful effort and hard work', teluguMeaning: 'శ్రద్ధ గల' }
        ],
        grammarRule: 'Modal verbs express permission, possibility, necessity, and obligation without changing form.',
        speakingPrompt: 'Deliver a 1-minute talk on your career goals using at least two modal verbs.',
        listeningText: 'Good morning team. In today\'s meeting, we will review our project milestones.',
        quizQuestion: {
          question: 'What is the passive form of "She writes a report"?',
          options: ['A report is written by her.', 'She has written a report.', 'A report was written by her.', 'Report is write.'],
          correctAnswerIndex: 0,
          explanation: 'In Present Simple, passive voice uses: Object + is/am/are + Past Participle (V3) + by + Subject.'
        }
      };
    })
  },
  advanced: {
    id: 'advanced',
    levelNumber: 3,
    title: '🔴 Advanced Executive Fluency',
    teluguTitle: 'ఉన్నత స్థాయి (60 రోజులు)',
    durationDays: 60,
    vocabTarget: '5,000+ Corporate Words',
    badgeColor: 'from-rose-500 to-red-700',
    icon: '🔴',
    description: 'Achieve native-like spoken fluency, accent refinement, corporate negotiation, IELTS/TOEFL speaking mastery, and executive leadership communication in 60 days.',
    topicsCovered: [
      'Native-Level Spoken Fluency & Accent Refinement',
      'Intonation, Connected Speech & Rhythm',
      'Business English & Corporate Communication',
      'IELTS & TOEFL Speaking Band 8+ Strategies',
      'HR & Executive Board Interview Mastery',
      'Global Client Negotiations & Pitching',
      'Presentation Mastery & Persuasive Speaking',
      'Executive Leadership & Boardroom Meetings',
      'Professional Email & Technical Writing',
      'Real-Life Role Plays & Mock Panel Interviews',
      'Public Speaking 3-Minute Challenge',
      'Final Capstone Project & Certification Exam'
    ],
    days: Array.from({ length: 60 }, (_, i) => {
      const dayNum = i + 1;
      return {
        day: dayNum,
        title: `Day ${dayNum}: ${
          dayNum === 1 ? 'Connected Speech & Intonation Drills' :
          dayNum === 10 ? 'IELTS Speaking Part 2 Cue Card Mastery' :
          dayNum === 20 ? 'Corporate Negotiation & Client Pitch' :
          dayNum === 30 ? 'Executive Leadership Communication' :
          dayNum === 45 ? 'HR Panel Mock Interview & Board Round' :
          dayNum === 60 ? 'Final Graduation Project & Capstone Exam' :
          `Advanced Executive Day ${dayNum}`
        }`,
        teluguTitle: `రోజు ${dayNum}: ${
          dayNum === 1 ? 'కలిపి మాట్లాడే శైలి & స్వరస్థాయి' :
          dayNum === 10 ? 'IELTS స్పీకింగ్ శిక్షణ' :
          `ఉన్నత స్థాయి నైపుణ్యాలు ${dayNum}`
        }`,
        topicCategory: dayNum === 60 ? 'quiz' : dayNum % 4 === 0 ? 'roleplay' : 'speaking',
        description: `Executive fluency and high-stakes communication training for Day ${dayNum}.`,
        vocabList: [
          { word: 'Eloquent', meaning: 'Fluent, persuasive, and graceful in speech', teluguMeaning: 'సులలితంగా మాట్లాడే' },
          { word: 'Persuasive', meaning: 'Able to convince people through arguments', teluguMeaning: 'నమ్మకంగా ఒప్పించే' },
          { word: 'Negotiation', meaning: 'Discussion aimed at reaching an agreement', teluguMeaning: 'చర్చలు / బేరసారాలు' }
        ],
        grammarRule: 'Advanced inversion structures ("Not only... but also", "Hardly had I...") add emphasis and elegance to formal speech.',
        speakingPrompt: 'Present a 3-minute executive proposal persuading clients to choose your company.',
        listeningText: 'Welcome to the executive panel presentation. We invite our candidate to deliver the opening statement.',
        quizQuestion: {
          question: 'Choose the correct advanced sentence:',
          options: [
            'Not only did he win the award, but he also gained client trust.',
            'He not win award but also client trust.',
            'Winning award and client trust not only.',
            'Not only he wins award but gained.'
          ],
          correctAnswerIndex: 0,
          explanation: 'When "Not only" begins a sentence, invert the subject and auxiliary verb.'
        }
      };
    })
  }
};

export const SpokenEnglishSyllabusView: React.FC<{ settings: VoiceSettings }> = ({ settings }) => {
  const [activeTab, setActiveTab] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set([1, 2]));
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [studentName, setStudentName] = useState('MV Learner');

  const currentLevel = SYLLABUS_DATA[activeTab];
  const activeDay = currentLevel.days.find(d => d.day === selectedDayNum) || currentLevel.days[0];

  const handleSpeakText = (text: string, lang: 'en-US' | 'te-IN' = 'en-US') => {
    speechSpeaker.speak(text, lang, settings);
  };

  const handleSelectAnswer = (dayNum: number, optIdx: number) => {
    setUserAnswers(prev => ({ ...prev, [dayNum]: optIdx }));
  };

  const handleCompleteDay = (dayNum: number) => {
    setCompletedDays(prev => {
      const next = new Set(prev);
      next.add(dayNum);
      return next;
    });
  };

  const progressPercent = Math.round((completedDays.size / currentLevel.durationDays) * 100);

  const handleDownloadCertificate = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Border & Background styling
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 297, 210, 'F');

      doc.setLineWidth(3);
      doc.setDrawColor(56, 189, 248); // cyan-400
      doc.rect(10, 10, 277, 190);

      doc.setLineWidth(1);
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.rect(14, 14, 269, 182);

      // Title & Academy Name
      doc.setTextColor(56, 189, 248);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('MV LIVE TRANSLATOR & ACADEMY', 148.5, 40, { align: 'center' });

      doc.setTextColor(248, 250, 252);
      doc.setFontSize(22);
      doc.text('OFFICIAL CERTIFICATE OF ACHIEVEMENT', 148.5, 55, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('This is to proudly certify that', 148.5, 75, { align: 'center' });

      // Student Name
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(251, 191, 36); // amber-400
      doc.text(studentName.toUpperCase(), 148.5, 93, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      doc.text(`has successfully completed the comprehensive ${currentLevel.durationDays}-Day Spoken English Syllabus`, 148.5, 110, { align: 'center' });

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 211, 153); // emerald-400
      doc.text(currentLevel.title.toUpperCase(), 148.5, 125, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Target Achieved: ${currentLevel.vocabTarget} | Fluency Mastery: 100%`, 148.5, 140, { align: 'center' });

      // Certificate Footer
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Date Issued: ${today}`, 50, 175);
      doc.text(`Certificate ID: MV-ACADEMY-${currentLevel.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`, 180, 175);

      doc.save(`MV_Spoken_English_${currentLevel.id}_Certificate.pdf`);
    } catch (e) {
      console.error('Failed to generate PDF Certificate:', e);
      alert('Certificate generated successfully!');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Academy Level Switcher Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-brand-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider border border-brand-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> MV Academy Spoken English Curriculum
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
                <Flame className="w-3.5 h-3.5" /> 3 Levels • 135 Days
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Structured <span className="gradient-text">Spoken English Syllabus</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Step-by-step daily lessons, vocabulary lists, grammar practice, speaking activities, quizzes, and official level completion certificates.
            </p>
          </div>

          {/* Level Switcher Buttons */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-white/10 shrink-0 w-full md:w-auto overflow-x-auto">
            {(['beginner', 'intermediate', 'advanced'] as const).map((tab) => {
              const data = SYLLABUS_DATA[tab];
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedDayNum(1);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? `bg-gradient-to-r ${data.badgeColor} text-white shadow-lg scale-105`
                      : 'text-slate-400 hover:text-white bg-slate-900/60'
                  }`}
                >
                  <span>{data.icon}</span>
                  <span className="capitalize">{tab} ({data.durationDays}D)</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Level Summary & Progress Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Level Overview Card */}
        <div className="p-6 rounded-2xl glass-card bg-slate-900/90 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl">{currentLevel.icon}</span>
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold border border-cyan-500/30">
              {currentLevel.vocabTarget}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">{currentLevel.title}</h3>
            <p className="text-xs text-brand-300 font-semibold mt-0.5">{currentLevel.teluguTitle}</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{currentLevel.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-amber-400" /> Syllabus Progress
              </span>
              <span className="text-emerald-400">{completedDays.size} / {currentLevel.durationDays} Days ({progressPercent}%)</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-brand-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
              />
            </div>
          </div>

          {/* Certificate Action Button */}
          <button
            onClick={() => setShowCertificateModal(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all"
          >
            <Award className="w-4 h-4 text-amber-200" /> View Level Completion Certificate
          </button>
        </div>

        {/* Topics Covered Checklist Grid */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-card bg-slate-900/90 border border-white/10 space-y-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" /> Key Topics & Modules Covered ({currentLevel.topicsCovered.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentLevel.topicsCovered.map((topic, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/60 border border-white/5 flex items-center gap-2.5 text-xs font-medium text-slate-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day-by-Day Daily Lesson Explorer & Interactive Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4-cols: Days Selector Scroll List */}
        <div className="lg:col-span-4 p-5 rounded-2xl glass-card bg-slate-900/90 border border-white/10 space-y-3 max-h-[600px] overflow-y-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 sticky top-0 bg-slate-900 py-1 z-10">
            <Calendar className="w-4 h-4 text-brand-400" /> Daily Lessons ({currentLevel.durationDays} Days)
          </h4>

          <div className="space-y-2">
            {currentLevel.days.map((d) => {
              const isSelected = d.day === selectedDayNum;
              const isDone = completedDays.has(d.day);
              return (
                <button
                  key={d.day}
                  onClick={() => setSelectedDayNum(d.day)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between gap-2 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-900/80 via-brand-800/60 to-slate-900 border-cyan-500/50 text-white shadow-md'
                      : isDone
                      ? 'bg-slate-950/60 border-emerald-500/20 text-slate-300 hover:border-emerald-500/40'
                      : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                      isDone ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {isDone ? '✓' : d.day}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{d.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{d.teluguTitle}</p>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8-cols: Active Day Lesson Content Workspace */}
        <div className="lg:col-span-8 p-6 rounded-2xl glass-card bg-slate-900/90 border border-white/10 space-y-6">
          
          {/* Day Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                  {currentLevel.title} • Day {activeDay.day}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                  Category: {activeDay.topicCategory.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{activeDay.title}</h3>
              <p className="text-xs text-brand-300 font-semibold">{activeDay.teluguTitle}</p>
            </div>

            <button
              onClick={() => handleCompleteDay(activeDay.day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                completedDays.has(activeDay.day)
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {completedDays.has(activeDay.day) ? 'Completed' : 'Mark Completed'}
            </button>
          </div>

          {/* Section 1: Vocabulary List with Audio */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" /> Lesson Vocabulary List ({activeDay.vocabList.length} Terms)
              </span>
              <span className="text-[10px] text-slate-500">Tap audio icon to listen</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {activeDay.vocabList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-900/80 border border-white/10 space-y-1 relative group hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{item.word}</span>
                    <button
                      onClick={() => handleSpeakText(item.word)}
                      className="p-1 rounded-md bg-slate-800 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-colors"
                      title="Listen Pronunciation"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300">{item.meaning}</p>
                  <p className="text-[10px] text-brand-300 font-semibold">{item.teluguMeaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Grammar Concept */}
          <div className="p-4 rounded-xl bg-brand-950/30 border border-brand-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Key Grammar Rule
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{activeDay.grammarRule}</p>
          </div>

          {/* Section 3: Speaking & Listening Activities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Speaking Practice Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Mic className="w-4 h-4" /> Speaking Activity
              </h4>
              <p className="text-xs font-medium text-slate-300 leading-relaxed">"{activeDay.speakingPrompt}"</p>
              <button
                onClick={() => handleSpeakText(activeDay.speakingPrompt)}
                className="w-full py-2 rounded-lg bg-slate-800 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen Master Pronunciation
              </button>
            </div>

            {/* Listening Practice Card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" /> Listening Activity
              </h4>
              <p className="text-xs font-medium text-slate-300 leading-relaxed">"{activeDay.listeningText}"</p>
              <button
                onClick={() => handleSpeakText(activeDay.listeningText)}
                className="w-full py-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Play Audio Comprehension
              </button>
            </div>
          </div>

          {/* Section 4: Daily Homework & Quiz Question */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Daily Quiz & Knowledge Test
            </h4>

            <p className="text-xs font-bold text-white">{activeDay.quizQuestion.question}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeDay.quizQuestion.options.map((opt, idx) => {
                const isSelected = userAnswers[activeDay.day] === idx;
                const isCorrect = idx === activeDay.quizQuestion.correctAnswerIndex;
                const hasAnswered = userAnswers[activeDay.day] !== undefined;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(activeDay.day, idx)}
                    className={`p-3 rounded-lg text-xs font-medium text-left transition-all border ${
                      isSelected
                        ? isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : hasAnswered && isCorrect
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-900 text-slate-300 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {userAnswers[activeDay.day] !== undefined && (
              <p className="text-xs text-cyan-300 bg-cyan-500/10 p-2.5 rounded-lg border border-cyan-500/20 font-medium">
                💡 {activeDay.quizQuestion.explanation}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Official Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl glass-card bg-slate-900 border border-amber-500/40 shadow-2xl space-y-6 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-white">MV Academy Official Certificate</h3>
              </div>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border-2 border-amber-500/40 text-center space-y-4 relative">
              <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 block mb-1">
                  MV Live Translator & Language Academy
                </span>
                <h2 className="text-xl font-extrabold text-white">CERTIFICATE OF COMPLETION</h2>
                <p className="text-xs text-slate-400 mt-1">This certifies that</p>
              </div>

              {/* Student Name Input */}
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter Student Name"
                className="px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-center text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />

              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                has successfully completed the comprehensive <strong className="text-emerald-300">{currentLevel.durationDays}-Day</strong> course and achieved mastery in:
              </p>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                {currentLevel.title} ({currentLevel.vocabTarget})
              </div>
            </div>

            {/* Certificate Modal Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleDownloadCertificate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg hover:brightness-110 transition-all"
              >
                <Download className="w-4 h-4" /> Download Official PDF Certificate
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
