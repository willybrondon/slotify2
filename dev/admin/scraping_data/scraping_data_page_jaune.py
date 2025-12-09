# pip install playwright
# playwright install
from playwright.sync_api import sync_playwright
import csv

def scrape_pagesjaunes_search(query, page_num=1):
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True)
        page = browser.new_page()
        url = f"https://www.pagesjaunes.fr/recherche/{query}/paris-75"
        page.goto(url)
        items = page.query_selector_all("li.bi-bloc")
        rows = []
        for it in items:
            name = it.query_selector("a.bi-bloc__title").inner_text().strip() if it.query_selector("a.bi-bloc__title") else ""
            address = it.query_selector(".adresse").inner_text().strip() if it.query_selector(".adresse") else ""
            phone = it.query_selector(".num").inner_text().strip() if it.query_selector(".num") else ""
            rows.append({"name": name, "address": address, "phone": phone})
        browser.close()
        return rows

rows = scrape_pagesjaunes_search("salon-de-coiffure")
with open("pagesjaunes_sample.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["name","address","phone"])
    writer.writeheader()
    writer.writerows(rows)
