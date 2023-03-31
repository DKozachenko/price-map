using System.Text;
using Newtonsoft.Json;

namespace Services;
/// <summary>
/// JSON сервис
/// </summary>
class JsonService {
  /// <summary>
  /// Логгер
  /// </summary>
  public LoggerService LoggerService { get; set; }
  public JsonService() {
    this.LoggerService = new LoggerService();
  }

  /// <summary>
  /// Десериализация JSON из строки
  /// </summary>
  /// <param name="str">Строка</param>
  /// <typeparam name="T">Тип возвращаемых данных</typeparam>
  /// <returns>Данные T типа</returns>
  public T? DeserializeFromString<T>(string str) {
    try
    {
      T? result = JsonConvert.DeserializeObject<T>(str);
      return result;
    }
    catch (Exception err)
    {
      this.LoggerService.Error($"Error while deserializing JSON from string: {str}", "JsonService");
      throw err;
    }
  }

  /// <summary>
  /// Десериализация JSON из массива байтов
  /// </summary>
  /// <param name="arr">Массив байт</param>
  /// <typeparam name="T">Тип возвращаемых данных</typeparam>
  /// <returns>Данные T типа</returns>
  public T? DeserializeFromByteArray<T>(byte[] arr) {
    string str = Encoding.UTF8.GetString(arr);
    return this.DeserializeFromString<T>(str);
  }

  /// <summary>
  /// Десериализация в целое число
  /// </summary>
  /// <param name="arr">Массив байт</param>
  /// <returns>Целое число</returns>
  public long DeserializeIntFromByteArray(byte[] arr) {
    string str = Encoding.UTF8.GetString(arr);
    return Convert.ToInt64(str);
  }

  /// <summary>
  /// Сериализация данных в JSON строку
  /// </summary>
  /// <param name="data">Данные</param>
  /// <typeparam name="T">Тип передаваемых данных</typeparam>
  /// <returns>Строка</returns>
  public string SerializeToString<T>(T data) {
    return JsonConvert.SerializeObject(data);
  }

}