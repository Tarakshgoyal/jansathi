import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:8000';

// Token management
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

export const getAccessToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
};

export const setTokens = async (accessToken: string, refreshToken: string) => {
  await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
  await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(TOKEN_KEYS.USER_DATA);
};

export const getUserData = async () => {
  const data = await SecureStore.getItemAsync(TOKEN_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
};

export const setUserData = async (userData: any) => {
  await SecureStore.setItemAsync(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
};

// API Types
export interface User {
  id: number;
  name: string;
  mobile_number: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  mobile_number: string;
}

export interface SignupRequest {
  name: string;
  mobile_number: string;
}

export interface VerifyOTPRequest {
  mobile_number: string;
  otp_code: string;
}

export interface OTPResponse {
  message: string;
  mobile_number: string;
  expires_in_minutes: number;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Issue {
  id: number;
  issue_type: string;
  description: string;
  latitude: number;
  longitude: number;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  photos: IssuePhoto[];
}

export interface IssuePhoto {
  id: number;
  issue_id: number;
  photo_url: string;
  filename: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

export interface IssueListResponse {
  items: Issue[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// API Service
class ApiService {
  private baseURL = API_BASE_URL;

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await getAccessToken();
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async handleResponse(response: Response) {
    if (response.status === 401) {
      // Token expired, try to refresh
      const refreshed = await this.refreshToken();
      if (!refreshed) {
        await clearTokens();
        throw new Error('Session expired. Please login again.');
      }
      throw new Error('RETRY_REQUEST');
    }

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const error = await response.json();
        console.error('API Error Response:', JSON.stringify(error, null, 2));
        
        // Handle different error response formats
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.detail) {
          // FastAPI validation error or standard error
          if (typeof error.detail === 'string') {
            errorMessage = error.detail;
          } else if (Array.isArray(error.detail)) {
            // Validation errors array - include field names
            errorMessage = error.detail.map((e: any) => {
              const field = e.loc ? e.loc.join('.') : 'unknown';
              const msg = e.msg || 'validation error';
              return `${field}: ${msg}`;
            }).join(', ');
          } else {
            errorMessage = JSON.stringify(error.detail);
          }
        } else if (error.message) {
          errorMessage = error.message;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } catch (e) {
        errorMessage = `Request failed with status ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth APIs
  async signup(data: SignupRequest): Promise<OTPResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async login(data: LoginRequest): Promise<OTPResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<TokenResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await this.handleResponse(response);
    
    // Store tokens and user data
    await setTokens(result.access_token, result.refresh_token);
    await setUserData(result.user);
    
    return result;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) return false;

      const result = await response.json();
      await setTokens(result.access_token, result.refresh_token);
      await setUserData(result.user);
      
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentUser(): Promise<User> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/api/auth/me`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async resendOTP(mobile_number: string): Promise<OTPResponse> {
    const response = await fetch(`${this.baseURL}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile_number }),
    });
    return this.handleResponse(response);
  }

  // Issue APIs
  async createIssue(data: {
    issue_type: string;
    description: string;
    latitude: number;
    longitude: number;
    photos?: { uri: string; name: string; type: string }[];
  }): Promise<Issue> {
    const token = await getAccessToken();
    
    console.log('Creating issue with data:', {
      issue_type: data.issue_type,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      photos_count: data.photos?.length || 0,
      has_token: !!token,
      api_url: `${this.baseURL}/api/reports`,
    });

    // Create FormData for multipart request
    const formData = new FormData();
    formData.append('issue_type', data.issue_type);
    formData.append('description', data.description);
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());

    // Add photos if provided (React Native format)
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((photo, index) => {
        // React Native requires specific format for file upload
        const file: any = {
          uri: photo.uri,
          name: photo.name,
          type: photo.type,
        };
        formData.append('photos', file);
        console.log(`Added photo ${index + 1}:`, { name: photo.name, type: photo.type });
      });
    }

    try {
      const response = await fetch(`${this.baseURL}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          // Don't set Content-Type for FormData - it will be set automatically with boundary
        },
        body: formData,
      });

      console.log('Create issue response status:', response.status);
      
      if (!response.ok) {
        const responseText = await response.text();
        console.error('Create issue error response:', responseText);
        
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const error = JSON.parse(responseText);
          if (error.detail) {
            if (typeof error.detail === 'string') {
              errorMessage = error.detail;
            } else if (Array.isArray(error.detail)) {
              errorMessage = error.detail.map((e: any) => 
                `${e.loc ? e.loc.join('.') + ': ' : ''}${e.msg || JSON.stringify(e)}`
              ).join(', ');
            } else {
              errorMessage = JSON.stringify(error.detail);
            }
          } else {
            errorMessage = JSON.stringify(error);
          }
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Issue created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('Create issue error:', error);
      throw error;
    }
  }

  async getMyIssues(params?: {
    page?: number;
    page_size?: number;
    issue_type?: string;
    status?: string;
  }): Promise<IssueListResponse> {
    const headers = await this.getAuthHeaders();
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.issue_type) queryParams.append('issue_type', params.issue_type);
    if (params?.status) queryParams.append('status', params.status);

    const response = await fetch(
      `${this.baseURL}/api/reports?${queryParams.toString()}`,
      {
        method: 'GET',
        headers,
      }
    );
    return this.handleResponse(response);
  }

  async getIssue(issueId: number): Promise<Issue> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${this.baseURL}/api/reports/${issueId}`, {
      method: 'GET',
      headers,
    });
    return this.handleResponse(response);
  }

  async getMapIssues(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    issue_type?: string;
    status?: string;
  }): Promise<Issue[]> {
    const headers = await this.getAuthHeaders();
    
    const radius = params.radius ?? 50; // Default 50km radius
    
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', params.latitude.toString());
    queryParams.append('longitude', params.longitude.toString());
    queryParams.append('radius', radius.toString());
    if (params.issue_type) queryParams.append('issue_type', params.issue_type);
    if (params.status) queryParams.append('status', params.status);
    
    const response = await fetch(
      `${this.baseURL}/api/reports/map?${queryParams.toString()}`,
      {
        method: 'GET',
        headers,
      }
    );
    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
