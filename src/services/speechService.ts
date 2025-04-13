import { createClient } from '@/lib/supabase/client';
import { Speech } from '@/types/speech';

interface ServiceError {
  message: string;
  details?: unknown;
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
  }
}; 