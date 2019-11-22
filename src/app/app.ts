import bodyParser from 'body-parser';
import express, { Application } from 'express';
import { KafkaClient } from 'kafka-node';
import path from 'path';
import { Swig } from 'swig';

export class AppInitializer {

	private _app: Application;
	private _client: KafkaClient;

	constructor() {
		this._app = express();
		this.config();
		this.setUpKafkaConnection();

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
		this._client = new KafkaClient();
	}

	get client() {
		return this._client;
	}

	get app(): Application {
		return this._app;
	}

}
