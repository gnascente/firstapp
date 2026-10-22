from playwright.sync_api import sync_playwright
import time
import urllib.request
import urllib.error

def wait_for_server(url, timeout=30):
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = urllib.request.urlopen(url)
            if r.getcode() == 200:
                return True
        except urllib.error.URLError:
            time.sleep(1)
    return False

def run_tests():
    if not wait_for_server("http://localhost:8788"):
        print("Server failed to start")
        return

    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:8788")
        page.wait_for_selector(".container")

        print("Verifying full screen width...")
        container_style = page.evaluate("window.getComputedStyle(document.querySelector('.container')).maxWidth")
        assert container_style == "none", f"Expected container max-width to be 'none', got '{container_style}'"
        print("Container width verified.")

        print("Opening Map view...")
        page.evaluate("App.openMap()")
        page.wait_for_selector("#viewMap")
        is_visible = page.evaluate("document.getElementById('viewMap').style.display !== 'none'")
        assert is_visible, "Map view is not visible"
        print("Map view opened.")

        print("Adding a pin...")
        page.evaluate("""
            MapLogic.longPressContext = { clientX: 100, clientY: 100, isPin: false };
            MapLogic.contextMenuPos = { x: 100, y: 100 };
            MapLogic.addPinFromContext();
        """)

        page.wait_for_selector(".map-pin")
        pin_count = page.evaluate("document.querySelectorAll('.map-pin').length")
        assert pin_count == 1, f"Expected 1 pin, found {pin_count}"
        print("Pin added.")

        print("Enabling move on pin...")
        pin_id = page.evaluate("document.querySelector('.map-pin').dataset.id")
        page.evaluate(f"""
            MapLogic.longPressContext = {{ clientX: 100, clientY: 100, isPin: true, pinId: '{pin_id}' }};
            MapLogic.enableMovePin();
        """)

        moving_pin_id = page.evaluate("MapLogic.movingPinId")
        assert moving_pin_id == pin_id, f"Expected movingPinId to be {pin_id}, got {moving_pin_id}"

        border_style = page.evaluate("document.querySelector('.map-pin').style.border")
        assert "yellow" in border_style, f"Expected yellow border, got '{border_style}'"
        print("Pin set to move.")

        print("Testing pin selection...")
        page.evaluate("MapLogic.movingPinId = null")

        page.evaluate(f"""
            MapLogic.longPressTimer = 1;
            MapLogic.longPressContext = {{ clientX: 100, clientY: 100, isPin: true, pinId: '{pin_id}' }};
            MapLogic.onPointerUp({{ target: document.querySelector('.map-pin') }});
        """)

        time.sleep(0.5)

        selected_pin_id = page.evaluate("MapLogic.selectedPinId")
        assert selected_pin_id == pin_id, f"Expected selectedPinId to be {pin_id}, got {selected_pin_id}"

        logs_display = page.evaluate("document.getElementById('mapPinLogsContainer').style.display")
        assert logs_display == "flex", f"Expected mapPinLogsContainer to be flex, got '{logs_display}'"
        print("Pin selected and logs container is visible.")

        print("All Map logic tests passed successfully!")
        browser.close()

if __name__ == "__main__":
    run_tests()
