export interface GithubVerificationResult {
  status: "verified" | "failed";
  repoUrl: string;
  publicRepo: boolean;
  archived: boolean;
  stars: number;
  forks: number;
  defaultBranch: string | null;
  checkedAt: string;
  reason?: string;
}

function parseRepo(url: string) {
  const parsed = new URL(url);
  if (parsed.hostname !== "github.com") throw new Error("Only GitHub repository URLs are supported.");
  const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
  if (!owner || !repo) throw new Error("Invalid GitHub repository URL.");
  return { owner, repo: repo.replace(/\\.git$/, "") };
}

export async function verifyGithubRepository(repoUrl: string): Promise<GithubVerificationResult> {
  const { owner, repo } = parseRepo(repoUrl);
  const base = process.env.GITHUB_API_URL || "https://api.github.com";
  const response = await fetch(`${base}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!response.ok) {
    return { status: "failed", repoUrl, publicRepo: false, archived: false, stars: 0, forks: 0, defaultBranch: null, checkedAt: new Date().toISOString(), reason: `GitHub returned ${response.status}.` };
  }
  const repoData = await response.json();
  return {
    status: repoData.private ? "failed" : "verified",
    repoUrl,
    publicRepo: !repoData.private,
    archived: !!repoData.archived,
    stars: Number(repoData.stargazers_count || 0),
    forks: Number(repoData.forks_count || 0),
    defaultBranch: repoData.default_branch || null,
    checkedAt: new Date().toISOString(),
    ...(repoData.private ? { reason: "Repository is private." } : {}),
  };
}
