export interface Speech {
  id: string;
  title: string;
  description: string;
  main_type: string;
  duration: number;
  target_audience: string;
  language: string;
  objective: string;
  primary_purpose: string;
  word_count: number;
  tone: string;
  medium: string;
  occasion: string;
  created_at: string;
  updated_at: string;
  files?: SpeechFile[];
} 

export interface SpeechFile {
  id: string;
  speech_id: string;
  file_number: number;
  file_name: string;
  content: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceError {
  message: string;
  details?: unknown;
}

export interface CreateSpeechData {
  userId: string;
  title: string;
  description?: string;
  main_type?: string;
}

export interface UpdateSpeechData {
  title?: string;
  description?: string;
  main_type?: string;
  duration?: number;
  target_audience?: string;
  language?: string;
  objective?: string;
  primary_purpose?: string;
  word_count?: number;
  tone?: string;
  medium?: string;
  occasion?: string;
}

export interface UpdateFileData {
  content: string;
}

export interface SpeechMetrics {
  wordCount: number;
  characterCount: number;
  paragraphCount: number;
  estimatedDuration: string;
  readingTime: string;
  sentenceCount: number;
  averageSentenceLength: number;
  averageWordLength: number;
  uniqueWordCount: number;
  longestSentenceLength: number;
  shortestSentenceLength: number;
  longestWordLength: number;
  shortestWordLength: number;
}

export interface SpeechStats {
  characterCount: number;
  wordCount: number;
  averageWordLength: number;
  sentenceCount: number;
  averageSentenceLength: number;
  paragraphCount: number;
  averageParagraphLength: number;
  estimatedDuration: string;
  readingTime: string;
}