import { api } from '@/api/api';

/**
 * Fetches the user profile for the currently authenticated user.
 * @returns The user profile data including basic info, contact info, and audit usage.
 */
export async function getUserProfile() {
  const res = await api.get<any>(`/api/profile/me`);

  if (!res) {
    throw new Error('Failed to fetch user profile');
  }

  const anyRes: any = res as any;
  const basic = anyRes.basicInfo ?? anyRes.basicinfo ?? anyRes.BasicInfo ?? {};
  const contact = anyRes.contactInfo ?? anyRes.contactinfo ?? anyRes.ContactInfo ?? {};
  const identity = anyRes.identityCompliance ?? anyRes.identity_compliance ?? anyRes.IdentityCompliance ?? {};
  const audit = anyRes.auditUsage ?? anyRes.auditusage ?? anyRes.AuditUsage ?? {};

  const dateOfBirth = basic.dateOfBirth ?? basic.birthDate ?? basic.birth_date ?? basic.DateOfBirth ?? null;
  const documentImage = identity.documentFrontImageUrl ?? identity.document_front_image_url ?? identity.DocumentFrontImageUrl ?? identity.DocumentFrontImage ?? '';

  return {
    id: anyRes.id ?? anyRes.userId ?? anyRes.user_id ?? null,
    firstName: basic.firstName ?? basic.first_name ?? basic.FirstName ?? '',
    lastName: basic.lastName ?? basic.last_name ?? basic.LastName ?? '',
    avatarUrl: basic.avatarUrl ?? basic.avatar_url ?? basic.avatar ?? basic.AvatarUrl ?? '',
    gender: basic.gender ?? basic.Gender ?? '',
    nationality: basic.nationality ?? basic.Nationality ?? '',
    country: basic.country ?? basic.Country ?? '',
    dateOfBirth: typeof dateOfBirth === 'string' ? dateOfBirth : dateOfBirth ? dateOfBirth.toString() : '',
    email: contact.email ?? contact.emailAddress ?? contact.Email ?? '',
    phone: contact.phone1 ?? contact.phone ?? contact.Phone1 ?? contact.Phone ?? '',
    documentNumber: identity.documentNumber ?? identity.document_number ?? identity.DocumentNumber ?? identity.NationalId ?? '',
    documentImageUrl: documentImage ?? '',
    kycCompletionPercentage: basic.kycCompletionPercentage ?? basic.KycCompletionPercentage ?? 0,
    isKycVerified: basic.isKycVerified ?? basic.IsKycVerified ?? false,
    lastLoginIP: audit.lastLoginIP ?? audit.last_login_ip ?? audit.LastLoginIP ?? '',
    registrationIP: audit.registrationIP ?? audit.registration_ip ?? audit.RegistrationIP ?? '',
  };
}

export default { getUserProfile };
