/**
 * Complete list of admin emails
 */
export const ADMIN_EMAILS = [
  'sammichael@karunya.edu.in',
  'hod_dove@karunya.edu'
  // Add more admin emails here if needed
];

/**
 * Check if user is admin (PRIMARY FUNCTION - use this everywhere)
 * Uses case-insensitive comparison
 */
export const isAdmin = (email: string | null | undefined): boolean => {
  if (!email) return false;
  
  const lowerEmail = email.toLowerCase();
  return ADMIN_EMAILS.some(adminEmail => 
    lowerEmail === adminEmail.toLowerCase()
  );
};

/**
 * Legacy function (for backward compatibility)
 * Kept for any existing code using it
 */
export const isAdminFromList = (email: string | null | undefined): boolean => {
  return isAdmin(email); // Delegates to main function
};
