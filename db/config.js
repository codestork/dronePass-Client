var path = require('path');

var knex = require('knex')({
  client : 'mysql',
  connection: {
    host: 'us-cdbr-azure-west-a.cloudapp.net',
    user: 'bfc38ca04969a4',
    password: '28b9e1e5',
    database: 'as_9f2c51cb00166ec',
    charset: 'utf8',
    reconnect: true,
  },
  pool: {
    max: 4,
    min: 0,
    idleTimeoutMillis: 60000,
    reapIntervalMillis: 2000
  }
});

var bookshelf = require('bookshelf')(knex);
module.exports = bookshelf;
//Schema

// knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     knex.schema.createTable('users', function (user) {
//       user.increments('user_id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100).unique();
//       user.string('salt', 100).unique();
//       user.integer('owner_authority').unique();
//     }).then(function(table) {
//         console.log(table)
//       });
//   }
// });


// knex.schema.hasTable('parcelData').then(function(exists) {
//   if (!exists) {
//     knex.schema.createTable('parcelData', function (parcelData) {
//       parcel.increments('parcel_gid').primary();
//       parcel.integer('user_id').references('users.user_id');
//       parcel.integer('gid').unique();
//       parcel.json('lot_geom');
//       parcel.integer('restrictionHeight');
//       parcel.integer('srid').unique();
//     }).then(function(table) {
//         console.log(table)
//       });
//   }
// });

// knex.schema.hasTable('restrictions').then(function(exists) {
//   if (!exists) {
//     knex.schema.createTable('restrictions', function (restriction) {
//       restriction.increments('restriction_id').primary();
//       restriction.integer('parcel_gid').unique().references('parcelData.parcel_gid');
//       restriction.date('start_time');
//       restriction.time('duration');
//     }).then(function(table) {
//         console.log(table)
//       });
//   }
// });

// knex.schema.hasTable('restrictionExceptions').then(function(exists) {
//   if (!exists) {
//     knex.schema.createTable('restrictionExceptions', function (exception) {
//       exception.increments('exception_id').primary();
//       exception.integer('drone_id').unique()
//       exception.integer('parcel_gid').unique().references('parcelData.parcel_gid');
//       exception.date('start_time');
//       exception.time('duration');
//     }).then(function(table) {
//         console.log(table)
//       });
//   }
// });


