namespace Services;

/// <summary>
/// Логер
/// </summary>
class LoggerService {
  public LoggerService() {}

  /// <summary>
  /// Обычное сообщение
  /// </summary>
  /// <param name="message">Сообщение</param>
  /// <param name="context">Контекст</param>
  public void Log(string message, string context) {
    string formattedNow = DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss");
    Console.Write($"\u001b[32m{formattedNow}\tLOG ");
    Console.Write($"\u001b[33m[{context}] ");
    Console.Write($"\u001b[32m{message}\n\u001b[0m");
  }

  /// <summary>
  /// Сообщение об ошибке
  /// </summary>
  /// <param name="message">Сообщение</param>
  /// <param name="context">Контекст</param>
  public void Error(string message, string context) {
    string formattedNow = DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss");
    Console.Write($"\u001b[31m{formattedNow}\tERROR ");
    Console.Write($"\u001b[33m[{context}] ");
    Console.Write($"\u001b[31m{message}\n\u001b[0m");
  }

}