+++
title = "Definir recursos"
weight = 300
+++

## Agregue recursos a la construcción del contador de solicitudes 

Ahora, definamos la función AWS Lambda y la tabla DynamoDB en nuestro constructo `HitCounter`. Regrese a `hitcounter/hitcounter.go`  y agregue el siguiente código resaltado:

{{<highlight go "hl_lines=4 7 16 21 27-41 44-46">}}
package hitcounter

import (
	"github.com/aws/aws-cdk-go/awscdk/v2/awsdynamodb"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/constructs-go/constructs/v10"
	"github.com/aws/jsii-runtime-go"
)

type HitCounterProps struct {
	Downstream awslambda.IFunction
}

type hitCounter struct {
	constructs.Construct
	handler awslambda.IFunction
}

type HitCounter interface {
	constructs.Construct
	Handler() awslambda.IFunction
}

func NewHitCounter(scope constructs.Construct, id string, props *HitCounterProps) HitCounter {
	this := constructs.NewConstruct(scope, &id)

	table := awsdynamodb.NewTable(this, jsii.String("Hits"), &awsdynamodb.TableProps{
		PartitionKey: &awsdynamodb.Attribute{Name: jsii.String("path"), Type: awsdynamodb.AttributeType_STRING},
	})

	handler := awslambda.NewFunction(this, jsii.String("HitCounterHandler"), &awslambda.FunctionProps{
		Runtime: awslambda.Runtime_NODEJS_16_X(),
		Handler: jsii.String("hitcounter.handler"),
		Code:    awslambda.Code_FromAsset(jsii.String("lambda"), nil),
		Environment: &map[string]*string{
			"DOWNSTREAM_FUNCTION_NAME": props.Downstream.FunctionName(),
			"HITS_TABLE_NAME":          table.TableName(),
		},
	})

	return &hitCounter{this, handler}
}

func (h *hitCounter) Handler() awslambda.IFunction {
	return h.handler
}
{{</highlight>}}

## ¿Qué hicimos aquí?

Este código es bastante fácil de entender:

* Definimos una tabla de DynamoDB con `path` como partition key (todas las tablas de DynamoDB debe tener una sola partition key).
* Definimos una función Lambda que está vinculada al código `lambda/hitcount.handler`.
* __Conectamos__ las variables de entorno de Lambda a `FunctionName` y `TableName` de nuestros recursos.

## Valores enlazados en tiempo de ejecución

Las propiedades `FunctionName` y `TableName` son valores que solo se resuelven cuando deplegamos nuestro stack (observe que no hemos configurado estos nombres físicos cuando definimos la tabla/función, solo ID lógicos). Esto significa que si imprime sus valores durante la síntesis, obtendrá un "TOKEN", que es cómo el CDK representa estos valores enlazados en tiempo de ejecución. Debe tratar los tokens como *opaque strings*. Esto significa que puede concatenarlos juntos, por ejemplo, pero no caiga en la tentación de analizarlos en su código.
