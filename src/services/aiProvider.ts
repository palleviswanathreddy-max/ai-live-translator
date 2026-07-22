import { GrammarCorrection, VocabWord, PronunciationResult, LearningLevel } from '../types';
import { analyzeGrammar, extractVocabulary, analyzePronunciation } from './learningService';

export interface RoleplayReply {
  text: string;
  grammarCorrection?: GrammarCorrection;
}

export interface AIProvider {
  name: string;
  isFree: boolean;
  evaluateGrammar(text: string, level?: LearningLevel): Promise<GrammarCorrection>;
  generateRoleplayReply(scenario: string, userText: string, level?: LearningLevel): Promise<RoleplayReply>;
  evaluatePronunciation(targetText: string, spokenText: string): Promise<PronunciationResult>;
  extractVocabulary(sentence: string, teluguTranslation?: string): Promise<VocabWord[]>;
}

/**
 * FreeNativeProvider:
 * 100% Free & Open-Source Browser Native Implementation.
 * Uses Web Speech Recognition, Web Speech Synthesis, Local NLP heuristics & Master Dictionary.
 * Fully usable and production-ready for students without API keys.
 */
export class FreeNativeProvider implements AIProvider {
  name = 'Free Native Browser Engine (Open Source)';
  isFree = true;

  async evaluateGrammar(text: string, level: LearningLevel = 'beginner'): Promise<GrammarCorrection> {
    return analyzeGrammar(text, level);
  }

  async generateRoleplayReply(scenario: string, userText: string, level: LearningLevel = 'beginner'): Promise<RoleplayReply> {
    const grammarCorrection = analyzeGrammar(userText, level);
    const lower = userText.toLowerCase();
    let text = 'Thank you for your reply! Tell me more about that or ask me another question.';

    if (scenario === 'Restaurant') {
      if (lower.includes('table') || fontMatch(lower, ['two', 'people', 'reservation'])) {
        text = 'Right this way! Here is your table and menu. May I take your drink order?';
      } else if (lower.includes('water') || lower.includes('menu') || lower.includes('special')) {
        text = 'Our chef special today is Fresh Garlic Herb Chicken with Steamed Rice. Would you like to try it?';
      } else {
        text = 'Excellent choice! I will bring your order out in 10 minutes.';
      }
    } else if (scenario === 'Airport') {
      if (lower.includes('flight') || lower.includes('ticket') || lower.includes('passport')) {
        text = 'Thank you. Please place your luggage on the scale for check-in.';
      } else {
        text = 'Here is your boarding pass. Gate 12 opens at 4:30 PM. Have a safe flight!';
      }
    }

    return {
      text,
      grammarCorrection: grammarCorrection.highlights.some((h) => h.type === 'error') ? grammarCorrection : undefined
    };
  }

  async evaluatePronunciation(targetText: string, spokenText: string): Promise<PronunciationResult> {
    return analyzePronunciation(targetText, spokenText);
  }

  async extractVocabulary(sentence: string, teluguTranslation: string = ''): Promise<VocabWord[]> {
    return extractVocabulary(sentence, teluguTranslation);
  }
}

function fontMatch(text: string, keywords: string[]): boolean {
  return keywords.some((k) => text.includes(k));
}

// Global active provider singleton defaulting to Free Native Engine
export let activeAIProvider: AIProvider = new FreeNativeProvider();

export function setAIProvider(provider: AIProvider) {
  activeAIProvider = provider;
}
