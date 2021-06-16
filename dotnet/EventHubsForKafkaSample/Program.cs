using System;
using System.Configuration;

namespace EventHubsForKafkaSample
{
    class Program
    {
        public static void Main(string[] args)
        {
            string eventHubsNamespace = ConfigurationManager.AppSettings["EVENTHUBS_NAMESPACE"];
            string topic = ConfigurationManager.AppSettings["TOPIC"];
            string clientId = ConfigurationManager.AppSettings["CLIENT_ID"];
            string clientSecret = ConfigurationManager.AppSettings["CLIENT_SECRET"];
            string tenantId = ConfigurationManager.AppSettings["TENANT_ID"];

            Console.WriteLine("Initializing Consumer");
            Worker.Consumer(eventHubsNamespace, topic, "test-dotnet-group", clientId, clientSecret, tenantId);
            Console.ReadKey();
        }
    }
}
