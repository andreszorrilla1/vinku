import sys, json
from playwright.sync_api import sync_playwright
vid=sys.argv[1]; tiempos=[float(x) for x in sys.argv[2].split(",")]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":1080,"height":1920})
    errs=[]; pg.on("pageerror",lambda e: errs.append(str(e)))
    pg.goto(f"file:///home/claude/videos/motor.html?v={vid}"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    print("total",pg.evaluate("TOTAL"))
    for t in tiempos:
        pg.evaluate(f"render({t})")
        pg.screenshot(path=f"/home/claude/videos/cuadros/{vid}_{t}.jpg",type="jpeg",quality=80)
    print(errs); b.close()
