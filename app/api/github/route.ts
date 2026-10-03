import { contributionsUrl, parseContributions } from "@/lib/github";
import { parseGitHubCalendar } from "@/lib/github-calendar";
import savedActivity from "@/data/github-contributions.json";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  try {
    const response = await fetch(contributionsUrl, {
      cache: "no-store",
      headers: { Accept: "text/html", "Accept-Language": "en-US" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Activity unavailable");
    const contributions = parseGitHubCalendar(await response.text());
    return Response.json({ contributions }, { headers });
  } catch {
    return Response.json({ contributions: parseContributions(savedActivity) }, {
      headers: { ...headers, "X-Activity-Fallback": "true" },
    });
  }
}
