const bookshelf = require('../bookshelf')

const Posters = bookshelf.model('Posters', {
    tableName: 'posters',
    category() {
        return this.belongsTo('Categories')
    }
});

const Categories = bookshelf.model('Categories',{
    tableName: 'categories',
    poster() {
        return this.hasMany('Posters')
    }
})

const User = bookshelf.model('User',{
    tableName: 'users'
})

module.exports = { Posters, Categories, User };