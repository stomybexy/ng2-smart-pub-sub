System.config({
    packages: {
        'ng2-smart-pub': {
            main: 'main',
            format: 'register',
            map: {
                '.': System.normalizeSync('{jonatan:ng2-smart-pub-sub}')
            }
        },
        'ng2-smart-sub': {
            main: 'app',
            format: 'register',
            map: {
                '.': System.normalizeSync('{jonatan:ng2-smart-pub-sub}')
            }
        }
    }
});