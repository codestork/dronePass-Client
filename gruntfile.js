module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
    },

    jshint: {
      files: ['gruntfile.js', 'client/**/*.js', 'client/*.js'],
      options: {
        globals: {
          jQuery: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['specs/client/authControllerSpec.js']
      }
    },
    nodemon: {
      dev: {
        script: 'main.js'
      }
    },
    uglify: {
    },
    jshint: {
      files: [
        'client/app/app.js',
        'client/app/auth/auth.js',
        'client/app/homePortal/homePortal.js',
        'client/app/services/services.js',
        'db/config.js',
        'db/models/parcelData.js',
        'db/models/user.js',
        'lib/request-handler.js',
        'lib/utility.js',
        'specs/client/authControllerSpec.js',
        'specs/client/homePortalControllerSpec.js',
        'specs/client/routingSpecs.js',
        'server.js'
      ],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'client/bower_components/**/*.js',
        ]
      }
    },

    wiredep: {

      task: {

        // Point to the files that should be updated when
        // you run `grunt wiredep`
        src: [
          'app/views/**/*.html',   // .html support...
          'app/styles/main.scss',  // .scss & .sass support...
          '.travis.yml'         // and .yml & .yaml support out of the box!
        ],

        options: {
          // See wiredep's configuration documentation for the options
          // you may pass:

          // https://github.com/taptapship/wiredep#configuration
        }
      } 
  },

    cssmin: {
    },
    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
      }
    }
  });
  
  grunt.registerTask('build', [
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-wiredep');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('default', ['jshint']);

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

    grunt.registerTask('test', [
      'mochaTest'
    ]);

    grunt.registerTask('build', [
    ]);

    grunt.registerTask('upload', function(n) {
      if(grunt.option('prod')) {
        // add your production server task here
      } else {
        grunt.task.run([ 'server-dev' ]);
      }
    });

    grunt.registerTask('deploy', [
      // add your deploy tasks here
    ]);

  };

