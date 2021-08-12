# Data Feed Consumer

A simple consumer for Parsable Data Feed.

This consumer uses the [KafkaJS](https://github.com/tulios/kafkajs) library.

## Prerequisites

- [npm](https://www.npmjs.com/)
- [Node.js](https://nodejs.org)

## Usage

```sh-session
$ npm install -g @wearableintelligence/data-feed-consumer
$ datafeedconsumer -n namespace -h hubName -t tenantId -c clientId -s clientSecret
Starting consumer...
$ datafeedconsumer --help
USAGE
  $ datafeedconsumer COMMAND
...
```
To consume from the beginning:
```shell
$ datafeedconsumer -n namespace -h hubName -t tenantId -c clientId -s clientSecret -g consumerGroup -b
```
