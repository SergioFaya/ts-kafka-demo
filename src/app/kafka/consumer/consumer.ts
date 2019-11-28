import { Consumer, KafkaClient, Message, Offset } from 'kafka-node';
import Vote from '../../../model/vote';

export class KafkaConsumer {

	public static consumedData = new Array<Vote>();
	private _consumer: Consumer;

	get consumer() { return this._consumer; }

	/**
	 * Configures the consumer and topics to be used
	 */
	public setUpConsumer() {
		const client = new KafkaClient({ kafkaHost: 'localhost:9092' });
		const topics = [{ topic: 'test' }];
		const options = { autoCommit: true, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024 };

		let consumer = new Consumer(client, topics, options);
		let offset = new Offset(client);

		consumer.on('message', function (message: Message) {
			const messageObject: Vote = JSON.parse(message.value as string);
			const option = messageObject.option as string;
			const currentVote = KafkaConsumer.consumedData.find((x) => x.option === option);
			const index = KafkaConsumer.consumedData.findIndex((x) => x.option === option);
			let votes = currentVote != null && currentVote != undefined ? currentVote.votes : 0;
			if (index != -1) {
				KafkaConsumer.consumedData[index] = { votes: ++votes, option, color: messageObject.color };
			} else {
				KafkaConsumer.consumedData.push({ votes: ++votes, option, color: messageObject.color });
			}

			console.log(message);
		});

		consumer.on('error', function (err) {
			console.log('error', err);
		});

		/*
		* If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
		*/
		consumer.on('offsetOutOfRange', function (topic) {
			topic.maxNum = 2;
			offset.fetch([topic], function (err, offsets) {
				if (err) {
					return console.error(err);
				}
				let min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
				consumer.setOffset(topic.topic, topic.partition, min);
			});
		});

	}

}
