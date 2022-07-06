/**
 * Класс для создания данных для отправки в ответ на запрос.
*/
class Payload {
	constructor() {
		this._data = {};
	}

	/**
	 * Добавить ключ и значение.
	 * 
	 * @param {string} key 
	 * @param {string} value 
	 */
	add(key, value) {
		this._data[key] = value;
	}

	/**
	 * Получить список данных без пустых полей.
	 * 
	 * @return {object} 
	 */
	get() {
		for(const key in this._data) {
			if (this._data[key] === null) {
				delete this._data[key];
			}
		}

		return this._data;
	}
}

module.exports = Payload;