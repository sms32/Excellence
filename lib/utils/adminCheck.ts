/**
 * Check if user is admin based on email
 */
export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  return email.toLowerCase() === adminEmail?.toLowerCase();
};

/**
 * Admin emails array (if you want multiple admins in future)
 */
export const ADMIN_EMAILS = [
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || '',
  // Add more admin emails here if needed
].filter(Boolean);

export const isAdminFromList = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
