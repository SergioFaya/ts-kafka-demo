import { ProduceRequest } from 'kafka-node';
import { AppInitializer } from './app/app';
import { KafkaConsumer } from './app/kafka/consumer/consumer';
import { KafkaProducer } from './app/kafka/producer/producer';

const init = new AppInitializer();
const app = init.app;
const PORT = 8080;

const kafkaConsumer = new KafkaConsumer();
const kafkaProducer = new KafkaProducer();

init.client.on("ready", () => {
	kafkaConsumer.setUpConsumer(init.client);
	kafkaProducer.setUpProducer(init.client);

	kafkaConsumer.consumer.on('message', (message: any) => {
		console.info(message);
		data.push(message);
	});

	kafkaConsumer.consumer.on('error', (err: any) => {
		console.error(err);
	});
});

const options = [
	{
		'id': 1,
		'color': 'red',
		'text': 'PSOE'
	},
	{
		'id': 4,
		'color': 'blue',
		'text': 'PP',
	},
	{
		'id': 2,
		'text': 'PSOE',
	},

];

const data = [{
	"partido": "Vox",
	"votos": 1,
	"color": '#16c42a'
}, {
	"partido": "PSOE",
	"votos": 1
}, {
	"partido": "PP",
	"votos": 2
}, {
	"partido": "Podemos",
	"votos": 3
}];

app.get('/', (_req, res) => {
	res.redirect('/votes');
});

app.get('/votes', (req, res) => {
	res.render('dashboard.html');
});

app.get('/votes/vote', (req, res) => {
	res.render('votingList.html', { options });
});

app.post('/votes/vote', (req, res) => {
	const id = req.body.id;
	if (id) {
		// filtrar el topic y enviar, o solamente enviar
		const message: ProduceRequest = {
			topic: 'test',
			messages: id,
		};
		kafkaProducer.producer.send([message], (err, data) => {
			if (err) {
				console.log(err);
				res.status(500).json({ message: 'Error', timestamp: Date.now(), err });

			} else {
				res.status(202).json({ message: 'Success', timestamp: Date.now(), data });

			}
		});
	} else {
		res.status(412).json({ message: 'Validation error', timestamp: Date.now() });
	}
});

app.get('/data', (_req, res) => {
	res.json(data);
});

app.listen(PORT, () => {
	console.info('Express server listening on port ' + PORT);
});
