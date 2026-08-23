import { apiClient } from './client';

/**
 * POST /api/v1/auth/register - endpoint នេះមិនទាន់មាននៅ backend ទេ
 * (មិនមានក្នុង /v3/api-docs បច្ចុប្បន្ន)។ Backend ត្រូវអនុវត្តវាដោយប្រើ
 * Keycloak Admin REST API ជាមួយ service account (កុំបង្កើត user
 * ដោយផ្ទាល់ពី frontend ព្រោះនោះត្រូវការ admin credential ដែលមិន
 * ត្រូវលាតត្រដាងក្នុង browser)។
 *
 * ទម្រង់ស្នើសុំតាមគំរូ UpdateProfileRequest/UserResponse ដែលមានស្រាប់
 * (username, email, displayName, phoneNumber) បូក password ថ្មី។
 * ចម្លើយរំពឹងថាដូច ApiResponse<UserResponse> ដូច endpoint ចាស់ៗផ្សេងទៀត
 * (users/me, orders) - ប្រសិនបើ backend ត្រឡប់ DTO ដោយផ្ទាល់ក៏ដំណើរការដែរ។
 */
export const authApi = {
  register: async ({ username, email, password, displayName, phoneNumber }) => {
    const res = await apiClient.post('/api/v1/auth/register', {
      username,
      email,
      password,
      displayName,
      phoneNumber,
    });
    return res.data?.data ?? res.data;
  },
};
