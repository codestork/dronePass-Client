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
        knex.schema.hasTable('parcelData').then(function(exists) {
          if (!exists) {
            knex.schema.createTable('parcelData', function (parcel) {
              parcel.increments('id').unique().primary();
              parcel.integer('gid').unique()
              parcel.integer('user_id').unsigned().references('users.user_id');
              parcel.string('address').unique();
              parcel.json('lot_geom');
              parcel.integer('parcel_gid').unique();
              parcel.integer('restriction_height'); //v2
              parcel.time('restriction_start_time');
              parcel.time('restriction_end_time');
            }).then(function(table) {
                console.log(table)
                knex.schema.hasTable('restrictionExemptions').then(function(exists) {
                  if (!exists) {
                    knex.schema.createTable('restrictionExemptions', function (exemption) {
                      exemption.integer('exemption_id').primary();
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





// For Quick drop of tables
// knex.schema.dropTable('restrictionExemptions').then(function(){
//     console.log('droped Exemptions')
//     knex.schema.dropTable('parcelData').then(function(){
//       console.log('dropped parcelData')}) 
//     knex.schema.dropTable('users').then(function(){console.log('dropped Users')})   
// })

