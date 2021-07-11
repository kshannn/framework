// import MODEL
const { Posters, Categories, Tag } = require('../models')

const getAllCategories = async () => {
    return await Categories.fetchAll().map((category)=>{
        return [category.get('id'), category.get('name')]
    }) 
}

const getAllTags = async () => {
    return await Tag.fetchAll().map((tag) => [tag.get('id'), tag.get('name')])
}

const getPosterById = async (posterId) => {
    return await Posters.where({
        id: posterId
    }).fetch({
        require: true,
        withRelated:['tags', 'category']
    })
}

module.exports = { getAllCategories, getAllTags, getPosterById }