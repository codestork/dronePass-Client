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
      parcel.increments('parcel_gid').primary();
      parcel.integer('user_id').unsigned().references('users.user_id');
      parcel.integer('gid').unique();
      parcel.json('lot_geom');
      parcel.integer('restrictionHeight');
      parcel.integer('srid')
    }).then(function(table) {
        console.log(table)
      });
  }
});

knex.schema.hasTable('restrictions').then(function(exists) {
  if (!exists) {
    knex.schema.createTable('restrictions', function (restriction) {
      restriction.increments('restriction_id').primary();
      restriction.integer('parcel_gid').unsigned().unique().references('parcelData.parcel_gid');
      restriction.date('start_time');
      restriction.time('duration');
    }).then(function(table) {
        console.log(table)
      });
  }
});

knex.schema.hasTable('restrictionExceptions').then(function(exists) {
  if (!exists) {
    knex.schema.createTable('restrictionExceptions', function (exception) {
      exception.increments('exception_id').primary();
      exception.integer('drone_id').unique()
      exception.integer('parcel_gid').unique().unsigned().references('parcelData.parcel_gid');
      exception.date('start_time');
      exception.time('duration');
    }).then(function(table) {
        console.log(table)
      });
  }
});

// For Quick drop of tables
// knex.schema.dropTable('users').then(function(){console.log('hi')})
// knex.schema.dropTable('parcelData').then(function(){console.log('hi')})
// knex.schema.dropTable('restrictions').then(function(){console.log('hi')})
// knex.schema.dropTable('restrictionExceptions').then(function(){console.log('hi')})
