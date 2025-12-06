/**
 * Check if user is admin based on email
 */
export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  
  const adminEmail = 'sammichael@karunya.edu.in';
  return email.toLowerCase() === adminEmail?.toLowerCase();
};

/**
 * Admin emails array (if you want multiple admins in future)
 */
export const ADMIN_EMAILS = [
  'sammichael@karunya.edu.in',
  'hod_dove@karunya.edu'
  // Add more admin emails here if needed
].filter(Boolean);

export const isAdminFromList = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
