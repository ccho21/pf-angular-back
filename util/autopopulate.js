module.exports = (field) =>
  function (next) {
    // console.log('********field********** : ', field);
    this.populate(field);
    next();
  };
