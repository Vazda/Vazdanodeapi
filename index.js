require('@babel/register')({
    plugins: [
      "@babel/plugin-proposal-class-properties"
    ],
  });
  
  require('@babel/polyfill');
  
  require('./src/server');
  