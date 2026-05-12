import { getCollection, type CollectionEntry } from 'astro:content';
import type { CollectionKey, SiteLang } from './i18n';
import { buildEntryRoute, createLanguageLinks, filterEntriesByLang } from './i18n';

function stripMarkdown(input?: string) {
  if (!input) return undefined;
  return input
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function summarize(input?: string, maxLength = 88) {
  const cleaned = stripMarkdown(input);
  if (!cleaned) return undefined;
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trimEnd()}…`;
}

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
      description: summarize(entry.data.description) ?? `Stage ${entry.data.order ?? '-'} 的核心学习内容与建议路径。`,
      meta: `Stage ${entry.data.order ?? '-'} · ${entry.data.section}`
    })),
    trackSteps: tracks.slice(0, 3).map((entry) => ({
      title: entry.data.title,
      href: buildEntryRoute('tracks', entry),
      subtitle: summarize(entry.data.description, 72)
    })),
    branchSteps: branches.slice(0, 5).map((entry) => ({
      title: entry.data.title,
      href: buildEntryRoute('branches', entry),
      subtitle: summarize(entry.data.description, 72)
    }))
  };
}

export async function getEntryForLang(collection: CollectionKey, lang: SiteLang, baseSlug: string) {
  const entries = await getCollection(collection);
  const typedEntries = entries as CollectionEntry<CollectionKey>[];
  const filtered = filterEntriesByLang(typedEntries, lang);
  const match = filtered.find((entry) => entry.data.baseSlug === baseSlug);
  if (!match) return null;
  const currentIndex = filtered.findIndex((entry) => entry.data.baseSlug === baseSlug);
  const previousEntry = currentIndex > 0 ? filtered[currentIndex - 1] : null;
  const nextEntry = currentIndex >= 0 && currentIndex < filtered.length - 1 ? filtered[currentIndex + 1] : null;

  return {
    entry: match,
    entries: typedEntries,
    collectionEntries: filtered,
    previousEntry,
    nextEntry,
    cleanedDescription: stripMarkdown(match.data.description),
    summary: summarize(match.data.description),
    languageLinks: createLanguageLinks(collection, typedEntries, baseSlug)
  };
}

export { stripMarkdown, summarize };
