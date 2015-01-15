var path = require('path');

// connection to external database on AWS
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

//Schema Builder
// There are three main tables in the MySQL database - users, parcelData,
// and restrictionExemptions. users: parcelData has a one-to-many relationship, and
// parcelData: restrictionExemptions also has a one-to-many relationship. 
//
knex.schema.hasTable('users').then(function(exists) {
  if (!exists) {
    knex.schema.createTable('users', function (user) {
      user.increments('id').primary();
      user.string('username', 100).unique();
      user.string('password', 100);
      user.string('name',100);
      user.integer('owner_authority'); // [ToDo: add administrative levels]
    }).then(function(table) {
        console.log(table)
        knex.schema.hasTable('parcelData').then(function(exists) {
          if (!exists) {
            knex.schema.createTable('parcelData', function (parcel) {
              parcel.increments('id').unique().primary();
              parcel.integer('gid').unique()
              parcel.integer('user_id').unsigned().references('users.id');
              parcel.string('address').unique();
              parcel.json('lot_geom'); // geojson properties for a given parcel id
              parcel.integer('parcel_gid').unique();
              parcel.integer('restriction_height'); //v2 incorporate height changes
              parcel.time('restriction_start_time');
              parcel.time('restriction_end_time');
            }).then(function(table) {
                console.log(table)
                knex.schema.hasTable('restrictionExemptions').then(function(exists) {
                  if (!exists) {
                    knex.schema.createTable('restrictionExemptions', function (exemption) {
                      exemption.integer('exemption_id').primary(); // exememptions are granted on a drone-by-drone basis
                      exemption.integer('drone_id').unique()
                      exemption.integer('parcel_gid').unique().references('parcelData.parcel_gid');
                      exemption.time('exemption_start_time');
                      exemption.time('exemption_end_time');
                    }).then(function(table) {
                        console.log(table)
                      });
                  }
                });
              });
          }
        });
      });
  }
});





/****** For Quick drop of all tables, uncomment this section **********/

// knex.schema.dropTable('restrictionExemptions').then(function(){
//     console.log('droped Exemptions')
//     knex.schema.dropTable('parcelData').then(function(){
//       console.log('dropped parcelData')}) 
//     knex.schema.dropTable('users').then(function(){console.log('dropped Users')})   
// })

