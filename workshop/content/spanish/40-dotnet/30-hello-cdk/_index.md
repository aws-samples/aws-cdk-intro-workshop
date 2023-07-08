+++
title = "Hello, CDK!"
bookFlatSection = true
weight = 30
+++

# ¡Hola, CDK!

En este capitulo, finalmente escribiremos algún código de CDK. En vez del código de SNS/SQS que tenemos en nuestra aplicación hasta ahora, añadiremos una función Lambda con un endpoint de API Gateway en frente de ésta.

Los usuarios serán capaces de alcanzar cualquier URL en el endpoint y ellos recibirán un saludo caluroso desde nuestra función.

![](/images/hello-arch.png)

Pero antes, limpiemos nuestro código de ejemplo.