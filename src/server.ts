import { ProduceRequest } from 'kafka-node';
import * as _ from 'underscore.string';
import { AppInitializer } from './app/app';
import { MongoHelper } from './db/mongoConnector';
import Vote from './model/vote';
import { KafkaConsumer } from './app/kafka/consumer/consumer';
const PORT = 8080;
const init = new AppInitializer();
const app = init.app;

app.get('/data', (_req, res) => {
	// res.json({ color: 'red', option: 'Vive', votes: 1 } as Vote);
	res.json(KafkaConsumer.consumedData);
});

app.get('/', (_req, res) => {
	res.redirect('/votes');
});

app.get('/votes', (req, res) => {
	res.render('dashboard.html');
});

app.get('/votes/configure', (req, res) => {
	MongoHelper.client.db('options').collection('options').find({}).toArray().then((options) => {
		res.render('configureVotes.html', { options });
	}).catch((err) => {
		res.status(500).json({ message: 'Error', timestamp: Date.now(), err });
	});
});

app.post('/votes/configure/remove', (req, res) => {
	const key = req.body.option;

	MongoHelper.client.db('options').collection('options').remove({ option: key }).then(() => {
		//res.redirect('/votes/configure');
		res.status(202).json({ message: 'Success', timestamp: Date.now() });
	}).catch((err) => {
		res.status(500).json({ message: 'Error', timestamp: Date.now(), err });
	});

});

app.post('/votes/configure/add', async (req, res) => {
	const valid = await validateOption(req.body.color, req.body.option);
	if (valid) {
		const option: Vote = {
			votes: 0,
			color: req.body.color,
			option: req.body.option
		};
		MongoHelper.client.db('options').collection('options').insertOne(option).then(() => {
			res.redirect('/votes/configure');
		}).catch((err) => {
			res.status(500).json({ message: 'Error', timestamp: Date.now(), err });
		});
	} else {
		MongoHelper.client.db('options').collection('options').find({}).toArray().then((options) => {
			res.render('configureVotes.html', { options, message: 'Validation error' });
		}).catch((err) => {
			res.status(500).json({ message: 'Error', timestamp: Date.now(), err });
		});
	}
});

app.get('/votes/vote', (req, res) => {
	MongoHelper.client.db('options').collection('options').find({}).toArray().then((options) => {
		res.render('votingList.html', { options });
	}).catch((err) => {
		res.render('votingList.html', { message: 'Error interno' });

	});
});

app.post('/votes/vote', (req, res) => {
	const option = req.body.option;
	if (option) {
		// filtrar el topic y enviar, o solamente enviar
		const message: ProduceRequest = {
			topic: 'test',
			messages: option,
		};
		init.kafkaProducer.send([message], (err, data) => {
			if (err) {
				MongoHelper.client.db('options').collection('options').find({}).toArray().then((options) => {
					res.render('votingList.html', { options, message: 'Kafka error' });
				}).catch((err) => {
					res.status(500).json({ message: 'Error', timestamp: Date.now(), err });
				});

			} else {
				MongoHelper.client.db('options').collection('options').find({}).toArray().then((options) => {
					res.render('votingList.html', { options, message: 'Vote sent' });
				}).catch((err) => {
					res.status(500).json({ message: 'Error', timestamp: Date.now(), err });
				});
			}
		});
	} else {
		MongoHelper.client.db('options').collection('options').find({}).toArray().then((options) => {
			res.render('votingList.html', { options, message: 'Validation error' });
		}).catch((err) => {
			res.status(500).json({ message: 'Error', timestamp: Date.now(), err });
		});
	}
});

app.listen(PORT, () => {
	console.info('Express server listening on port ' + PORT);
});


function validateOption(color: any, option: any) {
	if (_.isBlank(color) || _.isBlank(option)) {
		return false;
	} else {
		return true;
	}
}