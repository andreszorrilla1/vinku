import sys, subprocess, os
from playwright.sync_api import sync_playwright
vid=sys.argv[1]; FPS=30
os.makedirs("/home/claude/videos/salida",exist_ok=True)
tmp=f"/home/claude/videos/salida/{vid}.video.tmp.mp4"; fin=f"/home/claude/videos/salida/{vid}.video.mp4"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":1080,"height":1920})
    pg.goto(f"file:///home/claude/videos/motor.html?v={vid}"); pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    total=pg.evaluate("TOTAL"); n=int(round(total*FPS))
    ff=subprocess.Popen(["ffmpeg","-y","-loglevel","error","-f","image2pipe","-framerate",str(FPS),"-c:v","mjpeg","-i","-",
        "-c:v","libx264","-preset","veryfast","-crf","20","-pix_fmt","yuv420p","-r",str(FPS),tmp],stdin=subprocess.PIPE)
    for i in range(n):
        pg.evaluate(f"render({i/FPS})")
        ff.stdin.write(pg.screenshot(type="jpeg",quality=92))
    ff.stdin.close(); rc=ff.wait(); b.close()
if rc==0: os.replace(tmp,fin); print(vid,"ok",n,"frames")
else: print(vid,"ffmpeg error",rc)
