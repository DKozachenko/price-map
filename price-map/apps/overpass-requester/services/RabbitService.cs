using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Services;
/// <summary>
/// Сервис взаимодействия с Rabbit
/// </summary>
class RabbitService {
  /// <summary>
  /// Соединение
  /// </summary>
  public IConnection Connection { get; set; }
  /// <summary>
  /// Канал
  /// </summary>
  public IModel Channel { get; set; }
  /// <summary>
  /// JSON сервис
  /// </summary>
  public JsonService JsonService { get; set; }
  /// <summary>
  /// Логер
  /// </summary>
  public LoggerService LoggerService { get; set; }
  public RabbitService() {
    this.JsonService = new JsonService();
    this.LoggerService = new LoggerService();
  }

  /// <summary>
  /// Инициализация соединения
  /// </summary>
  public void InitConnection() {
    ConnectionFactory factory = new ConnectionFactory { HostName = "localhost", Port = 5672, UserName = "admin", Password = "admin_rabbit" };
    this.Connection = factory.CreateConnection();
    this.Channel = this.Connection.CreateModel();
  }

  /// <summary>
  /// Отправка сообщения
  /// </summary>
  /// <param name="exchange">Название обменника</param>
  /// <param name="routingKey">Ключ маршрутизации</param>
  /// <param name="data">Данные</param>
  /// <typeparam name="T">Тип посылаемых данных</typeparam>
  public void SendMessage<T>(string exchange, string routingKey, T data) {
      string dataStr = this.JsonService.SerializeToString<T>(data);
      byte[] body = Encoding.UTF8.GetBytes(dataStr);
      this.Channel.BasicPublish(exchange: exchange, routingKey: routingKey, basicProperties: null, body: body);
      this.LoggerService.Log($"Send message to {exchange} with {routingKey} routing key, content length {body.Length} bytes", "RabbitService");
  }

  /// <summary>
  /// Подписка на получение сообщение
  /// </summary>
  /// <param name="queueName">Название очереди</param>
  /// <param name="callback">Колбэк при получении сообщения</param>
  public void GetMessage(string queueName, EventHandler<BasicDeliverEventArgs> callback) {
    EventingBasicConsumer consumer = new EventingBasicConsumer(this.Channel);
    consumer.Received += callback;
    this.Channel.BasicConsume(queueName, true, consumer);
  }

  /// <summary>
  /// Закрытие соединения
  /// </summary>
  public void CloseConnection() {
    this.Connection.Close();
  }
    
}