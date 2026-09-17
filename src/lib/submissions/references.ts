const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createPublicReference(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return `USTSH-${Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')}`;
}

