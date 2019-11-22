import { Consumer, KafkaClient, OffsetFetchRequest } from 'kafka-node';

export class KafkaConsumer {

	private _client: KafkaClient;
	private _consumer: Consumer;

	constructor(client: KafkaClient) {
		this._client = client;
		this.setUpConsumer();
	}

	/**
	 * Configures the consumer and topics to be used
	 */
	private setUpConsumer() {
		const payloadConsumer = new Array<OffsetFetchRequest>();

		/* payloadConsumer.push({
			topic: 'test',
			offset: 0, // default 0
			partition: 0, // default 0
		}); */

		this._consumer = new Consumer(this._client, payloadConsumer, {
			autoCommit: true,
		});

	}

	get consumer() {
		return this._consumer;
	}

}
