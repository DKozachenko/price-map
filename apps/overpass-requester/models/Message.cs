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
  [JsonProperty("data")]
  public T Data { get; set; }
  /// <summary>
  /// Описание
  /// </summary>
  [JsonProperty("description")]
  public string Description { get; set; }
  /// <summary>
  /// Время отправки
  /// </summary>
  [JsonProperty("sendTime")]
  public DateTime SendTime { get; set; }
  public Message(T data, string description, DateTime sendTime) {
    this.Data = data;
    this.Description = description;
    this.SendTime = sendTime;
  }
}