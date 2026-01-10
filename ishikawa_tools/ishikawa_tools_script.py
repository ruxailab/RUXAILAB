#!/usr/bin/env python3
"""Minimal report-generation script used by .github/workflows/ishikawa-tools.yml

This script is intentionally minimal so the workflow has a working target.
It writes a small `report.txt` and a sample plot `report.png` into
`ishikawa_tools/output` so the workflow's artifact upload step has files
to collect. It also prints basic environment/debug information.
"""
from __future__ import annotations

import os
import datetime
import sys

def main() -> int:
    token = os.getenv("TOKEN", "")
    user = os.getenv("USER", "(none)")
    project = os.getenv("PROJECT", "(none)")

    print(f"TOKEN length: {len(token)}")
    print(f"USER: {user}")
    print(f"PROJECT: {project}")

    base = os.path.dirname(__file__)
    outdir = os.path.join(base, "output")
    os.makedirs(outdir, exist_ok=True)

    # create a simple text report
    report_file = os.path.join(outdir, "report.txt")
    with open(report_file, "w", encoding="utf-8") as f:
        f.write("Ishikawa tools report\n")
        f.write(f"Timestamp: {datetime.datetime.utcnow().isoformat()}Z\n")
        f.write(f"USER: {user}\n")
        f.write(f"PROJECT: {project}\n")
        f.write(f"TOKEN length: {len(token)}\n")

    # create a small sample PNG plot if matplotlib is available
    try:
        import numpy as _np
        import matplotlib.pyplot as _plt

        data = _np.random.RandomState(0).rand(10, 10)
        _plt.figure(figsize=(4, 3), dpi=100)
        _plt.imshow(data, cmap="hot")
        _plt.colorbar()
        png_file = os.path.join(outdir, "report.png")
        _plt.tight_layout()
        _plt.savefig(png_file)
        _plt.close()
        print(f"Wrote: {report_file}")
        print(f"Wrote: {png_file}")
    except Exception as exc:
        print("matplotlib/numpy not available or failed to generate image:", exc)
        print(f"Wrote: {report_file}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
