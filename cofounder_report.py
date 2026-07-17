#!/usr/bin/env python3
"""Hatch cofounder report — pulls GoatCounter stats and prints a plain-English readout.
Usage: python cofounder_report.py [start YYYY-MM-DD] [end YYYY-MM-DD]
Defaults to the last 7 days. Reads the API token from .goatcounter-token (gitignored).
"""
import sys, os, json, datetime, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = "https://samfirn.goatcounter.com/api/v0"

def token():
    with open(os.path.join(HERE, ".goatcounter-token")) as f:
        return f.read().strip()

def get(path):
    req = urllib.request.Request(BASE + path, headers={"Authorization": "Bearer " + token()})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

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

    ev = {h["path"]: h["count"] for h in hits if h.get("event")}
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
    print("\nRule of thumb: retention >~15% day-2 = product works, pour effort into TRAFFIC (clips).")
    print("If referrers stay empty, the clip engine isn't running yet.\n")

if __name__ == "__main__":
    main()
