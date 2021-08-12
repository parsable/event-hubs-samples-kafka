import sys
import time

from confluent_kafka import KafkaError, KafkaException, Consumer
from msal import ConfidentialClientApplication

from settings import NAMESPACE, CLIENT_ID, CLIENT_SECRET, TENANT_ID, TOPIC, FROM_BEGINNING, CONSUMER_GROUP

running = True

client_app = ConfidentialClientApplication(
    client_id=CLIENT_ID,
    client_credential=CLIENT_SECRET,
    authority=f"https://login.microsoftonline.com/{TENANT_ID}"
)


def get_oauth_token(arg):
    response = client_app.acquire_token_for_client(scopes=[f'https://{NAMESPACE}.servicebus.windows.net/.default'])
    print("Token acquired")
    return response['access_token'], (time.time() + response['expires_in']) * 1000.0


def msg_process(msg):
    print(f'Message received: key=[{msg.key()}], value=[{msg.value()}]')


def basic_consume_loop(consumer, topics):
    try:
        consumer.subscribe(topics)

        while running:
            msg = consumer.poll(timeout=1.0)
            if msg is None:
                continue

            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    # End of partition event
                    sys.stderr.write('%% %s [%d] reached end at offset %d\n' %
                                     (msg.topic(), msg.partition(), msg.offset()))
                elif msg.error():
                    raise KafkaException(msg.error())
            else:
                msg_process(msg)
                # consumer.commit()
    finally:
        # Close down consumer to commit final offsets.
        consumer.close()


def shutdown():
    running = False


if __name__ == '__main__':
    offset_reset = 'latest'
    if FROM_BEGINNING:
        offset_reset = 'earliest'
    conf = {'bootstrap.servers': f'{NAMESPACE}.servicebus.windows.net:9093',
            'group.id': CONSUMER_GROUP,
            'auto.offset.reset': offset_reset,
            'enable.auto.commit': True,
            'security.protocol': 'sasl_ssl',
            'sasl.mechanisms': 'OAUTHBEARER',
            'oauth_cb': get_oauth_token}

    consumer = Consumer(conf)
    print("Start consuming")
    basic_consume_loop(consumer, [TOPIC])
