#!/usr/bin/env python3
"""Create an installable ZIP with a single TSMAuctionatorBridge/ root folder."""
from pathlib import Path
import re
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
ADDON = ROOT / "TSMAuctionatorBridge"
toc = (ADDON / "TSMAuctionatorBridge.toc").read_text(encoding="utf-8")
version = re.search(r"^## Version: ([\w.-]+)$", toc, re.MULTILINE).group(1)
output = ROOT / "dist" / f"TSMAuctionatorBridge-{version}.zip"
output.parent.mkdir(exist_ok=True)
with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    for path in sorted(ADDON.iterdir()):
        if path.is_file():
            archive.write(path, f"TSMAuctionatorBridge/{path.name}")
    for filename in ("README.md", "CHANGELOG.md"):
        archive.write(ROOT / filename, f"TSMAuctionatorBridge/{filename}")
with ZipFile(output) as archive:
    assert archive.testzip() is None
    assert "TSMAuctionatorBridge/TSMAuctionatorBridge.toc" in archive.namelist()
    for filename in toc.splitlines():
        filename = filename.strip()
        if filename and not filename.startswith("#"):
            assert f"TSMAuctionatorBridge/{filename}" in archive.namelist(), filename
print(output)
