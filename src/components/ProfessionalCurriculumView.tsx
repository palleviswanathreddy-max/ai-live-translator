import React, { useState } from 'react';
import {
  Award, Lock, Unlock, CheckCircle2, Play, Volume2, BookOpen, Sparkles,
  ChevronRight, ArrowLeft, Download, ShieldCheck, Flame, Layers, HelpCircle, UserCheck
} from 'lucide-react';
import { VoiceSettings } from '../types';
import { PROFESSIONAL_8_LEVEL_CURRICULUM, CurriculumLevel, CurriculumLesson } from '../services/curriculumData';
import { speechSpeaker } from '../services/speechSynthesis';

interface ProfessionalCurriculumViewProps {
  settings: VoiceSettings;
}

export const ProfessionalCurriculumView: React.FC<ProfessionalCurriculumViewProps> = ({ settings }) => {
  const [unlockedLevelIds, setUnlockedLevelIds] = useState<Set<number>>(new Set([1, 2]));
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [activeLessonId, setActiveLessonId] = useState<string>('l1-1');
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set(['l1-1']));
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);
  const [studentName, setStudentName] = useState<string>('MV Academy Scholar');

  const currentLevel = PROFESSIONAL_8_LEVEL_CURRICULUM.find(l => l.id === activeLevelId) || PROFESSIONAL_8_LEVEL_CURRICULUM[0];
  const activeLesson = currentLevel.lessons.find(l => l.id === activeLessonId) || currentLevel.lessons[0];

  const isLevelUnlocked = (lvlId: number) => unlockedLevelIds.has(lvlId);

  const handleSpeakText = (text: string, lang: 'en-US' | 'te-IN' = 'en-US') => {
    speechSpeaker.speak(text, lang, settings);
  };

  const handleSelectAnswer = (exId: string, opt: string) => {
    setSelectedAnswers(prev => ({ ...prev, [exId]: opt }));
  };

  const handleCompleteLesson = (lessonId: string) => {
    setCompletedLessonIds(prev => {
      const next = new Set(prev);
      next.add(lessonId);
      return next;
    });

    // Check if all lessons of current level are completed to unlock next level
    const allCurrentLessonsDone = currentLevel.lessons.every(l => completedLessonIds.has(l.id) || l.id === lessonId);
    if (allCurrentLessonsDone && activeLevelId < 8) {
      setUnlockedLevelIds(prev => {
        const next = new Set(prev);
        next.add(activeLevelId + 1);
        return next;
      });
    }
  };

  const handleUnlockAllLevels = () => {
    setUnlockedLevelIds(new Set([1, 2, 3, 4, 5, 6, 7, 8]));
  };

  const handleDownloadCertificate = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      // Dark Theme Background & Border Styling
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 297, 210, 'F');

      doc.setLineWidth(3);
      doc.setDrawColor(56, 189, 248); // cyan-400
      doc.rect(10, 10, 277, 190);

      doc.setLineWidth(1);
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.rect(14, 14, 269, 182);

      // Title Header
      doc.setTextColor(56, 189, 248);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('MV LIVE TRANSLATOR & LANGUAGE ACADEMY', 148.5, 38, { align: 'center' });

      doc.setTextColor(248, 250, 252);
      doc.setFontSize(22);
      doc.text('PROFESSIONAL ACADEMY CERTIFICATE OF MASTERY', 148.5, 52, { align: 'center' });

      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('This is to officially certify that', 148.5, 72, { align: 'center' });

      // Student Name
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(251, 191, 36); // amber-400
      doc.text(studentName.toUpperCase(), 148.5, 90, { align: 'center' });

      doc.setFontSize(13);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      doc.text(`has successfully completed all requirements and mastered the curriculum for:`, 148.5, 108, { align: 'center' });

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(52, 211, 153); // emerald-400
      doc.text(currentLevel.levelTitle, 148.5, 124, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Level Topics: ${currentLevel.topicsCovered.slice(0, 3).join(' • ')}`, 148.5, 138, { align: 'center' });

      // Footer Information
      const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.text(`Date Issued: ${today}`, 50, 172);
      doc.text(`Certificate ID: MV-PROF-${currentLevel.slug.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`, 175, 172);

      doc.save(`MV_Academy_${currentLevel.slug}_Certificate.pdf`);
    } catch (e) {
      console.error('Failed to generate PDF Certificate:', e);
      alert('Certificate downloaded!');
    }
  };

  const levelProgress = Math.round((completedLessonIds.size / (PROFESSIONAL_8_LEVEL_CURRICULUM.length * 3)) * 100);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Academy Banner & Title */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-brand-500/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider border border-brand-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Professional Spoken English Academy
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> 8 Structured Levels
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Professional <span className="gradient-text">Spoken English Curriculum</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Complete 8-Level structured pathway from basic alphabet phonics to executive interview preparation and fluency mastery.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleUnlockAllLevels}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-white/10 transition-colors"
            >
              <Unlock className="w-4 h-4 text-emerald-400" /> Unlock All 8 Levels
            </button>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all shrink-0"
            >
              <Award className="w-4 h-4 text-amber-200" /> Level Certificate
            </button>
          </div>
        </div>
      </div>

      {/* 8-Level Locked Progression Track Bar */}
      <div className="p-4 rounded-2xl glass-card bg-slate-900/90 border border-white/10 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-3 min-w-max">
          {PROFESSIONAL_8_LEVEL_CURRICULUM.map((lvl) => {
            const isUnlocked = isLevelUnlocked(lvl.id);
            const isActive = activeLevelId === lvl.id;

            return (
              <button
                key={lvl.id}
                onClick={() => {
                  if (isUnlocked) {
                    setActiveLevelId(lvl.id);
                    setActiveLessonId(lvl.lessons[0].id);
                  } else {
                    alert(`Level ${lvl.id} is locked! Complete Level ${lvl.id - 1} lessons to unlock.`);
                  }
                }}
                className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 border ${
                  isActive
                    ? `bg-gradient-to-r ${lvl.badgeColor} text-white shadow-lg scale-105 border-white/40`
                    : isUnlocked
                    ? 'bg-slate-950/70 border-white/10 text-slate-300 hover:text-white hover:border-white/30'
                    : 'bg-slate-950/30 border-white/5 text-slate-600 cursor-not-allowed'
                }`}
              >
                <span>{lvl.icon}</span>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold">Level {lvl.id}</span>
                    {!isUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
                  </div>
                  <p className="text-[10px] opacity-80 truncate max-w-[120px]">{lvl.slug.toUpperCase()}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Level Details & Active Lesson Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 4-cols: Lessons List for Active Level */}
        <div className="lg:col-span-4 p-5 rounded-2xl glass-card bg-slate-900/90 border border-white/10 space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-2xl">{currentLevel.icon}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                {currentLevel.lessons.length} Modules
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{currentLevel.levelTitle}</h3>
            <p className="text-xs text-brand-300 font-semibold">{currentLevel.teluguTitle}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{currentLevel.description}</p>
          </div>

          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2">
            Lessons & Topics ({currentLevel.lessons.length})
          </h4>

          <div className="space-y-2">
            {currentLevel.lessons.map((les, idx) => {
              const isSelected = les.id === activeLessonId;
              const isDone = completedLessonIds.has(les.id);

              return (
                <button
                  key={les.id}
                  onClick={() => setActiveLessonId(les.id)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all flex items-center justify-between gap-2 border ${
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
                      {isDone ? '✓' : idx + 1}
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-bold truncate">{les.title}</p>
                      <p className="text-[10px] text-slate-500 truncate">{les.teluguTitle}</p>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'rotate-90 text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8-cols: Active Lesson Detailed Content & Quiz Interactive Runner */}
        <div className="lg:col-span-8 p-6 rounded-2xl glass-card bg-slate-900/90 border border-white/10 space-y-6">
          
          {/* Lesson Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-500/30">
                {currentLevel.levelTitle} • Topic: {activeLesson.topic}
              </span>
              <h3 className="text-xl font-bold text-white mt-1">{activeLesson.title}</h3>
              <p className="text-xs text-brand-300 font-semibold">{activeLesson.teluguTitle}</p>
            </div>

            <button
              onClick={() => handleCompleteLesson(activeLesson.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                completedLessonIds.has(activeLesson.id)
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {completedLessonIds.has(activeLesson.id) ? 'Completed' : 'Mark Completed'}
            </button>
          </div>

          {/* Lesson Concept Summary */}
          <div className="p-4 rounded-xl bg-brand-950/30 border border-brand-500/20 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Concept Summary & Grammar Rule
            </h4>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{activeLesson.conceptSummary}</p>
          </div>

          {/* Practical Examples with Audio Synthesis */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" /> Practical Spoken Examples ({activeLesson.examples.length})
              </span>
              <span className="text-[10px] text-slate-500">Tap audio icon to listen</span>
            </h4>

            <div className="space-y-2">
              {activeLesson.examples.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between gap-3 hover:border-cyan-500/30 transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-white">{ex.en}</p>
                    <p className="text-[11px] text-brand-300 font-medium mt-0.5">{ex.te}</p>
                  </div>
                  <button
                    onClick={() => handleSpeakText(ex.en)}
                    className="p-2 rounded-lg bg-slate-800 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-colors shrink-0"
                    title="Listen Pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Vocabulary Bank */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" /> Essential Topic Vocabulary
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeLesson.vocabularyList.map((v, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900/80 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{v.word}</span>
                    <button
                      onClick={() => handleSpeakText(v.word)}
                      className="text-xs text-slate-400 hover:text-cyan-300"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-300">{v.meaning}</p>
                  <p className="text-[10px] text-brand-300 font-semibold">{v.teluguMeaning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Topic Exercise & Quiz Question */}
          <div className="p-5 rounded-xl bg-slate-950/80 border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Topic Quiz & Exercise Practice
            </h4>

            <div className="space-y-1">
              <p className="text-xs font-bold text-white">{activeLesson.exercise.question}</p>
              <p className="text-[11px] text-brand-300 font-medium">{activeLesson.exercise.teluguQuestion}</p>
            </div>

            {activeLesson.exercise.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeLesson.exercise.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[activeLesson.exercise.id] === opt;
                  const isCorrect = opt === activeLesson.exercise.correctAnswer;
                  const hasAnswered = selectedAnswers[activeLesson.exercise.id] !== undefined;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectAnswer(activeLesson.exercise.id, opt)}
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
            )}

            {selectedAnswers[activeLesson.exercise.id] !== undefined && (
              <p className="text-xs text-cyan-300 bg-cyan-500/10 p-3 rounded-lg border border-cyan-500/20 font-medium">
                💡 {activeLesson.exercise.explanation}
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
                <h3 className="text-lg font-bold text-white">MV Academy Professional Certificate</h3>
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
                  MV Live Translator & Professional Academy
                </span>
                <h2 className="text-xl font-extrabold text-white">PROFESSIONAL DIPLOMA CERTIFICATE</h2>
                <p className="text-xs text-slate-400 mt-1">This certifies that</p>
              </div>

              {/* Student Name Input */}
              <label htmlFor="professional-curriculum-student-name" className="sr-only">Scholar Name for Certificate</label>
              <input
                id="professional-curriculum-student-name"
                name="studentName"
                autoComplete="name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter Scholar Name"
                className="px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-center text-lg font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              />

              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                has successfully completed all coursework, exercises, and exams for:
              </p>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-sm">
                {currentLevel.levelTitle} ({currentLevel.topicsCovered.length} Core Modules)
              </div>
            </div>

            {/* Certificate Modal Actions */}
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
                <Download className="w-4 h-4" /> Download PDF Certificate
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
