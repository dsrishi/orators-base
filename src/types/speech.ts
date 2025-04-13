export interface Speech {
  id: string;
  title: string;
  description: string;
  main_type: string;
  duration: number;
  target_audience: string;
  language: string;
  objective: string;
  purpose: string;
  tone: string;
  medium: string;
  occasion: string;
  created_at: string;
  updated_at: string;
} 

export interface SpeechVersion {
  id: string;
  speech_id: string;
  version_number: number;
  version_name: string;
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
  purpose?: string;
  tone?: string;
  medium?: string;
  occasion?: string;
}

export interface UpdateVersionData {
  content: string;
}