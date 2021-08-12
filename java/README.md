# Receive Event Hub Messages with Kafka java driver

## Prerequisites
- JDK 11 or higher
- Maven

## Configuration

Replace placeholders in `TestConsumer` class with your Event Hubs namespace, topic, client id, client secret, and tenant id:

```java
public static final String NAMESPACE = "<REPLACE>";
public static final String TOPIC = "test";
public static final String TENANT_ID = "<REPLACE>";
public static final String CLIENT_ID = "<REPLACE>";
public static final String CLIENT_SECRET = "<REPLACE>";
public static final String GROUP_NAME = "test-group";
public static final String OFFSET_RESET = "latest";
```
Use offset reset `earliest` to read from the beginning of the topic.

## Run consumer

The consumer sample demonstrates how to receive messages from the Event Hubs service using the Kafka API.

Start consumer with  
```bash
mvn exec:java -Dexec.mainClass="com.parsable.samples.TestConsumer"
```

The consumer will now begin receiving events from the Kafka enabled Event Hub on topic `test`. If the topic has not already been created in the Kafka configuration, no messages will be sent/received.
