#!/usr/bin/env python3
"""Builds docs/REPORT.md and docs/REPORT.pdf from the source notes (01-04) plus test output.

Usage (from repo root):  python3 docs/build_report.py
Requires: pandoc, and Playwright's Chromium for the PDF step (optional: HTML is always written).
Edit docs/01..04 first (especially section 6 of 01 and the reflection in 03), then rebuild.
"""
import re, subprocess, pathlib

docs = pathlib.Path(__file__).parent
read = lambda n: (docs / n).read_text(encoding="utf-8")


def drop_mermaid(text):
    """Replace the two mermaid blocks by the rendered PNGs."""
    imgs = iter(["![Before: v1 monolith](diagrams/before.png)", "![After: v2 modules](diagrams/after.png)"])
    return re.sub(r"```mermaid.*?```", lambda m: next(imgs), text, flags=re.S)


def demote(text, by=1):
    return re.sub(r"^(#+) ", lambda m: "#" * (len(m.group(1)) + by) + " ", text, flags=re.M)


tests_raw = read("test-results.txt")
summary = "\n".join(l for l in tests_raw.splitlines() if re.match(r"^# (tests|suites|pass|fail|cancelled|skipped|todo|duration)", l))
names = "\n".join(l for l in tests_raw.splitlines() if re.match(r"^(ok|not ok) \d+ - ", l))

reflection = re.sub(r"<!--.*?-->", "", read("03-ai-reflection.md"), flags=re.S).replace("(DRAFT: the student must read, correct and own this text)", "")

parts = [
    "# Smart Campus Room Availability Checker - Assignment #04 report\n\n"
    "**AI assistant used:** Claude (Anthropic), model claude-sonnet-5-5, session date 2026-11-08.\n\n"
    "Repository: `v1-initial/` (baseline commit `b82d77c`, tag `v1-baseline`), `v2-final/` (final). "
    "Run commands are in `README.md`.\n",
    demote(read("01-codebase-analysis.md"), 0),
    demote(drop_mermaid(read("02-design-and-metrics.md")), 0),
    "# Task #04 - Automated testing: commands and actual results\n\n"
    "Command: `cd v2-final && node --test` (Node 22, no dependencies). Raw output: `docs/test-results.txt`.\n\n"
    "```\n" + summary + "\n```\n\nExecuted tests:\n\n```\n" + names + "\n```\n",
    "# Demonstration (screenshots, 420 px wide, real browser)\n\n"
    "| Successful filter + free slot | Overlap -> busy |\n|---|---|\n"
    "| ![](demo/1-filter-success-available.png) | ![](demo/2-overlap-busy.png) |\n\n"
    "| Room switch re-checks the same time | Unsuccessful filter -> empty state |\n|---|---|\n"
    "| ![](demo/3-room-switch-rechecked.png) | ![](demo/4-filter-empty-state.png) |\n",
    reflection,
    read("04-ai-evidence-appendix.md"),
]
md = "\n\n".join(parts)
(docs / "REPORT.md").write_text(md, encoding="utf-8")

css = """html{font-size:100%}body{font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.4;margin:0;padding:0;max-width:none !important;color:#111}
h1{font-size:18px;border-bottom:2px solid #1a5fb4;padding-bottom:3px;margin-top:26px;page-break-before:auto}
h1,h2,h3{break-after:avoid}table,pre,td img{break-inside:avoid}h2{font-size:14px;color:#1a5fb4;margin-top:16px} h3{font-size:12px}
table{border-collapse:collapse;margin:8px 0;width:100%;table-layout:auto;word-break:break-word} th,td{border:1px solid #aab;padding:3px 6px;vertical-align:top;text-align:left}
th{background:#eef2f7} code{background:#f2f4f7;padding:0 2px;font-size:10px}
pre{background:#f2f4f7;padding:6px;font-size:9.5px;overflow:hidden;white-space:pre-wrap}
img{max-width:100%;max-height:420px;display:block;margin:6px auto} td img{max-width:100%;max-height:520px} blockquote{border-left:3px solid #aab;margin-left:0;padding-left:8px;color:#333}"""
html = docs / "REPORT.html"
subprocess.run(["pandoc", str(docs / "REPORT.md"), "-f", "gfm", "-t", "html5", "-s", "--metadata", "title=Assignment 04 report",
                "-V", "pagetitle=Assignment 04 report", "-H", "/dev/stdin", "-o", str(html)],
               input=f"<style>{css}</style>".encode(), check=True, cwd=docs)

try:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page()
        pg.goto(html.as_uri())
        pg.pdf(path=str(docs / "REPORT.pdf"), format="A4", margin={"top": "14mm", "bottom": "14mm", "left": "10mm", "right": "10mm"}, print_background=True)
        b.close()
    print("Wrote REPORT.md, REPORT.html, REPORT.pdf")
except Exception as e:  # PDF is optional
    print("PDF step skipped:", e)
