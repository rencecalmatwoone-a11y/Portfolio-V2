import { parseContributions, type ContributionDay } from "@/lib/github";

function attribute(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`))?.[2];
}

// GitHub supplies each day's count in the tooltip associated with its calendar cell.
export function parseGitHubCalendar(html: string): ContributionDay[] {
  const counts = new Map<string, number>();
  for (const tooltip of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = attribute(tooltip[1], "for");
    const count = tooltip[2].trim().match(/^(No|\d[\d,]*) contributions?\b/);
    if (id && count) counts.set(id, count[1] === "No" ? 0 : Number(count[1].replaceAll(",", "")));
  }

  const contributions: ContributionDay[] = [];
  for (const cell of html.matchAll(/<td\b[^>]*>/g)) {
    const date = attribute(cell[0], "data-date");
    if (!date) continue;
    const id = attribute(cell[0], "id");
    const level = attribute(cell[0], "data-level");
    const count = id ? counts.get(id) : undefined;
    if (count === undefined || !level || !/^[0-4]$/.test(level)) throw new Error("Invalid GitHub calendar cell");
    contributions.push({ date, count, level: Number(level) });
  }

  if (contributions.length < 365) throw new Error("Incomplete GitHub calendar");
  return parseContributions({ contributions });
}
