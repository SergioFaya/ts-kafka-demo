import { Consumer, KafkaClient, OffsetFetchRequest } from 'kafka-node';

export class KafkaConsumer {

	private _consumer: Consumer;

	/**
	 * Configures the consumer and topics to be used
	 */
	public setUpConsumer(client: KafkaClient) {
		const payloadConsumer = new Array<OffsetFetchRequest>();

		/* payloadConsumer.push({
			topic: 'test',
			offset: 0, // default 0
			partition: 0, // default 0
		}); */

		this._consumer = new Consumer(client, payloadConsumer, {
			autoCommit: true,
		});

	}

	get consumer() {
		return this._consumer;
	}

}
