var path = require('path');

var knex = require('knex')({
  client : 'mysql',
  connection: {
    host: 'dronepass.cmejl7nwslyb.us-west-2.rds.amazonaws.com',
    user: 'dronepass',
    password: 'laddladd',
    database: 'dronepassclient',
    port: 3306,
    reconnect: true,
  },
});



var bookshelf = require('bookshelf')(knex);
module.exports = bookshelf;
//Schema
knex.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    knex.schema.createTable('users', function (user) {
      user.increments('user_id').primary()
      user.string('username', 100).unique();
      user.string('password', 100)
      user.integer('name',100)
      user.integer('owner_authority')
    }).then(function(table) {
        console.log(table)
      });
  }
});

knex.schema.hasTable('parcelData').then(function(exists) {
  if (!exists) {
    knex.schema.createTable('parcelData', function (parcel) {
      parcel.integer('gid').primary();
      parcel.integer('user_id').unsigned().references('users.user_id');
      parcel.string('address').unique();
      parcel.json('lot_geom');
      parcel.integer('parcel_gid').unique();
      parcel.integer('restrictionHeight'); //v2
      parcel.time('restriction_start_time');
      parcel.time('restriction_end_time');
    }).then(function(table) {
        console.log(table)
      });
  }
});

knex.schema.hasTable('restrictionExceptions').then(function(exists) {
  if (!exists) {
    knex.schema.createTable('restrictionExceptions', function (exception) {
      exception.integer('exception_id').primary();
      exception.integer('drone_id').unique()
      exception.integer('parcel_gid').unique().references('parcelData.parcel_gid');
      exception.time('exception_start_time');
      exception.time('exception_end_time');
    }).then(function(table) {
        console.log(table)
      });
  }
});

// For Quick drop of tables
// knex.schema.dropTable('users').then(function(){console.log('hi')})
// knex.schema.dropTable('parcelData').then(function(){console.log('hi')})
// knex.schema.dropTable('restrictionExceptions').then(function(){console.log('hi')})
