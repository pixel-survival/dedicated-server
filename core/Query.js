const Serialization = require('./Serialization');

/**
 * Класс для обработки и передачи запроса к драйверу.
*/
class Query {
    /**
     * @param {object} driver Объект драйвера базы данных.
     */
	constructor(driver) {
		this._driver = driver;
		this._serialization = new Serialization(this._driver.type);
	}
	
	/**
	 * Получить записи из базы данных.
	 * 
	 * @param {string} section Раздел с записями.
	 * @param {string} field Имя поля в котором будет поиск.
	 * @param {string} value Значение по которому будет поиск.
	 * @param {array} fields Список названий полей из которых будет состоять ответ.
	 * @return {object|null} Записи.
 	 */
	async getByField(section, field, value, fields) {
		const response = await this._driver.getByField(section, this._serialization.getSerializatedInput(field, section), value);

		if (response.length > 0) {
			return this._serialization.getPayload(response, fields);
		} else {
			return null;
		}
	}

	/**
	 * Получить записи проверок из базы данных.
	 * 
	 * @param {string} id ID контрагента.
	 * @return {object|null} Записи проверок.
 	 */
	async getChecksReportByClientId(id) {
		const response = await this._driver.getChecksReportByClientId(id);

		if (response.length > 0) {
			return this._serialization.getPayload(response);
		} else {
			return null;
		}
	}

	async addCheckReport(values) {
		await this._driver.addCheckReport(values);
	}

	/**
	 * Поиск и получение записей из базы данных.
	 * 
	 * @param {string} section Раздел с записями.
	 * @param {string} value Значение по которому будет поиск.
	 * @param {array} fields Список названий полей из которых будет состоять ответ.
	 * @return {array|null} Записи.
 	 */
	 async searchByField(section, value, fields) {
		const response = await this._driver.searchByField(section, value);

		if (response.length > 0) {
			return this._serialization.getPayload(response, fields);
		} else {
			return null;
		}
	}

	/**
	 * Добавить запись.
	 * 
	 * @param {string} section Раздел с записями.
	 * @param {object} data Поля с данными.
	 */
	async add(section, data) {
		const serializatedData = {};

		for(const key in data) {
			const value = data[key] === undefined ? null : data[key];

			serializatedData[this._serialization.getSerializatedInput(key, section)] = value;
		}		

		await this._driver.add(section, serializatedData);
	}

	/**
	 * Редактировать запись.
	 * 
	 * @param {string} section Раздел с записями.
	 * @param {number} id id записи.
	 * @param {array} fields Поля с данными.
	 */
	async edit(section, id, fields) {
		const serializatedFields = {}
		
		for(const field in fields) {
			serializatedFields[this._serialization.getSerializatedInput(field, section)] = fields[field];
		}

		await this._driver.edit(section, id, serializatedFields);
	}

	/**
	 * Получить все записи из таблицы.
	 * 
	 * @param {string} section Раздел с записями.
	 * @return {array|null} Записи.
	 */
	async getSectionData(section) {
		const response = await this._driver.getSectionData(section);

		if (response.length > 0) {
			return this._serialization.getPayload(response);
		} else {
			return null;
		}
	}
}

module.exports = Query;