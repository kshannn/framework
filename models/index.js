const bookshelf = require('../bookshelf')

const Posters = bookshelf.model('Posters', {
    tableName: 'posters',
    category () {
        return this.belongsTo('Categories')
    }
});

const Categories = bookshelf.model('Categories',{
    tableName: 'categories',
    poster() {
        return this.hasMany('Posters')
    }
})

module.exports = { Posters, Categories };