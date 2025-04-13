import { createClient } from '@/lib/supabase/client';
import { Speech } from '@/types/speech';

interface ServiceError {
  message: string;
  details?: unknown;
}

interface CreateSpeechData {
  userId: string;
  title: string;
  description?: string;
  main_type?: string;
}

export const speechService = {
  async getUserSpeeches(userId: string): Promise<{ data: Speech[] | null; error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      // Fetch speeches for the user
      const { data, error } = await supabase
        .from("speeches")
        .select(
          `
          id,
          title,
          description,
          duration,
          created_at,
          main_type
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return {
          data: null,
          error: {
            message: 'Error fetching speeches',
            details: error
          }
        };
      }

      return {
        data: data,
        error: null
      };
      
    } catch (error) {
      return {
        data: null,
        error: {
          message: 'Unexpected error occurred',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async createNewSpeech(data: CreateSpeechData): Promise<{ 
    speechId: string | null; 
    error: ServiceError | null 
  }> {
    const supabase = createClient();
    
    try {
      // Generate UUID for the speech using Supabase's built-in function
      const { data: speechData, error: speechError } = await supabase
        .from("speeches")
        .insert({
          user_id: data.userId,
          title: data.title || "Untitled Speech",
          description: data.description || "",
          main_type: data.main_type || "other",
          created_by: data.userId,
          updated_by: data.userId,
        })
        .select('id')
        .single();

      if (speechError) {
        console.error('Speech creation error:', speechError);
        throw speechError;
      }
      if (!speechData) throw new Error('Failed to create speech');

      // Create initial version
      const { error: versionError } = await supabase
        .from("speech_versions")
        .insert({
          speech_id: speechData.id, // This will be a proper UUID now
          version_number: 1,
          version_name: "Initial Version",
          content: "<p>Start writing here...</p>",
          created_by: data.userId,
          updated_by: data.userId
        });

      if (versionError) {
        console.error('Version creation error:', versionError);
        throw versionError;
      }

      return {
        speechId: speechData.id,
        error: null
      };

    } catch (error) {
      console.error('Error creating speech:', error);
      return {
        speechId: null,
        error: {
          message: 'Failed to create speech',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async getSpeechWithVersion(speechId: string): Promise<{
    data: {
      speech: Speech | null;
      content: string | null;
    };
    error: ServiceError | null;
  }> {
    const supabase = createClient();
    
    try {
      // Fetch speech data
      const { data: speechData, error: speechError } = await supabase
        .from("speeches")
        .select(`
          id,
          title,
          description,
          duration,
          main_type,
          created_at
        `)
        .eq('id', speechId)
        .single();

      if (speechError) throw speechError;

      // Fetch version 1 content
      const { data: versionData, error: versionError } = await supabase
        .from("speech_versions")
        .select('content')
        .eq('speech_id', speechId)
        .eq('version_number', 1)
        .single();

      if (versionError) throw versionError;

      return {
        data: {
          speech: speechData,
          content: versionData?.content || null
        },
        error: null
      };
      
    } catch (error) {
      console.error('Error fetching speech:', error);
      return {
        data: { speech: null, content: null },
        error: {
          message: 'Failed to fetch speech data',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  }
}; 