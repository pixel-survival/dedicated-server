class Libs {
  fixedNumber(number, count) {
    const fixed = number.toFixed(count);
  
    return Number(fixed);
  }
}

module.exports = new Libs();