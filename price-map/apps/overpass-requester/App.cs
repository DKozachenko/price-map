using System.Text;
using RabbitMQ.Client.Events;
using Services;

class App {
  private RabbitService rabbit;
  public RabbitService RabbitService { get { return this.rabbit; } set { this.rabbit = value; } }

  public EventHandler<BasicDeliverEventArgs> handler = (model, ea) => {
    byte[] body = ea.Body.ToArray();
    string message = Encoding.UTF8.GetString(body);
    Console.WriteLine($" [x] Received {message}");
  };

  public App() {
    this.RabbitService = new RabbitService();
  }


  public void Start() {
    // this.RabbitService.SendMessage<string>("osrm-requester-exchange", "shops_in", "Hello World!");
    // this.RabbitService.GetMessage<string>("shops_out_queue", this.handler);
    Console.ReadLine();
  }
}