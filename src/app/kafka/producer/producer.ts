
import { KafkaClient, Producer, ProduceRequest } from 'kafka-node';

export class KafkaProducer {
	private _client: KafkaClient;
	private _producer: Producer;

	get producer() { return this._producer; }

	constructor(client: KafkaClient) {
		this._client = client;
		this._client.on('ready', () => {
			this.setUpProducer();
		});
	}

	public sendMessage(request: ProduceRequest) {
		this._producer.send([request], (err, data) => {
			if (err) {
				console.error(err);
			}
			console.info(data);
		});
	}

	private setUpProducer() {
		this._producer = new Producer(this._client);
		this.createTopics(['test']);
	}

	private createTopics(topics: string[]) {
		this._producer.on('ready', () => {
			this._producer.createTopics(topics, false, (err, data) => {
				if (err) {
					console.error(err);
				}
				console.info(data);
			});
		});
	}
}