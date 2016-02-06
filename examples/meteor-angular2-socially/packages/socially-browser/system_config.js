System.config({
  packages: {
    'socially': {
      main: 'client/login/login',
      format: 'register',
      map: {
        '.': System.normalizeSync('{socially-browser}')
      }
    }
  }
});
