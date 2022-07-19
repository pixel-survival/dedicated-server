/**
 * Класс для проверки полей на входе.
*/
class RequiredFields {
	/**
	 * @param {array} fields Список с названиями полей и их тип данных.
	 * @param {object} values Объект с данными для проверки.
	 */
	constructor(fields, values) {
		this._fields = fields;
		this._values = values;
		this._state = null;
		this._message = null;
		this._init();
	}

	/**
	 * Состояние проверки.
	 * 
	 * @return {boolean}
	 */
	get state() {
		return this._state;
	}

	/**
	 * Сообщениие об ошибке если проверка не прошла.
	 * 
	 * @return {string}
	 */
	get message() {
		return this._message;
	}

	/**
	 * Проверка полей.
	 */
	_check() {
		for (let i = 0; i < this._fields.length; i++) {
			const field = this._fields[i];
			const value = this._values[field.name];

			if (value === undefined || value === null) {
				this._state = false;
				this._message = `Value cannot be empty for ${field.name}.`;

				return;
			}

			if (typeof value !== field.type) {
				this._state = false;
				this._message = `Invalid data type for ${field.name}. Expected: ${field.type}, instead got: ${typeof value}.`;

				return;
			}

			if (field.type === 'string') {
				if (value.length < field.length.min || value.length > field.length.max) {
					this._state = false;
					this._message = `Value out of range for ${field.name}. Expected: min ${field.length.min}, max ${field.length.max}, instead got: ${value.length}.`;

					return;
				}
			}

			if (field.type === 'number') {
				if (field.length && (value.toString().length < field.length || value.toString().length > field.length )) {
					this._state = false;
					this._message = `Invalid value length for ${field.name}. Expected: ${field.length}, instead got: ${value.toString().length}.`;

					return;
				}
			}
		}

		this._state = true;
		this._message = null;
	}

	/**
	 * Инициализация
	 */
	_init() {
		this._check();
	}

	static get auth() {
		return {
			get login() {
				return require('./../required_fields/auth/login');
			},
			get logout() {
				return require('./../required_fields/auth/logout');
			}
		}
	}
}

module.exports = RequiredFields;