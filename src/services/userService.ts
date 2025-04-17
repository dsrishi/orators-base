import { createClient } from '@/lib/supabase/client';
import { ServiceError, UpdatePasswordData, UpdateProfileData } from '@/types/user';

export const userService = {
  async updateProfile(
    userId: string,
    data: UpdateProfileData
  ): Promise<{ error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from("users")
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        error: {
          message: 'Failed to update profile',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async updatePassword(
    userId: string,
    data: UpdatePasswordData
  ): Promise<{ error: ServiceError | null }> {
    const supabase = createClient();
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating password:', error);
      return {
        error: {
          message: 'Failed to update password',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  },

  async getProfile(userId: string): Promise<{ 
    data: { 
      first_name: string | null;
      last_name: string | null;
      gender: string | null;
      date_of_birth: string | null;
      experience_level: string | null;
      speaking_pace: number | null;
    } | null; 
    error: ServiceError | null 
  }> {
    const supabase = createClient();
    
    try {
      const { data, error } = await supabase
        .from("users")
        .select('first_name, last_name, gender, date_of_birth, experience_level, speaking_pace')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        data: null,
        error: {
          message: 'Failed to fetch profile',
          details: error instanceof Error ? error.message : error
        }
      };
    }
  }
}; 