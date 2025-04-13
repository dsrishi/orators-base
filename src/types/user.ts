export interface ServiceError {
    message: string;
    details?: unknown;
  }
  
 export interface UpdateProfileData {
    first_name?: string;
    last_name?: string;
    gender?: string;
  }
  
 export interface UpdatePasswordData {
    password: string;
  }