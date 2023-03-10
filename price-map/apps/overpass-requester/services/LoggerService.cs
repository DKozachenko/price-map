namespace Services;

class LoggerService {
  public LoggerService() {}

  public void Log(string message, string context) {
    Console.BackgroundColor = ConsoleColor.DarkBlue;
    string formattedNow = DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss");
    Console.ForegroundColor = ConsoleColor.Green;
    Console.Write(formattedNow + "\t" + "LOG ");
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.Write($"[{context}] ");
    Console.ForegroundColor = ConsoleColor.Green;
    Console.Write(message + "\n");
    Console.ResetColor();
  }

  public void Error(string message, string context) {
    string formattedNow = DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss");
    Console.ForegroundColor = ConsoleColor.Red;
    Console.Write(formattedNow + "\t" + "ERROR ");
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.Write($"[{context}] ");
    Console.ForegroundColor = ConsoleColor.Red;
    Console.Write(message + "\n");
    Console.ResetColor();
  }

}