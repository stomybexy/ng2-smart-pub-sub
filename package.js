Package.describe({
    name: 'jonatan:ng2-smart-pub-sub',
    version: '0.0.3',
    // Brief, one-line summary of the package.
    summary: 'Publish and subscribe to data sets without rewriting queries on client with angular2-meteor.',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/stomybexy/ng2-smart-pub-sub.git',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

// Package.registerBuildPlugin({
//     name: 'Compilers',
//     sources: [
//         'plugin/registrator.js'
//     ],
//     use: [
//         'ecmascript@0.1.4',
//         'barbatus:angular2@0.7.5'
//     ]
// });

Package.onUse(function (api) {
    api.versionsFrom('1.2.0.1');
    api.use('ecmascript@0.1.4');
    api.use('underscore@1.0.4');
    api.use('reywood:publish-composite@1.4.2', 'server');

    // api.use('barbatus:angular2@0.7.5');
    
    api.use('urigo:angular2-meteor@0.3.7');
    
    api.use('dburles:mongo-collection-instances@0.3.5');


    api.addFiles('lib/smart-publish.ts');
    
    api.addFiles('lib/smart-meteor-component.ts', 'client');
    
    api.addFiles('typings/ng2-smart-pub-sub.d.ts', 'server');
    
    
    
    api.addFiles('main.ts');
    api.addFiles('app.ts', 'client');
    
    
    api.addFiles(['system_config.js']);
    
    
});

Package.onTest(function (api) {
    api.use('underscore@1.0.4');
    api.use('ecmascript@0.1.4');
    api.use('mongo@1.1.1')
    // api.use('tinytest');
    api.use('sanjo:jasmine@0.20.3');
    api.use('velocity:console-reporter');
    
    api.use('jonatan:ng2-smart-pub-sub');
    
    
    api.addFiles('tests/smart-pub-tests.js', ['client', 'server']);
   
    
});

