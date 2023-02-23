# from services.scraping import ScrapingService

# scraper = ScrapingService()
# result = scraper.scrape_categories()
# print(result)
test = {
  "name": 'test name',
  "categories2Level": [
    {
      "name": '3243545',
      "categories3Level": [
        {
          "name": 'mega',
          "filters": []
        }
      ]
    }
  ]
}
import pika
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost', 5672))
channel = connection.channel()
channel.basic_publish(exchange='test_exchange', routing_key='test', body=str(test).replace('\'', '"'))
# channel.basic_publish(exchange='test_exchange', routing_key='test', body='Hello world')
print(" [x] Sent 'Hello World!'")