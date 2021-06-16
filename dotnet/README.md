# Receive Messages in C# using Azure Event Hubs for Apache Kafka Ecosystems

This quickstart will show how to create and connect to an Event Hubs Kafka endpoint using an example producer and consumer written in C# using .NET Core 3.1. Azure Event Hubs for Apache Kafka Ecosystems supports [Apache Kafka version 1.0](https://kafka.apache.org/10/documentation.html) and later.

This sample is based on [Confluent's Apache Kafka .NET client](https://github.com/confluentinc/confluent-kafka-dotnet), modified for use with Event Hubs for Kafka.

## Prerequisites

* [Visual Studio 2019](https://visualstudio.microsoft.com/downloads/)

## Run the application
* Import the solution to Visual Studio
* Install .NET core from VS
* Install all nuget dependencies with VS 
* Update App.config:
    * `EVENTHUBS_NAMESPACE` - the Event Hubs namespace
    * OAuth credentials:
        * `TENANT_ID`
        * `CLIENT_ID`
        * `CLIENT_SECRET`
* Run the app with VS
