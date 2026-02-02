// This is a placeholder i18nProvider.
// You might want to replace this with a more robust internationalization solution.
export const i18nProvider = {
  translate: (key: string, options?: any) => {
    // For now, just return the key.
    // In a real application, you would look up the translation for the key.
    return key;
  },
  changeLocale: (locale: string) => Promise.resolve(),
  getLocale: () => "en",
};
