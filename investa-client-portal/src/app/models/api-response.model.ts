/**
 * Generic API response wrapper used by backend
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
/**
 * Standard error/failed response returned by backend when `success` is false
 */
export interface ApiErrorResponse {
  success: boolean; // typically false
  message?: string;
  code?: number | string;
  errors?: Record<string, any> | any[];
  data?: any;
}

/**
 * Team member DTO from backend.
 * Team members must be registered users (Founder or Both ClientType).
 * User profile data (name, avatar, bio, LinkedIn) is retrieved from the linked User/UserProfile.
 */
export interface TeamMemberDto {
  id: number;
  userId: string;  // Required - team members must be registered Founder/Partner users
  name: string;
  role: string;
  avatar?: string;
  linkedIn?: string;
  bio?: string;
  clientType?: string;  // The user's client type (Founder, Both)
}
