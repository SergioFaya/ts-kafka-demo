import { MongoHelper } from './../db/mongoConnector';
import bodyParser from 'body-parser';
import express, { Application } from 'express';
import { KafkaClient } from 'kafka-node';
import path from 'path';
import { Swig } from 'swig';
import { KafkaConsumer } from './kafka/consumer/consumer';
import { KafkaProducer } from './kafka/producer/producer';
import { MongoClient } from 'mongodb';

export class AppInitializer {

	private readonly MONGO_URL = "mongodb://localhost:27017";

	private _app: Application;
	private _client: KafkaClient;

	private _kafkaConsumer: KafkaConsumer;
	private _kafkaProducer: KafkaProducer;

	private _mongoClient: MongoClient;


	constructor() {
		this._app = express();
		this.config();
		this.setUpKafkaConnection();
		this.setUpMongoConnection();
	}

	private config(): void {
		// support application/json type post data
		this._app.use(bodyParser.json());
		// support application/x-www-form-urlencoded post data
		this._app.use(bodyParser.urlencoded({ extended: false }));
		// template engine configuration
		this._app.engine('html', new Swig().renderFile);
		this._app.set('views', path.join('src/views'));
		this._app.set('view engine', 'html');
		// recursos estáticos
		this._app.use(express.static(path.join('src/resources')));
	}

	private setUpKafkaConnection() {
		// TODO: pasar al constructor
		this._client = new KafkaClient();
		this._kafkaProducer = new KafkaProducer();
		this._kafkaProducer.setUpProducer(this._client);
		this._kafkaConsumer = new KafkaConsumer();
		this._kafkaConsumer.setUpConsumer();
	}

	private async setUpMongoConnection() {
		try {
			await MongoHelper.connect(this.MONGO_URL);
			console.info(`Connected to Mongo!`);
		} catch (err) {
			console.error(`Unable to connect to Mongo!`, err);
		}
	}

	get client() {
		return this._client;
	}

	get app(): Application {
		return this._app;
	}

	get kafkaConsumer() {
		return this._kafkaConsumer.consumer;
	}
	get kafkaProducer() {
		return this._kafkaProducer.producer;
	}
	get mongoClient(): MongoClient {
		return this._mongoClient;
	}
}
