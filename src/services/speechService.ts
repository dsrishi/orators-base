import { createClient } from '@/lib/supabase/client';
import { Speech, SpeechFile, ServiceError, CreateSpeechData, UpdateSpeechData, UpdateFileData } from '@/types/speech';


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

      const content = JSON.stringify([
        {
          type: "paragraph",
          children: [{ text: "" }],
        },
      ]);

      // Create initial file
      const { error: fileError } = await supabase
        .from("speech_files")
        .insert({
          speech_id: speechData.id, // This will be a proper UUID now
          file_number: 1,
          file_name: "Initial File",
          content: content,
          created_by: data.userId,
          updated_by: data.userId
        });

      if (fileError) {
        console.error('File creation error:', fileError);
        throw fileError;
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

  async getSpeechWithFiles(speechId: string): Promise<{
    data: {
      speech: Speech | null;
      file: SpeechFile | null;
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

      // Fetch file 1 content
      const { data: fileData, error: fileError } = await supabase
        .from("speech_files")
        .select('id, speech_id, file_number, file_name, content, created_by, updated_by, created_at, updated_at')
        .eq('speech_id', speechId)
        .eq('file_number', 1)
        .single();

      if (fileError) throw fileError;

      return {
        data: {
          speech: speechData,
          file: fileData,
        },
        error: null
      };
      
    } catch (error) {
      console.error('Error fetching speech:', error);
      return {
        data: { speech: null, file: null },
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

  async updateFileContent(
    speechId: string,
    fileId: string,
    data: UpdateFileData
  ): Promise<{ error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("speech_files")
        .update({
          content: data.content,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId)
        .eq('speech_id', speechId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating file content:', error);
      return {
        error: {
          message: 'Failed to update file content',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async getSpeechWithAllFiles(speechId: string): Promise<{
    data: {
      speech: (Speech & { files: SpeechFile[] }) | null;
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
          files:speech_files(
            id, 
            speech_id, 
            file_number, 
            file_name, 
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
      console.error('Error fetching speech with files:', error);
      return {
        data: { speech: null },
        error: {
          message: 'Failed to fetch speech data with files',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async createNewFile(
    speechId: string, 
    data: { 
      fileName: string; 
      content?: string; 
      userId: string;
      baseFileId?: string;
    }
  ): Promise<{ 
    fileId: string | null; 
    error: ServiceError | null 
  }> {
    const supabase = createClient();
    
    try {
      // First, get the highest file number for this speech
      const { data: maxFileData, error: maxFileError } = await supabase
        .from("speech_files")
        .select('file_number')
        .eq('speech_id', speechId)
        .order('file_number', { ascending: false })
        .limit(1)
        .single();

      if (maxFileError && maxFileError.code !== 'PGRST116') { // PGRST116 is "no rows returned" - which is fine for first file
        throw maxFileError;
      }

      const nextFileNumber = maxFileData ? maxFileData.file_number + 1 : 1;

      const emptyContent = JSON.stringify([
        {
          type: "paragraph",
          children: [{ text: "" }],
        },
      ]);
      
      // If baseFileId is provided, get that file's content
      let initialContent = data.content || emptyContent;
      
      if (data.baseFileId) {
        const { data: baseFileData, error: baseFileError } = await supabase
          .from("speech_files")
          .select('content')
          .eq('id', data.baseFileId)
          .single();
          
        if (baseFileError) {
          console.warn('Error fetching base file content:', baseFileError);
          // Continue with default content
        } else if (baseFileData) {
          initialContent = baseFileData.content;
        }
      }

      // Create new file
      const { data: newFileData, error: createError } = await supabase
        .from("speech_files")
        .insert({
          speech_id: speechId,
          file_number: nextFileNumber,
          file_name: data.fileName || `File ${nextFileNumber}`,
          content: initialContent,
          created_by: data.userId,
          updated_by: data.userId
        })
        .select('id')
        .single();

      if (createError) throw createError;

      return {
        fileId: newFileData?.id || null,
        error: null
      };

    } catch (error) {
      console.error('Error creating new file:', error);
      return {
        fileId: null,
        error: {
          message: 'Failed to create new speech file',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async updateFileInfo(
    fileId: string,
    data: { fileName?: string }
  ): Promise<{ error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("speech_files")
        .update({
          file_name: data.fileName,
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating file info:', error);
      return {
        error: {
          message: 'Failed to update file information',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async deleteFile(
    speechId: string,
    fileId: string
  ): Promise<{ error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      // First check if this is the only file left
      const { data: countData, error: countError } = await supabase
        .from("speech_files")
        .select('id', { count: 'exact' })
        .eq('speech_id', speechId);
        
      if (countError) throw countError;
      
      // Don't allow deleting the last file
      if (countData && countData.length <= 1) {
        return {
          error: {
            message: 'Cannot delete the only file of a speech',
            details: 'At least one file must remain'
          }
        };
      }
      
      // Delete the file
      const { error } = await supabase
        .from("speech_files")
        .delete()
        .eq('id', fileId)
        .eq('speech_id', speechId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        error: {
          message: 'Failed to delete file',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async deleteSpeech(speechId: string) {
    const supabase = createClient();
    
    try {
      // First delete all files associated with this speech
      const { error: filesError } = await supabase
        .from("speech_files")
        .delete()
        .eq("speech_id", speechId);
        
      if (filesError) {
        console.error("Error deleting speech files:", filesError);
        return { error: filesError };
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