import { getCollection, type CollectionEntry } from 'astro:content';
import type { CollectionKey, SiteLang } from './i18n';
import { buildEntryRoute, createLanguageLinks, filterEntriesByLang } from './i18n';

export async function getCollectionByLang(collection: CollectionKey, lang: SiteLang) {
  const entries = await getCollection(collection);
  return filterEntriesByLang(entries as CollectionEntry<CollectionKey>[], lang);
}

export async function getHomeData(lang: SiteLang) {
  const [stages, tracks, branches] = await Promise.all([
    getCollectionByLang('stages', lang),
    getCollectionByLang('tracks', lang),
    getCollectionByLang('branches', lang)
  ]);

  return {
    stages,
    tracks,
    branches,
    featuredStages: stages.slice(0, 6).map((entry) => ({
      title: entry.data.title,
      href: buildEntryRoute('stages', entry),
      description: entry.data.description,
      meta: `Stage ${entry.data.order ?? '-'} · ${entry.data.section}`
    })),
    trackSteps: tracks.slice(0, 3).map((entry) => ({
      title: entry.data.title,
      href: buildEntryRoute('tracks', entry),
      subtitle: entry.data.description
    })),
    branchSteps: branches.slice(0, 5).map((entry) => ({
      title: entry.data.title,
      href: buildEntryRoute('branches', entry),
      subtitle: entry.data.description
    }))
  };
}

export async function getEntryForLang(collection: CollectionKey, lang: SiteLang, baseSlug: string) {
  const entries = await getCollection(collection);
  const match = entries.find((entry) => entry.data.baseSlug === baseSlug && entry.data.language === lang);
  if (!match) return null;
  return {
    entry: match,
    entries,
    languageLinks: createLanguageLinks(collection, entries as CollectionEntry<CollectionKey>[], baseSlug)
  };
}
