import { api } from '@/api/api';

/**
 * Fetches the user profile for the currently authenticated user.
 * @returns The user profile data including basic info, contact info, and audit usage.
 */
export async function getUserProfile() {
  const res = await api.get<{
    id: string
    basicInfo: {
      firstName: string
      lastName: string
      avatarUrl: string
    }
    contactInfo: {
      email: string
      phone1: string
    }
    auditUsage: {
      lastLoginIP: string
      registrationIP: string
    }
  }>(`/api/admin/users/myprofile`)

  if (!res) {
    throw new Error('Failed to fetch user profile')
  }

  return {
    id: res.id,
    firstName: res.basicInfo.firstName,
    lastName: res.basicInfo.lastName,
    avatarUrl: res.basicInfo.avatarUrl,
    email: res.contactInfo.email,
    phone: res.contactInfo.phone1,
    lastLoginIP: res.auditUsage.lastLoginIP,
    registrationIP: res.auditUsage.registrationIP,
  }
}

export default { getUserProfile }
