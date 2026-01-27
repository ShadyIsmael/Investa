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

  // Defensive parsing - backend sometimes returns different shapes or nested wrappers
  const anyRes: any = res as any;
  const basic = anyRes.basicInfo ?? anyRes.basicinfo ?? {};
  const contact = anyRes.contactInfo ?? anyRes.contactinfo ?? {};
  const audit = anyRes.auditUsage ?? anyRes.auditusage ?? {};

  return {
    id: anyRes.id ?? anyRes.userId ?? anyRes.user_id ?? null,
    firstName: basic.firstName ?? basic.first_name ?? basic.firstName ?? '',
    lastName: basic.lastName ?? basic.last_name ?? '',
    avatarUrl: basic.avatarUrl ?? basic.avatar_url ?? basic.avatar ?? '',
    email: contact.email ?? contact.emailAddress ?? '',
    phone: contact.phone1 ?? contact.phone ?? '',
    lastLoginIP: audit.lastLoginIP ?? audit.last_login_ip ?? '',
    registrationIP: audit.registrationIP ?? audit.registration_ip ?? '',
  }
}

export default { getUserProfile }
