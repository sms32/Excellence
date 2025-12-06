export const isKarunyaEmail = (email: string): boolean => {
  const allowedDomains = ['@karunya.edu', '@karunya.edu.in'];
  return allowedDomains.some(domain => email.toLowerCase().endsWith(domain));
};
