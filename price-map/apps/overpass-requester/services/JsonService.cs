using System.Text;
using Newtonsoft.Json;

namespace Services;
class JsonService {
  public JsonService() {}

  public T DeserializeFromString<T>(string str) {
    T result = JsonConvert.DeserializeObject<T>(str);
    return result;
  }

  public T DeserializeFromByteArray<T>(byte[] arr) {
    string str = Encoding.UTF8.GetString(arr);
    T result = JsonConvert.DeserializeObject<T>(str);
    return result;
  }

}