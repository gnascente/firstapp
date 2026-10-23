from playwright.sync_api import sync_playwright
import time
import urllib.request
import urllib.error
import subprocess

def wait_for_server(url, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = urllib.request.urlopen(url)
            if r.getcode() == 200:
                return True
        except Exception:
            time.sleep(1)
    return False

def run_tests():
    print("Starting wrangler dev...")
    process = subprocess.Popen(["npx", "wrangler", "dev"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    if not wait_for_server("http://localhost:8788"):
        print("Server failed to start")
        process.terminate()
        return

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={'width': 414, 'height': 896},
                user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
            )
            page = context.new_page()
            page.goto("http://localhost:8788")
            page.wait_for_selector(".container")

            page.evaluate("App.openMap()")
            page.wait_for_selector("#viewMap")

            # verify FAB cleanup on outside click
            page.evaluate("""
                MapLogic.longPressContext = { clientX: 100, clientY: 100, isPin: false };
                MapLogic.contextMenuPos = { x: 100, y: 100 };
                MapLogic.addPinFromContext();
            """)
            page.wait_for_selector(".map-pin")
            pin_id = page.evaluate("document.querySelector('.map-pin').dataset.id")

            page.evaluate(f"""
                MapLogic.longPressTimer = 1;
                MapLogic.longPressContext = {{ clientX: 100, clientY: 100, isPin: true, pinId: '{pin_id}' }};
                MapLogic.onPointerUp({{ target: document.querySelector('.map-pin') }});
            """)

            time.sleep(0.5)
            logs_display = page.evaluate("document.getElementById('mapPinLogsContainer').style.display")
            assert logs_display == "flex", f"Expected mapPinLogsContainer to be flex, got '{logs_display}'"

            print("Clicking map background...")
            page.evaluate("""
                MapLogic.longPressTimer = 1;
                MapLogic.longPressContext = { clientX: 200, clientY: 200, isPin: false };
                MapLogic.onPointerUp({ target: document.getElementById('mapPinsContainer') });
            """)
            time.sleep(0.5)

            fab_display = page.evaluate("document.getElementById('mapPinFab').style.display")
            assert fab_display == "none", f"Expected mapPinFab to be none, got '{fab_display}'"
            print("FAB cleaned up correctly.")
            browser.close()
    finally:
        print("Terminating server...")
        process.terminate()
        process.wait()

if __name__ == "__main__":
    run_tests()
