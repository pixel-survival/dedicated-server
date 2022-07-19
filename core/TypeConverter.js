class TypeConverter {
  toNumber(value) {
    if (!value || isNaN(value)) {
      return value;
    } else {
      return Number(value);
    }
  }

  toAbsNumber(value) {
    if (!value || isNaN(value)) {
      return value;
    } else {
      return Math.abs(Number(value));
    }
  }
}

module.exports = TypeConverter;