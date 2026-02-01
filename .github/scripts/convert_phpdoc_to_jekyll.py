#!/usr/bin/env python3
"""
Convert phpDocumentor-generated HTML files into Jekyll pages.

Usage:
  python3 convert_phpdoc_to_jekyll.py <target-dir>

This script walks HTML files under <target-dir>, extracts the <title>
and the inner <body> HTML, and overwrites each file with Jekyll front
matter plus the original body. That causes Jekyll to render the page
inside the site's layout and include the site header/footer.

Notes / assumptions:
- Generated files are valid HTML and contain <title> and <body> tags.
- Asset paths (css/js) are left as-is (relative links should continue to work).
"""
import sys
from pathlib import Path
import re


def extract_title(html: str) -> str:
    m = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.IGNORECASE | re.DOTALL)
    if m:
        return m.group(1).strip()
    return "Documentation"


def extract_body_inner(html: str) -> str:
    m = re.search(r"<body[^>]*>(.*)</body>", html, flags=re.IGNORECASE | re.DOTALL)
    if m:
        return m.group(1).strip()
    # Fallback: return full HTML if no body found
    return html


def make_front_matter(title: str, rel_path: Path, dir_name: str) -> str:
    # create a permalink that mirrors the file path (without .html)
    # use as_posix to get forward-slash separated path on all platforms
    rel_posix = rel_path.with_suffix("").as_posix()
    if rel_posix == "index":
        permalink = "/" + dir_name + "/"
    else:
        permalink = "/" + dir_name + "/" + rel_posix + "/"
    # quote the title safely for YAML (escape double quotes)
    safe_title = title.replace('"', '\\"')
    fm = (
        f"---\n"
        f"layout: page\n"
        f"title: \"{safe_title}\"\n"
        f"permalink: {permalink}\n"
        f"---\n\n"
    )
    return fm


def process_file(path: Path, base_dir: Path):
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        print(f"Skipping (read error): {path}")
        return

    # Skip files that have already been converted (contain Jekyll front matter)
    if text.startswith("---"):
        print(f"Skipping (already converted): {path}")
        return

    title = extract_title(text)
    body = extract_body_inner(text)

    rel = path.relative_to(base_dir)
    dir_name = base_dir.name
    fm = make_front_matter(title, rel, dir_name)

    new_content = fm + "\n" + body + "\n"

    try:
        path.write_text(new_content, encoding="utf-8")
        print(f"Converted: {path} (title: {title})")
    except Exception as e:
        print(f"Failed to write {path}: {e}")


def main():
    if len(sys.argv) < 2:
        print("Usage: convert_phpdoc_to_jekyll.py <target-dir>")
        sys.exit(2)

    base = Path(sys.argv[1])
    if not base.exists() or not base.is_dir():
        print(f"Target dir does not exist or is not a directory: {base}")
        sys.exit(1)

    html_files = list(base.rglob("*.html"))
    if not html_files:
        print(f"No HTML files found under {base}")
        return

    for f in html_files:
        # skip JS/CSS files and already-processed files? We'll process all .html
        process_file(f, base)


if __name__ == '__main__':
    main()
