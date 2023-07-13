                                       +++
title = "Controlador del contador de solicitudes"
weight = 100
+++

## Controlador de Lambda para el Hit counter

Ahora escribiremos el código del controlador Lambda para nuestro contador de solicitudes.

Cree el archivo `lambda/hitcounter.js`:

```js
const { DynamoDB, Lambda } = require('aws-sdk');

exports.handler = async function(event) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  // update dynamo entry for "path" with hits++
  await dynamo.updateItem({
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: { S: event.path } },
    UpdateExpression: 'ADD hits :incr',
    ExpressionAttributeValues: { ':incr': { N: '1' } }
  }).promise();

  // call downstream function and capture response
  const resp = await lambda.invoke({
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event)
  }).promise();

  console.log('downstream response:', JSON.stringify(resp, undefined, 2));

  // return response back to upstream caller
  return JSON.parse(resp.Payload);
};
```

## Descubriendo recursos en tiempo de ejecución 

Notarás que este código se basa en dos variables de entorno: 

 * `HITS_TABLE_NAME` es el nombre de la tabla de DynamoDB que se usará para el almacenamiento. 
 * `DOWNSTREAM_FUNCTION_NAME` es el nombre de la función downstream de AWS Lambda.

Dado que el nombre real de la tabla y la función downstream solo se decidirán cuando implementemos nuestra aplicación, debemos conectar estos valores desde nuestro constructo. Lo haremos en la siguiente sección.