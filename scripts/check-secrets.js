const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const EXCLUDE_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", ".vercel"]);
const EXCLUDE_FILES = /\.env(\..*)?$/;
const TEXT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".prisma", ".css", ".html"]);

const PATTERNS = [
  { label: "JWT-like token (eyJ...)", regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { label: "Supabase project ref / URL", regex: /[a-z0-9]{20}\.supabase\.co/ },
  { label: "Postgres connection string with credentials", regex: /postgres(?:ql)?:\/\/[^\s"'`]+:[^\s"'`]+@/ },
  { label: "Razorpay key (rzp_live_ / rzp_test_)", regex: /rzp_(live|test)_[A-Za-z0-9]+/ },
  { label: "AWS-style access key", regex: /AKIA[0-9A-Z]{16}/ },
  { label: "Possible hardcoded secret/password assignment", regex: /(secret|password|api[_-]?key|token)\s*[:=]\s*["'`][^"'`\s]{8,}["'`]/i },
];

let findings = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name));
    } else {
      if (EXCLUDE_FILES.test(entry.name)) continue;
      const ext = path.extname(entry.name);
      if (!TEXT_EXTENSIONS.has(ext)) continue;
      scanFile(path.join(dir, entry.name));
    }
  }
}

function scanFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, "utf8");
  } catch {
    return;
  }

  const lines = content.split("\n");

  for (const { label, regex } of PATTERNS) {
    lines.forEach((line, idx) => {
      if (regex.test(line)) {
        findings.push({
          file: path.relative(ROOT, filePath),
          line: idx + 1,
          label,
          snippet: line.trim().slice(0, 120),
        });
      }
    });
  }
}

["src", "public", "prisma"].forEach((dir) => {
  const full = path.join(ROOT, dir);
  if (fs.existsSync(full)) walk(full);
});

fs.readdirSync(ROOT, { withFileTypes: true }).forEach((entry) => {
  if (entry.isFile()) {
    if (EXCLUDE_FILES.test(entry.name)) return;
    const ext = path.extname(entry.name);
    if (!TEXT_EXTENSIONS.has(ext)) return;
    scanFile(path.join(ROOT, entry.name));
  }
});

if (findings.length === 0) {
  console.log("No hardcoded secrets or sensitive strings found.");
} else {
  console.log(`Found ${findings.length} potential issue(s):\n`);
  for (const f of findings) {
    console.log(`[${f.label}]`);
    console.log(`  ${f.file}:${f.line}`);
    console.log(`  ${f.snippet}`);
    console.log("");
  }
  console.log("Note: .env* files are intentionally excluded (expected to contain secrets).");
  console.log("Review each match - some may be false positives.");
}
