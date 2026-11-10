export function publicAuthError(message: string) {
  const lower = message.toLowerCase();
  if (
    lower.includes("pwned") ||
    lower.includes("leaked password") ||
    lower.includes("haveibeenpwned") ||
    lower.includes("compromised password") ||
    lower.includes("password is known to be") ||
    lower.includes("weak password")
  ) {
    return "That password has appeared in a public leak. Choose a different one with at least 8 characters.";
  }
  return message;
}
