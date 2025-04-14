export interface ServiceError {
    message: string;
    details?: unknown;
  }
  
  export interface User {
    id: string;
    auth_id: string;
    email: string;
    first_name: string;
    last_name: string;
    profile_picture?: string;
    gender?: string;
    date_of_birth?: Date;
    experience_level?: string;
    speaking_pace?: number;
    created_at: string;
  }

 export interface UpdateProfileData {
    first_name?: string;
    last_name?: string;
    gender?: string;
    date_of_birth?: Date;
    experience_level?: string;
    speaking_pace?: number;
  }
  
 export interface UpdatePasswordData {
    password: string;
  }