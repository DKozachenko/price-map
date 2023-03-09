using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Services;
class RabbitService {
  private IConnection connection;
  private IModel channel;
  private JsonService jsonService;
  public IConnection Connection { get { return this.connection; } set { this.connection = value; } }
  public IModel Channel { get { return this.channel; } set { this.channel = value; } }
  public JsonService JsonService { get { return this.jsonService; } set { this.jsonService = value; } }
  public RabbitService() {
    this.JsonService = new JsonService();
  }

  public void InitConnection() {
    ConnectionFactory factory = new ConnectionFactory { HostName = "localhost", Port = 5672, UserName = "admin", Password = "admin_rabbit" };
    this.Connection = factory.CreateConnection();
    this.Channel = this.Connection.CreateModel();
  }

  public void SendMessage<T>(string exchange, string routingKey, T data) {
      // this.InitConnection();
      // if (this.Connection == null) {
      //   this.InitConnection();
      // }
      string dataStr = this.JsonService.SerializeToString<T>(data);
      byte[] body = Encoding.UTF8.GetBytes(dataStr);
      this.Channel.BasicPublish(exchange: exchange, routingKey: routingKey, basicProperties: null, body: body);
      // this.Connection.Close();
  }

  public void GetMessage<T>(string queueName, EventHandler<BasicDeliverEventArgs> callback) {
    this.InitConnection();
    EventingBasicConsumer consumer = new EventingBasicConsumer(this.Channel);
    consumer.Received += callback;
    this.Channel.BasicConsume(queue: queueName, autoAck: true, consumer: consumer);
  }
    
}