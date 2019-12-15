const express = require('express');
const proxy = require('express-http-proxy');

// INTERNAL SERVERS

const internalServer1 = express();
const internalServer2 = express();

internalServer1.get('/additional/index.html', function (req, res) {
  res.send('Index')
});

internalServer1.get('/simsearch', function (req, res) {
  console.log(req.originalUrl);
  res.send('biol')
});

internalServer2.get('/simsearch', function (req, res) {
  console.log(req.originalUrl);
  res.send('chem')
});

internalServer1.listen(8095);
internalServer2.listen(8192);

// PROXY

const proxyServer = express();

const SiteType = {
    ROOT: 'ROOT',    
    BIOL: 'BIOL',
    CHEM: 'CHEM',
};

function getSiteType(originalUrl) {
    switch(originalUrl) {
        case '/':
            return SiteType.ROOT;
        
        case '/simsearch?TEST_biol.CFP7':
            return SiteType.BIOL;

        case '/simsearch?TEST_chem.CFP7':
            return SiteType.CHEM;

        default:
            throw new Error('Unknown pattern: ' + originalUrl);
    }
}

function selectProxyHost(req) {
    const siteType = getSiteType(req.originalUrl);
    switch(siteType) {
        case SiteType.ROOT:
        case SiteType.BIOL:
            return 'localhost:8095';

        case SiteType.CHEM:
            return 'localhost:8192';
    }
    
}

proxyServer.use('/', proxy(selectProxyHost, {
    proxyReqPathResolver: function(req) {
        const siteType = getSiteType(req.originalUrl);
        switch(siteType) {
            case SiteType.ROOT:
                return '/additional/index.html';
            case SiteType.BIOL:
                return '/simsearch?TEST_biol.CFP7';
            case SiteType.CHEM:
                return '/simsearch?TEST_chem.CFP7';
        }
    }}
));

proxyServer.listen(8000);