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
          primary_purpose,
          word_count,
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

  async getRecentUserSpeeches(userId: string): Promise<{ data: Speech[] | null; error: ServiceError | null }> {
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
          primary_purpose,
          word_count,
          tone,
          medium,
          occasion,
          created_at,
          updated_at
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(4);

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
          content: "",
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

  async getSpeechWithVersions(speechId: string): Promise<{
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
          primary_purpose,
          word_count,
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
  },

  async getSpeechWithAllVersions(speechId: string): Promise<{
    data: {
      speech: (Speech & { versions: SpeechVersion[] }) | null;
    };
    error: ServiceError | null;
  }> {
    const supabase = createClient();
    
    try {
      // Use the foreign table join feature with the '!inner()' syntax
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
          primary_purpose,
          word_count,
          tone,
          medium,
          occasion,
          created_at,
          updated_at,
          versions:speech_versions(
            id, 
            speech_id, 
            version_number, 
            version_name, 
            content, 
            created_by, 
            updated_by, 
            created_at, 
            updated_at
          )
        `)
        .eq('id', speechId)
        .single();

      if (error) throw error;

      return {
        data: {
          speech: data,
        },
        error: null
      };
      
    } catch (error) {
      console.error('Error fetching speech with versions:', error);
      return {
        data: { speech: null },
        error: {
          message: 'Failed to fetch speech data with versions',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async createNewVersion(
    speechId: string, 
    data: { 
      versionName: string; 
      content?: string; 
      userId: string;
      baseVersionId?: string;
    }
  ): Promise<{ 
    versionId: string | null; 
    error: ServiceError | null 
  }> {
    const supabase = createClient();
    
    try {
      // First, get the highest version number for this speech
      const { data: maxVersionData, error: maxVersionError } = await supabase
        .from("speech_versions")
        .select('version_number')
        .eq('speech_id', speechId)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      if (maxVersionError && maxVersionError.code !== 'PGRST116') { // PGRST116 is "no rows returned" - which is fine for first version
        throw maxVersionError;
      }

      const nextVersionNumber = maxVersionData ? maxVersionData.version_number + 1 : 1;
      
      // If baseVersionId is provided, get that version's content
      let initialContent = data.content || "";
      
      if (data.baseVersionId) {
        const { data: baseVersionData, error: baseVersionError } = await supabase
          .from("speech_versions")
          .select('content')
          .eq('id', data.baseVersionId)
          .single();
          
        if (baseVersionError) {
          console.warn('Error fetching base version content:', baseVersionError);
          // Continue with default content
        } else if (baseVersionData) {
          initialContent = baseVersionData.content;
        }
      }

      // Create new version
      const { data: newVersionData, error: createError } = await supabase
        .from("speech_versions")
        .insert({
          speech_id: speechId,
          version_number: nextVersionNumber,
          version_name: data.versionName || `Version ${nextVersionNumber}`,
          content: initialContent,
          created_by: data.userId,
          updated_by: data.userId
        })
        .select('id')
        .single();

      if (createError) throw createError;

      return {
        versionId: newVersionData?.id || null,
        error: null
      };

    } catch (error) {
      console.error('Error creating new version:', error);
      return {
        versionId: null,
        error: {
          message: 'Failed to create new speech version',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async updateVersionInfo(
    versionId: string,
    data: { versionName?: string }
  ): Promise<{ error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("speech_versions")
        .update({
          version_name: data.versionName,
          updated_at: new Date().toISOString()
        })
        .eq('id', versionId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating version info:', error);
      return {
        error: {
          message: 'Failed to update version information',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async deleteVersion(
    speechId: string,
    versionId: string
  ): Promise<{ error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      // First check if this is the only version left
      const { data: countData, error: countError } = await supabase
        .from("speech_versions")
        .select('id', { count: 'exact' })
        .eq('speech_id', speechId);
        
      if (countError) throw countError;
      
      // Don't allow deleting the last version
      if (countData && countData.length <= 1) {
        return {
          error: {
            message: 'Cannot delete the only version of a speech',
            details: 'At least one version must remain'
          }
        };
      }
      
      // Delete the version
      const { error } = await supabase
        .from("speech_versions")
        .delete()
        .eq('id', versionId)
        .eq('speech_id', speechId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error deleting version:', error);
      return {
        error: {
          message: 'Failed to delete version',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async deleteSpeech(speechId: string) {
    const supabase = createClient();
    
    try {
      // First delete all versions associated with this speech
      const { error: versionsError } = await supabase
        .from("speech_versions")
        .delete()
        .eq("speech_id", speechId);
        
      if (versionsError) {
        console.error("Error deleting speech versions:", versionsError);
        return { error: versionsError };
      }
      
      // Then delete the speech itself
      const { error } = await supabase
        .from("speeches")
        .delete()
        .eq("id", speechId);
        
      if (error) {
        console.error("Error deleting speech:", error);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error("Error in deleteSpeech:", error);
      return { error };
    }
  }
}; 