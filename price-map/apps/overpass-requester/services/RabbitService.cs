using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Services;
class RabbitService {
  private IConnection connection;
  private IModel channel;
  private JsonService jsonService;
  private LoggerService loggerService;
  public IConnection Connection { get { return this.connection; } set { this.connection = value; } }
  public IModel Channel { get { return this.channel; } set { this.channel = value; } }
  public JsonService JsonService { get { return this.jsonService; } set { this.jsonService = value; } }
  public LoggerService LoggerService { get { return this.loggerService; } set { this.loggerService = value; } }
  public RabbitService() {
    this.JsonService = new JsonService();
    this.LoggerService = new LoggerService();
  }

  public void InitConnection() {
    ConnectionFactory factory = new ConnectionFactory { HostName = "localhost", Port = 5672, UserName = "admin", Password = "admin_rabbit" };
    this.Connection = factory.CreateConnection();
    this.Channel = this.Connection.CreateModel();
  }

  public void SendMessage<T>(string exchange, string routingKey, T data) {
      string dataStr = this.JsonService.SerializeToString<T>(data);
      byte[] body = Encoding.UTF8.GetBytes(dataStr);
      this.Channel.BasicPublish(exchange: exchange, routingKey: routingKey, basicProperties: null, body: body);
      this.LoggerService.Log($"Send message to {exchange} with {routingKey} routing key, content length {body.Length} bytes", "RabbitService");
  }

  public void GetMessage<T>(string queueName, EventHandler<BasicDeliverEventArgs> callback) {
    EventingBasicConsumer consumer = new EventingBasicConsumer(this.Channel);
    consumer.Received += callback;
    this.Channel.BasicConsume(queue: queueName, autoAck: true, consumer: consumer);
  }

  public void CloseConnection() {
    this.Connection.Close();
  }
    
}