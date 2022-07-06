const express = require('express');
const mysql = require('mysql2');
const helmet = require('helmet');
const cors = require('cors');
const { json } = require('body-parser');

const Payload = require('./core/Payload');
const RequiredFields = require('./core/RequiredFields');
const ServiceResponse = require('./core/ServiceResponse');

const config = require('./config/app');

// init
const app = express();
const serviceResponse = new ServiceResponse();

app.use(helmet());
app.use(cors());
app.use(serviceResponse.checkHeaders('content-type', ['POST']));
app.use(json());
app.use(serviceResponse.checkInvalidJSON);

app.post('/auth/', (request, response) => {
    const login = request.body.login;
    const password = request.body.password;
    const payload = new Payload();
	const requiredFields = new RequiredFields(RequiredFields.auth.login, { login, password });
    
    if (!requiredFields.state) {
		payload.add('status', 'error');
		payload.add('message', requiredFields.message);
		response.send(payload.get());

		return;
	}

    response.send(payload.get());
})

app.post('/logout/', (request, response) => {
    const token = request.body.token;
})

app.listen(7777);