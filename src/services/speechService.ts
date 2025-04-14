import { createClient } from '@/lib/supabase/client';
import { Speech, SpeechVersion, ServiceError, CreateSpeechData, UpdateSpeechData, UpdateVersionData } from '@/types/speech';


export const speechService = {
  async getUserSpeeches(userId: string): Promise<{ data: Speech[] | null; error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from("speeches")
        .select(`
          id,
          title,
          description,
          main_type,
          duration,
          target_audience,
          language,
          objective,
          purpose,
          tone,
          medium,
          occasion,
          created_at,
          updated_at
        `)
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
      version: SpeechVersion | null;
    };
    error: ServiceError | null;
  }> {
    const supabase = createClient();
    
    try {
      // Fetch speech data with all fields
      const { data: speechData, error: speechError } = await supabase
        .from("speeches")
        .select(`
          id,
          title,
          description,
          main_type,
          duration,
          target_audience,
          language,
          objective,
          purpose,
          tone,
          medium,
          occasion,
          created_at,
          updated_at
        `)
        .eq('id', speechId)
        .single();

      if (speechError) throw speechError;

      // Fetch version 1 content
      const { data: versionData, error: versionError } = await supabase
        .from("speech_versions")
        .select('id, speech_id, version_number, version_name, content, created_by, updated_by, created_at, updated_at')
        .eq('speech_id', speechId)
        .eq('version_number', 1)
        .single();

      if (versionError) throw versionError;

      return {
        data: {
          speech: speechData,
          version: versionData,
        },
        error: null
      };
      
    } catch (error) {
      console.error('Error fetching speech:', error);
      return {
        data: { speech: null, version: null },
        error: {
          message: 'Failed to fetch speech data',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async updateSpeechInfo(
    speechId: string, 
    data: UpdateSpeechData
  ): Promise<{ error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("speeches")
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', speechId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating speech:', error);
      return {
        error: {
          message: 'Failed to update speech information',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async updateVersionContent(
    speechId: string,
    versionId: string,
    data: UpdateVersionData
  ): Promise<{ error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("speech_versions")
        .update({
          content: data.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', versionId)
        .eq('speech_id', speechId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating version content:', error);
      return {
        error: {
          message: 'Failed to update version content',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  }
}; 