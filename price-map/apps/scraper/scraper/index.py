# from services.scraping import ScrapingService

# scraper = ScrapingService()
# result = scraper.scrape_categories()
# print(result)
import pika
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672))
channel = connection.channel()
channel.basic_publish(exchange='test_exchange', routing_key='test', body='Hello World! 3')
print(" [x] Sent 'Hello World!'")