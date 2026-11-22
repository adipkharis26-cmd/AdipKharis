#!/usr/bin/env python3
"""
fetch_images.py - Unduh gambar yang dipakai sebuah file edit dari Black Clover Wiki (blackclover.fandom.com).

  python3 fetch_images.py edits/funk_mandala_asta.py images/
Gambar adalah milik Yuki Tabata / Shueisha / Studio Pierrot - jangan di-commit ke repo.
"""
import importlib.util
import json
import os
import subprocess
import sys
import urllib.parse

API = "https://blackclover.fandom.com/api.php"


def main():
    edit, out = sys.argv[1], sys.argv[2]
    spec = importlib.util.spec_from_file_location("edit", edit)
    E = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(E)
    os.makedirs(out, exist_ok=True)
    names = [n.replace("_", " ") for n in E.IMAGES]
    for i in range(0, len(names), 40):
        q = API + "?action=query&prop=imageinfo&iiprop=url&format=json&titles=" + \
            urllib.parse.quote("|".join("File:" + n for n in names[i:i + 40]))
        data = json.loads(subprocess.run(["curl", "-s", "-m", "30", q], capture_output=True, check=True).stdout)
        for page in data["query"]["pages"].values():
            fn = page["title"][5:].replace(" ", "_")
            if "imageinfo" not in page:
                print("TIDAK ADA:", fn)
                continue
            dst = os.path.join(out, fn)
            if not os.path.exists(dst):
                subprocess.run(["curl", "-s", "-m", "60", "-o", dst, page["imageinfo"][0]["url"]], check=True)
            print("ok", fn)


if __name__ == "__main__":
    main()
