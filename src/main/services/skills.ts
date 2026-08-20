import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { unzipSync } from 'fflate';

export const SKILLS_ROOT =
  process.env.FILE_BROWSER_SKILLS_DIR?.trim() ||
  path.join(os.homedir(), '.file-browser-agent', 'skills');

type SkillFrontmatter = {
  name?: string;
  description?: string;
};

function parseFrontmatter(markdown: string): SkillFrontmatter {
  const frontmatterMatch = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatterMatch) return {};
  
  const frontmatter = frontmatterMatch[1];
  const result: SkillFrontmatter = {};
  for (const line of frontmatter.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separatorIndex = trimmed.indexOf(':');
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key === 'name') result.name = value;
    if (key === 'description') result.description = value;
  }
  return result;
}

function isValidSkillName(name: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(name);
}

export type InstalledSkill = { name: string; description: string; path: string };

export async function installSkillFromZip(zipPath: string): Promise<InstalledSkill> {
  const buf = await fs.readFile(zipPath);
  let files: Record<string, Uint8Array> = unzipSync(new Uint8Array(buf));
  
  const norm = (p: string): string => p.replace(/\\/g, '/');
  let skillMdKey: string | null = null;
  for (const key of Object.keys(files)) {
    const n = norm(key);
    if (key.endsWith('/') || !n.endsWith('/SKILL.md') && n !== 'SKILL.md') continue;
    if (skillMdKey === null || n.split('/').length < norm(skillMdKey).split('/').length) {
      skillMdKey = key;
    }
  }

  if (!skillMdKey) throw new Error('The zip does not contain a SKILL.md file.');
  
  const skillMd = norm(skillMdKey);
  const prefix = skillMd.slice(0, skillMd.length - 'SKILL.md'.length);
  const markdown = new TextDecoder('utf-8').decode(files[skillMdKey]);
  const fallbackName = prefix.replace(/\/$/, '').split('/').pop() || '';
  const name = (parseFrontmatter(markdown).name?.trim() || fallbackName).trim();

  const targetDir = path.join(SKILLS_ROOT, name);
  await fs.mkdir(SKILLS_ROOT, { recursive: true });

  for (const [key, data] of Object.entries(files)) {
    if (key.endsWith('/')) continue;
    const n = norm(key);
    if (prefix && !n.startsWith(prefix)) continue;
    const dest = path.join(targetDir, n.slice(prefix.length));
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, data);
  }

  return { name, description: parseFrontmatter(markdown).description?.trim() || '', path: targetDir };
}

export type LoadedSkill = { name: string; description: string; body: string; path: string };

async function loadSkills(): Promise<LoadedSkill[]> {
  const skills: LoadedSkill[] = [];
  try {
    await fs.access(SKILLS_ROOT);
    const items = await fs.readdir(SKILLS_ROOT, { withFileTypes: true });
    for (const item of items) {
      if (item.isDirectory()) {
        const skillFolderPath = path.join(SKILLS_ROOT, item.name);
        const skillMdPath = path.join(skillFolderPath, 'SKILL.md');
        try {
          const rawContent = await fs.readFile(skillMdPath, 'utf-8');
          const content = rawContent.replace(/\r/g, '').trim();
          const frontmatter = parseFrontmatter(content);
          skills.push({
            name: frontmatter.name?.trim() || item.name,
            description: frontmatter.description?.trim() || `Expert skills for ${item.name}`,
            body: content,
            path: skillFolderPath
          });
        } catch {}
      }
    }
  } catch {}
  return skills;
}

export const SkillsStore = {
  items: [] as LoadedSkill[],
  async reload(): Promise<void> {
    this.items = await loadSkills();
  },
  listAvailable() {
    return this.items.map(s => ({ name: s.name, description: s.description }));
  },
  find(predicate: (s: LoadedSkill) => boolean) {
    return this.items.find(predicate);
  }
};