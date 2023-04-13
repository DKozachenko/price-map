using Newtonsoft.Json;
namespace Models;

/// <summary>
/// Интерфейс обмена сообщениями между бэком и сервисами
/// </summary>
/// <typeparam name="T">тип посылаемых / принимаемых данных</typeparam>
class Message<T> {
  /// <summary>
  /// Данные
  /// </summary>
  /// <value></value>
  [JsonProperty("data")]
  public T Data { get; set; }
  /// <summary>
  /// Описание
  /// </summary>
  /// <value></value>
  [JsonProperty("description")]
  public string Description { get; set; }
  /// <summary>
  /// Время отправки
  /// </summary>
  /// <value></value>
  [JsonProperty("sendTime")]
  public DateTime SendTime { get; set; }
  public Message(T data, string description, DateTime sendTime) {
    this.Data = data;
    this.Description = description;
    this.SendTime = sendTime;
  }
}