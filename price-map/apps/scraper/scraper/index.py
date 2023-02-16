from services.scraping import ScrapingService

scraper = ScrapingService()
print(scraper)
result = scraper.scrape_categories()
print(result)