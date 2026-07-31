export function getNativeLanguageName(languageCode: string, fallbackName: string): string {
  const normalizedCode = languageCode.trim();
  const languageSubtag = normalizedCode.split('-')[0];

  if (!normalizedCode || !languageSubtag || typeof Intl.DisplayNames !== 'function') {
    return fallbackName;
  }

  try {
    const nativeName = new Intl.DisplayNames([normalizedCode], { type: 'language' }).of(languageSubtag);
    return nativeName && nativeName !== languageSubtag ? nativeName : fallbackName;
  } catch {
    return fallbackName;
  }
}
