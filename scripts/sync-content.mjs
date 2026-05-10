import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const PROJECT_ROOT = process.cwd();
const CONTENT_ROOT = path.join(PROJECT_ROOT, 'src', 'content');
const DATA_ROOT = path.join(PROJECT_ROOT, 'src', 'data');
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'public');
const DEFAULT_REPO_URL = process.env.REPO_URL || 'https://github.com/WenyuChiou/awesome-agentic-ai-zh.git';
const REPO_REF = process.env.REPO_REF || 'main';
const REPO_WEB_URL = DEFAULT_REPO_URL.replace(/\.git$/, '');
const DEFAULT_LANG = 'zh-cn';
const LANG_META = {
  'zh-cn': { label: '简体中文', suffix: '.zh-CN.md', routePrefix: '' },
  'zh-tw': { label: '繁體中文', suffix: '.md', routePrefix: '/zh-tw' },
  en: { label: 'English', suffix: '.en.md', routePrefix: '/en' }
};
const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'awesome-agentic-ai-site-'));
const repoDir = path.join(tempDir, 'repo');

const sections = [
  { key: 'stages', label: 'Stage', dir: 'stages' },
  { key: 'tracks', label: 'Track', dir: 'tracks' },
  { key: 'branches', label: 'Branch', dir: 'branches' },
  { key: 'resources', label: 'Resource', dir: 'resources' },
  { key: 'walkthroughs', label: 'Walkthrough', dir: 'walkthroughs' }
];

const copyDir = async (from, to) => {
  await fs.mkdir(to, { recursive: true });
  const entries = await fs.readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) await copyDir(src, dest);
    else await fs.copyFile(src, dest);
  }
};

const emptyDir = async (target) => {
  await fs.rm(target, { recursive: true, force: true });
  await fs.mkdir(target, { recursive: true });
};

const slugify = (value) => value.toLowerCase().replace(/\.md$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const parseLanguage = (filePath) => {
  if (filePath.endsWith('.zh-CN.md')) return { language: 'zh-cn', extension: '.zh-CN.md' };
  if (filePath.endsWith('.en.md')) return { language: 'en', extension: '.en.md' };
  return { language: 'zh-tw', extension: '.md' };
};

const getBaseSlugFromRelativePath = (relativePath) => {
  const { extension } = parseLanguage(relativePath);
  return slugify(relativePath.slice(0, -extension.length));
};

const buildLangPath = (language, pathName) => {
  const prefix = LANG_META[language].routePrefix;
  const normalized = pathName === '/' ? '/' : pathName.startsWith('/') ? pathName : `/${pathName}`;
  return prefix ? `${prefix}${normalized === '/' ? '' : normalized}` : normalized;
};

const firstHeading = (content) => {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
};

const firstParagraph = (content) => {
  const lines = content.split(/\r?\n/).map((line) => line.trim());
  const paragraphs = [];
  let bucket = [];
  for (const line of lines) {
    if (!line) {
      if (bucket.length) {
        paragraphs.push(bucket.join(' '));
        bucket = [];
      }
      continue;
    }
    if (/^(#|>|```|!\[|\[!|\-|\*\s|\d+\.)/.test(line)) continue;
    bucket.push(line);
    if (bucket.join(' ').length > 40) {
      paragraphs.push(bucket.join(' '));
      break;
    }
  }
  return paragraphs[0]?.slice(0, 180);
};

const computeOrder = (relativePath) => {
  const match = relativePath.match(/(?:^|\/)(\d{2})[-_]/);
  if (match) return Number(match[1]);
  const alpha = relativePath.match(/(?:^|\/)([Aa]\d+|stage\s*\d+)/i);
  if (alpha) return Number(alpha[1].replace(/[^\d]/g, '')) || undefined;
  return undefined;
};

const rewriteLinks = (content, currentRelativeDir, language) => {
  return content
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt, rawTarget) => {
      if (/^(https?:|data:|#)/.test(rawTarget)) return full;
      const normalized = path.posix.normalize(path.posix.join(currentRelativeDir, rawTarget));
      return `![${alt}](/upstream/${normalized})`;
    })
    .replace(/\[([^\]]+)\]\(([^)]+\.md(?:#[^)]+)?)\)/g, (full, text, rawTarget) => {
      if (/^https?:/i.test(rawTarget)) return full;
      const [targetPath, hash = ''] = rawTarget.split('#');
      const normalized = path.posix.normalize(path.posix.join(currentRelativeDir, targetPath));
      const route = resolveMarkdownRoute(normalized, language);
      if (!route) return full;
      return `[${text}](${route}${hash ? `#${hash}` : ''})`;
    });
};

const resolveMarkdownRoute = (normalized, currentLanguage) => {
  const clean = normalized.replace(/^\.\//, '').replace(/^\//, '');
  if (clean === 'README.md' || clean === 'README.zh-CN.md' || clean === 'README.en.md') {
    return buildLangPath(currentLanguage, '/');
  }
  const parts = clean.split('/');
  const collection = parts[0];
  if (!['stages', 'branches', 'walkthroughs', 'resources', 'tracks'].includes(collection)) return null;
  const { language } = parseLanguage(clean);
  const baseSlug = getBaseSlugFromRelativePath(parts.slice(1).join('/'));
  return buildLangPath(language, `/${collection}/${baseSlug}/`);
};

try {
  console.log(`Cloning ${DEFAULT_REPO_URL}#${REPO_REF} ...`);
  await execFileAsync('git', ['clone', '--depth', '1', '--branch', REPO_REF, DEFAULT_REPO_URL, repoDir], { cwd: tempDir });
  const { stdout: commitStdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: repoDir });
  const repoCommit = commitStdout.trim();
  const syncedAt = new Date().toISOString();

  for (const section of sections) {
    await emptyDir(path.join(CONTENT_ROOT, section.key));
  }
  await fs.mkdir(DATA_ROOT, { recursive: true });
  await fs.mkdir(path.join(PUBLIC_ROOT, 'upstream'), { recursive: true });

  const counts = {};

  for (const section of sections) {
    const sourceDir = path.join(repoDir, section.dir);
    const targetDir = path.join(CONTENT_ROOT, section.key);
    counts[section.key] = 0;
    if (!existsSync(sourceDir)) continue;

    const walk = async (dir, relativePrefix = '') => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const sourcePath = path.join(dir, entry.name);
        const relativePath = path.posix.join(relativePrefix, entry.name);
        if (entry.isDirectory()) {
          await walk(sourcePath, relativePath);
          continue;
        }
        if (!entry.name.endsWith('.md')) continue;

        const raw = await fs.readFile(sourcePath, 'utf8');
        const { language } = parseLanguage(relativePath);
        const title = firstHeading(raw) || entry.name.replace(/\.md$/i, '');
        const description = firstParagraph(raw) || `${section.label} 内容页面`;
        const slug = slugify(relativePath);
        const baseSlug = getBaseSlugFromRelativePath(relativePath);
        const currentRelativeDir = path.posix.dirname(path.posix.join(section.dir, relativePath));
        const rewritten = rewriteLinks(raw, currentRelativeDir, language);
        const frontmatter = [
          '---',
          `title: ${JSON.stringify(title)}`,
          `description: ${JSON.stringify(description)}`,
          `section: ${JSON.stringify(section.label)}`,
          `sourcePath: ${JSON.stringify(path.posix.join(section.dir, relativePath))}`,
          `sourceUrl: ${JSON.stringify(`${REPO_WEB_URL}/blob/${REPO_REF}/${path.posix.join(section.dir, relativePath)}`)}`,
          `sourceRepo: ${JSON.stringify(REPO_WEB_URL)}`,
          `syncedAt: ${JSON.stringify(syncedAt)}`,
          `language: ${JSON.stringify(language)}`,
          `languageLabel: ${JSON.stringify(LANG_META[language].label)}`,
          `baseSlug: ${JSON.stringify(baseSlug)}`,
          computeOrder(relativePath) !== undefined ? `order: ${computeOrder(relativePath)}` : null,
          '---',
          ''
        ].filter(Boolean).join('\n');
        await fs.writeFile(path.join(targetDir, `${slug}.md`), `${frontmatter}${rewritten}`);
        counts[section.key] += 1;
      }
    };

    await walk(sourceDir);
  }

  const resourcesDir = path.join(repoDir, 'resources');
  if (existsSync(resourcesDir)) {
    await fs.rm(path.join(PUBLIC_ROOT, 'upstream', 'resources'), { recursive: true, force: true });
    await copyDir(resourcesDir, path.join(PUBLIC_ROOT, 'upstream', 'resources'));
  }

  const manifest = {
    repoUrl: REPO_WEB_URL,
    repoRef: REPO_REF,
    repoCommit,
    syncedAt,
    defaultLanguage: DEFAULT_LANG,
    counts
  };

  await fs.writeFile(path.join(DATA_ROOT, 'sync-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Sync complete:', manifest);
} finally {
  await fs.rm(tempDir, { recursive: true, force: true });
}
