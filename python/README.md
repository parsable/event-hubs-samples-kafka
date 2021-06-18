## Receive messages from Event Hubs using Kafka client

### Requirements

* python 3
* pip 3

### Configuration

Update `.env` configuration file with your parameters.

### Run

1. Create a virtual env:
    ```bash
    virtualenv -p python3 testconsumer
    ```
1. Activate virtual env
   ```bash
   source testconsumer/bin/activate
    ```
1. Install requirements
   ```bash
   pip3 install -r requirements.txt
    ```
1. Run the consumer
    ```bash
    python3 main.py
    ```
