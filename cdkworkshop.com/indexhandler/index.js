'use strict';

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    var uri = request.uri;
    
    // Check whether the URI is missing a file name.
    if (uri.endsWith('/')) {
        console.log(`Redirected ${uri} as end folder`)
        request.uri += 'index.html';
    }

   callback(null, request);
}