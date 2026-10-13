#!/usr/bin/env python3
"""Hatch cofounder report — pulls GoatCounter stats and prints a plain-English readout.
Usage: python cofounder_report.py [start YYYY-MM-DD] [end YYYY-MM-DD]
Defaults to the last 7 days. Reads the API token from .goatcounter-token (gitignored).
"""
import sys, os, json, datetime, urllib.request, subprocess, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = "https://samfirn.goatcounter.com/api/v0"
SITE = "https://hatchpet.pages.dev/"
GOG = os.environ.get("GOG_BIN") or shutil.which("gog") or r"C:\Users\samfi\.openclaw\bin\gog.exe"

def token():
    with open(os.path.join(HERE, ".goatcounter-token")) as f:
        return f.read().strip()

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": "Bearer " + token()})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def _brandish(q):
    """A navigational/brand query = someone typing the URL, not discovering us."""
    s = q.lower().replace(" ", "").replace(".", "")
    return any(t in s for t in ("hatchpet", "pagesdev", "hatchpages"))

def seo_section(start, end):
    """Google Search Console readout. The needle to watch is NON-BRAND impressions —
    proof the SEO work is pulling in people searching for a virtual pet, not just
    people who already know the URL. Shells out to the authorized gog CLI."""
    print("\n-- SEO / Google Search (Search Console) --")
    if not os.path.exists(GOG) and not shutil.which("gog"):
        print("  (gog CLI not found — set GOG_BIN; skipping SEO section)")
        return
    try:
        out = subprocess.run(
            [GOG, "gsc", "query", SITE, "--type", "WEB", "--dimensions", "QUERY",
             "--from", start, "--to", end, "--max", "60", "-p"],
            capture_output=True, text=True, timeout=45)
    except Exception as e:
        print(f"  (Search Console call failed: {str(e)[:90]})")
        return
    if out.returncode != 0:
        print(f"  (Search Console unavailable: {(out.stderr or out.stdout).strip()[:90]})")
        return
    rows = []
    for line in out.stdout.splitlines():
        p = line.split("\t")
        if len(p) < 5 or p[0] in ("QUERY", "DATE"):
            continue
        try:
            rows.append((p[0], int(p[1]), int(p[2]), p[4]))  # query, clicks, impr, position
        except ValueError:
            continue
    if not rows:
        print("  No search data in window yet (GSC lags ~2-3 days; data starts at verification).")
        return
    disc = [r for r in rows if not _brandish(r[0])]
    tot_clicks, tot_impr = sum(r[1] for r in rows), sum(r[2] for r in rows)
    disc_impr = sum(r[2] for r in disc)
    print(f"  Search clicks / impressions : {tot_clicks} / {tot_impr}")
    print(f"  Brand/navigational clicks   : {sum(r[1] for r in rows if _brandish(r[0]))}  (typing the URL)")
    print(f"  Non-brand impressions       : {disc_impr}   <-- the SEO needle (want this rising)")
    if disc:
        print("  Top discovery queries:")
        for q, c, i, pos in sorted(disc, key=lambda r: -r[2])[:6]:
            print(f"    {i:>4} impr / {c:>2} clk  pos {pos:>5}  \"{q}\"")
    else:
        print("  No non-brand queries yet — SEO still taking hold (give it weeks).")

def main():
    today = datetime.date.today()
    start = sys.argv[1] if len(sys.argv) > 1 else str(today - datetime.timedelta(days=7))
    end = sys.argv[2] if len(sys.argv) > 2 else str(today)
    q = f"?start={start}&end={end}"

    total = get("/stats/total" + q)
    hits = get("/stats/hits" + q).get("hits", [])
    try:
        refs = get("/stats/toprefs" + q).get("stats", [])
    except Exception:
        refs = []

    # event paths may carry a "hatch/" prefix; strip it so lookups are stable
    ev = {h["path"].split("/")[-1]: h["count"] for h in hits if h.get("event")}
    pages = [(h["count"], h["path"]) for h in hits if not h.get("event")]
    new = ev.get("new-visitor", 0)
    ret = ev.get("returning-visitor", 0)
    d2 = ev.get("day-2", 0)
    d3 = ev.get("day-3plus", 0)

    def pct(a, b):
        return f"{(100*a/b):.0f}%" if b else "n/a"

    print(f"\n=== HATCH COFOUNDER REPORT  ({start} -> {end}) ===\n")
    print(f"Visits (pageviews) : {total.get('total', 0)}")
    print(f"Tracked events     : {total.get('total_events', 0)}")
    print("\n-- Audience --")
    print(f"New visitors       : {new}")
    print(f"Returned at all    : {ret}  ({pct(ret, new)} of new)")
    print(f"Day-2 cohort       : {d2}  ({pct(d2, new)} day-2 return)")
    print(f"Day-3+ cohort      : {d3}  ({pct(d3, new)} reached 3+ days)")
    print("\n-- Where traffic came from --")
    if refs:
        for r in refs[:10]:
            print(f"  {r['count']:>5}  {r.get('name') or '(direct)'}")
    else:
        print("  (no referrers - all direct/unknown = NO discovery funnel running)")
    print("\n-- Top pages --")
    for c, p in sorted(pages, reverse=True)[:8]:
        print(f"  {c:>5}  {p}")
    seo_section(start, end)

    print("\nRule of thumb: retention >~15% day-2 = product works, pour effort into TRAFFIC (clips).")
    print("If referrers stay empty, the clip engine isn't running yet.")
    print("SEO needle: non-brand search impressions rising = the content pass is landing.\n")

if __name__ == "__main__":
    main()
