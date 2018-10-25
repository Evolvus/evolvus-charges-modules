// const KAFKA_BROKERS = process.env.KAFKA_BROKERS || 'localhost:9092';
// const TOPIC_NAME = process.env.AUDIT_EVENT_TOPIC || 'topic.audit.events';
// const PARTITIONS = process.env.PARTITIONS || '1';
//
// var kafka = require('kafka-node'),
//     client = new kafka.KafkaClient({ kafkaHost: KAFKA_BROKERS }),
//     Consumer = kafka.Consumer;
//
//
// var config = []
// for (var index = 0; index < parseInt(PARTITIONS); index++) {
//     config.push({ topic: TOPIC_NAME, partition: PARTITIONS });
// }
//
// module.exports.consumer = new Consumer(
//     client, config, {
//         autoCommit: true
//     }
// );