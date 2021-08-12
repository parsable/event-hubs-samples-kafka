package com.parsable.samples;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.config.SaslConfigs;
import org.apache.kafka.common.serialization.StringDeserializer;

import java.time.Duration;
import java.util.Properties;
import java.util.UUID;

import static java.util.Collections.singleton;

@Slf4j
public class TestConsumer {
    public static final String NAMESPACE = "<REPLACE>";
    public static final String TOPIC = "test";
    public static final String TENANT_ID = "<REPLACE>";
    public static final String CLIENT_ID = "<REPLACE>";
    public static final String CLIENT_SECRET = "<REPLACE>";
    public static final String GROUP_NAME = "test-group";
    public static final String OFFSET_RESET = "latest";

    public static void main(String[] args) {
        try (Consumer<String, String> consumer = createConsumer(
                NAMESPACE + ".servicebus.windows.net:9093",
                TOPIC,
                TENANT_ID,
                CLIENT_ID,
                CLIENT_SECRET)) {
            while (true) {
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(1L));
                records.forEach(TestConsumer::processRecord);
            }
        }
    }

    private static void processRecord(org.apache.kafka.clients.consumer.ConsumerRecord<String, String> r) {
        log.info("Kafka event received: key=[{}], value=[{}]", r.key(), r.value());
    }

    private static Consumer<String, String> createConsumer(String bootstrapServers,
                                                           String topic,
                                                           String tenantId,
                                                           String appId,
                                                           String appSecret) {
        //see https://github.com/Azure/azure-event-hubs-for-kafka/blob/master/CONFIGURATION.md
        Properties properties = new Properties();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        properties.put(ConsumerConfig.CLIENT_ID_CONFIG, UUID.randomUUID().toString());
        properties.put(ConsumerConfig.GROUP_ID_CONFIG, GROUP_NAME);
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, OFFSET_RESET);
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        properties.put(ConsumerConfig.REQUEST_TIMEOUT_MS_CONFIG, 5000);
        properties.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000);
        properties.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000);
        properties.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, true);

        properties.put("security.protocol", "SASL_SSL");
        properties.put(SaslConfigs.SASL_MECHANISM, "OAUTHBEARER");
        properties.put(SaslConfigs.SASL_JAAS_CONFIG, "org.apache.kafka.common.security.oauthbearer.OAuthBearerLoginModule required;");
        properties.put(SaslConfigs.SASL_LOGIN_CALLBACK_HANDLER_CLASS, AzureAuthCallbackHandler.class);
        properties.put(AzureAuthCallbackHandler.AUTHORITY_CONFIG, "https://login.microsoftonline.com/" + tenantId);
        properties.put(AzureAuthCallbackHandler.APPID_CONFIG, appId);
        properties.put(AzureAuthCallbackHandler.APPSECRET_CONFIG, appSecret);

        Consumer<String, String> consumer = new KafkaConsumer<>(properties);

        consumer.subscribe(singleton(topic));
        return consumer;
    }
}
