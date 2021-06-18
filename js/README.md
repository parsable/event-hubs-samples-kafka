# Receive Messages in Node using Event Hubs for Apache Kafka Ecosystems

This quickstart will show how to create and connect to an Event Hubs Kafka endpoint using an example producer and consumer written in Node. Azure Event Hubs for Apache Kafka Ecosystems supports [Apache Kafka version 1.0](https://kafka.apache.org/10/documentation.html) and later.

This sample uses the [KafkaJS](https://github.com/tulios/kafkajs) library.

## Prerequisites
- [npm](https://www.npmjs.com/)
- [Node.js](https://nodejs.org)

## Configuration

Replace placeholders with your Event Hubs namespace, client id, client secret, and tenant id:

```javascript
const namespace = "<REPLACE WITH YOUR EVENT HUBS NAMESPACE>";
const tenantId = "<REPLACE WITH YOUR TENANT ID>";
const msalConfig = {
    auth: {
        authority: "https://login.microsoftonline.com/" + tenantId,
        clientId: "<REPLACE WITH YOUR CLIENT ID>",
        clientSecret: "<REPLACE WITH YOUR CLIENT SECRET>",
    }
};

```

## Run consumer

The consumer sample demonstrates how to receive messages from the Event Hubs service using the Kafka API.

1. install dependencies with running
    ```bash
    npm install
    ```
1. start consumer with
    ```bash
    node consumer.js
    ```

The consumer will now begin receiving events from the Kafka enabled Event Hub on topic `test`. Change the topic variable in `consumer.js` for a different one. If the topic has not already been created in the Kafka configuration, no messages will be sent/received.
