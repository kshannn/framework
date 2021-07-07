const bookshelf = require('../bookshelf')

const Posters = bookshelf.model('Posters', {
    tableName: 'posters',
    category() {
        return this.belongsTo('Categories')
    },
    tags () {
        return this.belongsToMany('Tag')
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

const Tag = bookshelf.model('Tag', {
    tableName: 'tags',
    posters () {
        return this.belongsToMany('Posters')
    }
})

module.exports = { Posters, Categories, User, Tag };