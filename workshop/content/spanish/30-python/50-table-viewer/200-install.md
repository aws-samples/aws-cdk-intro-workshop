+++
title = "Instalando la librería"
weight = 200
+++

## pip install

Antes de que podamos usar el _table viewer_ en nuestra aplicación, tendremos que 
instalar el módulo. Agregamos este código a nuestro `requirements.txt`:

{{<highlight python "hl_lines=3">}}
aws-cdk-lib==2.37.0
constructs>=10.0.0,<11.0.0
cdk-dynamo-table-view==0.2.0
{{</highlight>}}

Luego de que hayamos habilitado nuestro virtualenv, podemos instalar las dependencias requeridas.

```
$ pip install -r requirements.txt
```

Las últimas dos lineas de la respuesta (son muchas) deberían verse así:

```
Installing collected packages: cdk-dynamo-table-view
Successfully installed cdk-dynamo-table-view-0.2.0
```

----

Ahora estamos listos para agregar el _table viewer_ a nuestra aplicación.
