'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.addColumn('posters','category_id',{
    type:'int',
    notNull: true,
    unsigned: true, 
    foreignKey:{
      name: 'poster_category_fk',
      table: 'categories',
      rules: {
        onDelete: 'cascade',
        onUpdate: 'restrict'
      },
      mapping: 'id'
    }
  });
};

exports.down = function(db) {
  return db.dropTable('add_fk_to_posters');
};

exports._meta = {
  "version": 1
};
