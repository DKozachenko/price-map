# from services.scraping import ScrapingService

# scraper = ScrapingService()
# result = scraper.scrape_categories()
# print(result)
test_var = {
  "name": '34324',
  "total": 6,
  "arra": [{
    "name": '3434234243423423',
    "full": 2
  }]
}
import pika
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672))
channel = connection.channel()
channel.basic_publish(exchange='test_exchange', routing_key='test', body=str(test_var).replace('\'', '"'))
print(" [x] Sent 'Hello World!'")