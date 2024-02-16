import sha256 from 'crypto-js/sha256';

/**
 * The function `getProfilePhotoUrl` takes an email as input, trims and hashes it, and returns a URL
 * for a Gravatar profile photo.
 * @param {string} email - The `email` parameter is a string that represents the email address of a
 * user.
 * @returns a URL string that represents the profile photo URL for a given email address.
 */
export const getProfilePhotoUrl = (email: string) => {
  if (!email) return null;
  const trimmedEmail = email?.trim();

  if (!trimmedEmail) return null;

  const hash = sha256(trimmedEmail)?.toString();
  return `https://gravatar.com/avatar/${hash}`;
};
