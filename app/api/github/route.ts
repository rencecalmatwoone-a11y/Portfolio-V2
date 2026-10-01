import { contributionsUrl, parseContributions } from "@/lib/github";
import savedActivity from "@/data/github-contributions.json";

export async function GET() {
  try {
    const response = await fetch(contributionsUrl, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Activity unavailable");
    const contributions = parseContributions(await response.json());
    return Response.json({ contributions });
  } catch {
    return Response.json({ contributions: parseContributions(savedActivity) }, {
      headers: { "X-Activity-Fallback": "true" },
    });
  }
}
