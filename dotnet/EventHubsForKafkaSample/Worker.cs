//Copyright (c) Microsoft Corporation. All rights reserved.
//Copyright 2016-2017 Confluent Inc., 2015-2016 Andreas Heider
//Licensed under the MIT License.
//Licensed under the Apache License, Version 2.0
//
//Original Confluent sample modified for use with Azure Event Hubs for Apache Kafka Ecosystems

using System;
using System.Threading;
using Confluent.Kafka;
using Microsoft.Identity.Client;
using System.Collections.Generic;

namespace EventHubsForKafkaSample
{
    class Worker
    {
        public static void Consumer(
            string eventHubsNamespace,
            string topic,
            string consumergroup,
            string clientId,
            string clientSecret,
            string tenantId
            )
        {
            var clientConfig = new ClientConfig
            {
                BootstrapServers = eventHubsNamespace + ".servicebus.windows.net:9093",
                SecurityProtocol = SecurityProtocol.SaslSsl,
                SaslMechanism = SaslMechanism.OAuthBearer
            };
            var config = new ConsumerConfig(clientConfig)
            {
                GroupId = consumergroup,
                AutoOffsetReset = AutoOffsetReset.Latest
            };

            IConfidentialClientApplication clientApp = ConfidentialClientApplicationBuilder.Create(clientId)
                                                      .WithClientSecret(clientSecret)
                                                      .WithAuthority(new Uri("https://login.microsoftonline.com/" + tenantId))
                                                      .Build();
            List<string> scopes = new();
            scopes.Add("https://" + eventHubsNamespace + ".servicebus.windows.net/.default");
            async void RefreshTokenCallback(IClient client, string cfg)
            {
                var result = await clientApp.AcquireTokenForClient(scopes)
                  .ExecuteAsync();
                
                client.OAuthBearerSetToken(result.AccessToken, result.ExpiresOn.ToUnixTimeMilliseconds(), "principal");
            }

            using (var consumer = new ConsumerBuilder<string, string>(config)
                .SetKeyDeserializer(Deserializers.Utf8)
                .SetValueDeserializer(Deserializers.Utf8)
                .SetOAuthBearerTokenRefreshHandler(RefreshTokenCallback)
                .Build())
            {
                CancellationTokenSource cts = new CancellationTokenSource();
                Console.CancelKeyPress += (_, e) => { e.Cancel = true; cts.Cancel(); };

                consumer.Subscribe(topic);

                Console.WriteLine("Consuming messages from topic: " + topic);

                while (true)
                {
                    try
                    {
                        var msg = consumer.Consume(cts.Token);
                        Console.WriteLine($"Received: '{msg.Message.Value}'");
                    }
                    catch (ConsumeException e)
                    {
                        Console.WriteLine($"Consume error: {e.Error.Reason}");
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine($"Error: {e.Message}");
                    }
                }
            }
        }
    }
}
