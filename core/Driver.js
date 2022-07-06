const Serialization = require('./Serialization');

/**
 * Драйвер для обращения к базе данных.
*/
class Driver {
	/**
	 * @param {string} type Тип базы данных.
	 * @param {object} db Экземпляр базы данных.
	 */
	constructor(type, db) {
		this._type = type;
		this._db = db;
		this._serialization = new Serialization(this._type);
	}

	/**
	 * Тип базы данных.
	 * 
	 * @type {string}
	 */
	get type() {
		return this._type;
	}

	/**
	 * Получить записи из базы данных.
	 * 
	 * @param {string} section Раздел с записями.
	 * @param {string} field Имя поля в котором будет поиск.
	 * @param {string} value Значение по которому будет поиск.
	 * @return {array} Записи.
 	 */
	async getByField(section, field, value) {
		const response = await this._call('getByField', { section, field, value });

		return response;
	}

	async getSectionData(section) {
		const response = await this._call('getSectionData', { section });

		return response;
	}

	/**
	 * Получить записи проверок из базы данных.
	 * 
	 * @param {*} id ID контрагента.
	 * @returns {array} Записи проверок.
	 */
	async getChecksReportByClientId(id) {
		const response = await this._call('getChecksReportByClientId', { id });

		return response;
	}

	async addCheckReport(values) {
		const response = await this._call('addCheckReport', { values });

		return response;
	}

	/**
	 * Поиск и получение записей из базы данных.
	 * 
	 * @param {string} section Раздел с записями.
	 * @param {string} value Значение по которому будет поиск.
	 * @return {array} Записи.
 	 */
	 async searchByField(section, value) {
		const response = await this._call('searchByField', { section, value });

		return response;
	}

	/**
	 * Добавить запись.
	 * 
	 * @param {string} section Раздел с записями.
	 * @param {object} fields Поля с данными.
	 */
	async add(section, fields) {
		await this._call('add', { section, fields });
	}

	/**
	 * Редактировать запись.
	 * 
	 * @param {string} section Раздел с записями.
	 * @param {number} id id записи.
	 * @param {object} fields Поля с данными.
	 */
	async edit(section, id, fields) {
		await this._call('edit', { section, id, fields });
	}

	/**
	 * Вызова метода на основе драйвера.
	 * 
	 * @private
	 * @param {string} method Имя метода, который будет вызван.
	 * @param {object} params Список параметров передающихся в метод.
	 * @returns {*} Возвращает то, что возвращает вызванный метод.
	 */
	async _call(method, params) {
		return await this[`_${this._type}_${method}`](params);
	}

	/**
	 * MySQL Получить записи.
	 * 
	 * @private
	 * @param {object} params
	 * @param {string} params.section Раздел с записями.
	 * @param {number} params.field Имя поля в котором будет поиск.
	 * @param {object} params.value Значение по которому будет поиск.
	 * @return {array} Список найденных записей.
	 */
	async _mysql_getByField({ section, field, value }) {
		const [rows] =  await this._db.promise().query(`SELECT * FROM ${section} WHERE ${field} = ${value}`);

		return rows;
	}

	async _mysql_getSectionData({ section }) {
		const [rows] =  await this._db.promise().query(`SELECT * FROM ${section}`);

		return rows;
	}

	/**
	 * MySQL Получить записи проверок.
	 * 
	 * @private
	 * @param {object} params
	 * @param {string} params.id ID контрагента.
	 * @return {array} Список найденных записей проверок.
	 */
	async _mysql_getChecksReportByClientId({ id }) {
		const [rows] =  await this._db.promise().query(`
			SELECT 
			cl_checks.CLIENT_ID,
			checks.Check_Id,
			checks.INITBY_ID,
			users.USER_NAME,
			checks.CHECKEDBY_ID,
			users_1.USER_NAME,
			checks.Reason_ID,
			Reasons.Reason_NAME,
			checks.ACTIVE_ID,
			actives_1.ACTIVE_ID,
			actives_1.ACTIVE_NAME,
			actives.ACTIVE_NAME,
			checks.Decision_ID,
			decisions.DECISION_NAME,
			checks.SUMM,
			checks.ISSUE_DATE,
			checks.CHECK_DATE,
			checks.COMMENTS
			FROM ((((((cl_checks 
				INNER JOIN checks ON cl_checks.CHECK_ID = checks.CHECK_ID)
				INNER JOIN users ON checks.INITBY_ID = users.USER_ID)
				INNER JOIN users AS users_1 ON checks.CHECKEDBY_ID = users_1.USER_ID)
				INNER JOIN reasons ON checks.Reason_id = reasons.Reason_id)
				INNER JOIN actives ON checks.ACTIVE_ID = actives.ACTIVE_ID)
				INNER JOIN actives as actives_1 ON checks.ACTIVE_Check_ID = actives_1.ACTIVE_ID)
				INNER JOIN decisions ON checks.Decision_ID = decisions.DECISION_ID
				WHERE  CL_CHECKS.CLIENT_ID IN (${id})
				ORDER BY CHECKS.CHECK_DATE DESC
		`);

		return rows;
	}

	async _mysql_addCheckReport({ values }) {
		const nameId = this._serialization.getSerializatedInput('id', 'checks');
		const lastRow = await this._mysql_getLastRowByField(nameId, 'checks');
		const id = ++lastRow[nameId];

		await this._db.promise().query('START TRANSACTION');
		await this._db.promise().query(`
			INSERT INTO checks (CHECK_ID, ACTIVE_ID, REASON_ID, INITBY_ID, ACTIVE_CHECK_ID, CHECKEDBY_ID, DECISION_ID, COMMENTS)
			VALUES(${id}, ${values.activeId}, ${values.reasonId}, ${values.initbyId}, 2, ${values.checkedbyId}, ${values.decisionId}, "${values.description}");
		`);

		await this._db.promise().query(`
		INSERT INTO cl_checks (CLIENT_ID, CHECK_ID, RELATION_TYPE_ID, REL_TYPE_RISK_ID)
			VALUES(${values.clientId}, ${id}, ${values.relationTypeId}, ${values.relationTypeRiskId});`);
			await this._db.promise().query('COMMIT');
	}

	/**
	 * MySQL Поиск записей.
	 * 
	 * @private
	 * @param {object} params
	 * @param {string} params.section Раздел с записями.
	 * @param {object} params.value Значение по которому будет поиск.
	 * @return {array} Список найденных записей.
	 */
	 async _mysql_searchByField({ section, value }) {
		const nameId = this._serialization.getSerializatedInput('id', section);
		const fullTextKey = this._serialization.getSerializatedFullTextKey(section);
		const matching = value.split(' ').map(item => `+${item}*`).join(' ');
		
		const [rows] =  await this._db.promise().query(`SELECT * FROM ${section} WHERE (MATCH (${fullTextKey}) AGAINST ('${matching}' IN BOOLEAN MODE)) ORDER BY ${section}.${nameId} DESC LIMIT 100`);

		return rows;
	}
	
	/**
	 * MySQL Получить последнюю запись.
	 * 
	 * @private
	 * @param {string} field Название поля.
	 * @param {string} section Раздел с записями.
	 * @return {object} Последняя запись.
	 */
	async _mysql_getLastRowByField(field, section) {
		const [rows] = await this._db.promise().query(`SELECT ${field} FROM ${section} ORDER BY ${field} DESC LIMIT 1`);

		return rows[0];
	}

	/**
	 * MySQL Добавить запись.
	 * 
	 * @private
	 * @param {object} params
	 * @param {string} params.section Раздел с записями.
	 * @param {object} params.fields Данные для добавления.
	 */
	async _mysql_add({ section, fields }) {
		const nameId = this._serialization.getSerializatedInput('id', section);
		const lastRow = await this._mysql_getLastRowByField(nameId, section);
		const id = ++lastRow[nameId];
		const names = [];
		const values = [];

		names.push(nameId);
		values.push(id);

		for(const field in fields) {
			names.push(field);
			values.push(`'${fields[field]}'`);
		}

		await this._db.promise().query(`INSERT INTO ${section}(${names.join(',')}) VALUES(${values.join(',')})`);		
	}

	/**
	 * MySQL Редактировать запись.
	 * 
	 * @private
	 * @param {object} params
	 * @param {string} params.section Раздел с записями.
	 * @param {number} params.id id записи.
	 * @param {object} params.fields Поля с новыми данными.
	 */
	async _mysql_edit({ section, id, fields }) {
		const nameId = this._serialization.getSerializatedInput('id', section);
		const parts = {
			set: ''
		};
		
		for(const field in fields) {
			parts.set += `SET ${field} = '${fields[field]}'`;
		}
		
		await this._db.promise().query(`UPDATE ${section} ${parts.set} WHERE ${nameId} = ${id}`);
	}
}

module.exports = Driver;