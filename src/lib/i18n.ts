import type { CollectionEntry } from 'astro:content';

export type SiteLang = 'zh-cn' | 'zh-tw' | 'en';
export type CollectionKey = 'stages' | 'tracks' | 'branches' | 'resources' | 'walkthroughs';

export const DEFAULT_LANG: SiteLang = 'zh-cn';

export const LANG_CONFIG: Record<SiteLang, { label: string; prefix: string; htmlLang: string; navLabel: string }> = {
  'zh-cn': { label: '简体中文', prefix: '', htmlLang: 'zh-CN', navLabel: '简中' },
  'zh-tw': { label: '繁體中文', prefix: '/zh-tw', htmlLang: 'zh-TW', navLabel: '繁中' },
  en: { label: 'English', prefix: '/en', htmlLang: 'en', navLabel: 'EN' }
};

export const getLangPrefix = (lang: SiteLang) => LANG_CONFIG[lang].prefix;

export const buildLangPath = (lang: SiteLang, path = '/') => {
  const normalized = path === '/' ? '/' : path.startsWith('/') ? path : `/${path}`;
  const prefix = getLangPrefix(lang);
  return prefix ? `${prefix}${normalized === '/' ? '' : normalized}` : normalized;
};

export const removeLangPrefix = (pathname: string) => {
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    return { lang: 'en' as SiteLang, path: pathname.replace(/^\/en/, '') || '/' };
  }
  if (pathname === '/zh-tw' || pathname.startsWith('/zh-tw/')) {
    return { lang: 'zh-tw' as SiteLang, path: pathname.replace(/^\/zh-tw/, '') || '/' };
  }
  return { lang: 'zh-cn' as SiteLang, path: pathname || '/' };
};

export const collectionLabelMap: Record<CollectionKey, string> = {
  stages: 'Stages',
  tracks: 'Tracks',
  branches: 'Branches',
  resources: 'Resources',
  walkthroughs: 'Walkthroughs'
};

export function getCollectionLabel(collection: CollectionKey, lang: SiteLang) {
  const labels = {
    'zh-cn': {
      stages: 'Stages',
      tracks: 'Tracks',
      branches: 'Branches',
      resources: 'Resources',
      walkthroughs: 'Walkthroughs'
    },
    'zh-tw': {
      stages: 'Stages',
      tracks: 'Tracks',
      branches: 'Branches',
      resources: 'Resources',
      walkthroughs: 'Walkthroughs'
    },
    en: collectionLabelMap
  } satisfies Record<SiteLang, Record<CollectionKey, string>>;

  return labels[lang][collection];
}

export function buildEntryRoute(collection: CollectionKey, entry: { data: { baseSlug: string; language: SiteLang } }) {
  return buildCollectionRoute(collection, entry.data.baseSlug, entry.data.language);
}

export function buildCollectionRoute(collection: CollectionKey, baseSlug: string, lang: SiteLang) {
  return buildLangPath(lang, `/${collection}/${baseSlug}/`);
}

export type AnyCollectionEntry = CollectionEntry<CollectionKey>;

export function filterEntriesByLang<T extends AnyCollectionEntry>(entries: T[], lang: SiteLang) {
  return entries
    .filter((entry) => entry.data.language === lang)
    .sort((a, b) => {
      const orderDiff = (a.data.order ?? 999) - (b.data.order ?? 999);
      if (orderDiff !== 0) return orderDiff;
      return a.data.title.localeCompare(b.data.title);
    });
}

export function createLanguageLinks<T extends AnyCollectionEntry>(collection: CollectionKey, entries: T[], baseSlug: string) {
  const related = entries.filter((entry) => entry.data.baseSlug === baseSlug);
  return (Object.keys(LANG_CONFIG) as SiteLang[])
    .map((lang) => {
      const match = related.find((entry) => entry.data.language === lang);
      if (!match) return null;
      return {
        lang,
        label: LANG_CONFIG[lang].label,
        href: buildEntryRoute(collection, match)
      };
    })
    .filter(Boolean) as Array<{ lang: SiteLang; label: string; href: string }>;
}

export function createSectionLanguageLinks(path: string) {
  return (Object.keys(LANG_CONFIG) as SiteLang[]).map((lang) => ({
    lang,
    label: LANG_CONFIG[lang].label,
    href: buildLangPath(lang, path)
  }));
}
