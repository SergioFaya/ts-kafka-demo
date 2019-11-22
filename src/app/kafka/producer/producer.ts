
import { KafkaClient, Producer, ProduceRequest } from 'kafka-node';

export class KafkaProducer {
	private _producer: Producer;

	get producer() { return this._producer; }

	public sendMessage(request: ProduceRequest) {
		this._producer.send([request], (err, data) => {
			if (err) {
				console.error(err);
			}
			console.info(data);
		});
	}
	public setUpProducer(client: KafkaClient) {
		this._producer = new Producer(client);
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