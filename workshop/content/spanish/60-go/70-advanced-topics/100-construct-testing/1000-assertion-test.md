+++
title = "Pruebas de Aserción"
weight = 1000
+++

### Pruebas de Aserción Detalladas

#### Crear una prueba para la tabla de DynamoDB

{{% notice info %}} Esta sección asume que usted ha [creado el constructo contador de hits](/es/60-go/40-hit-counter.html) {{% /notice %}}

Nuestro constructo `HitCounter` crea una tabla simple de DynamoDB. Ahora, creemos una prueba que valide que la tabla está siendo creada.

`cdk init` creó un archivo de prueba llamado `cdk-workshop_test.go`.
Reemplace el conrenido del archivo con el siguiente código:

```go
package main

import (
	"testing"

	"cdk-workshop/hitcounter"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/assertions"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/jsii-runtime-go"
)

func TestHitCounterConstruct(t *testing.T) {
	defer jsii.Close()

	// GIVEN
	stack := awscdk.NewStack(nil, nil, nil)

	// WHEN
	testFn := awslambda.NewFunction(stack, jsii.String("TestFunction"), &awslambda.FunctionProps{
		Code: awslambda.Code_FromAsset(jsii.String("lambda"), nil),
		Runtime: awslambda.Runtime_NODEJS_16_X(),
		Handler: jsii.String("hello.handler"),
	})
	hitcounter.NewHitCounter(stack, "MyTestConstruct", &hitcounter.HitCounterProps{
		Downstream: testFn,
	})

	// THEN
	template := assertions.Template_FromStack(stack, nil)
	template.ResourceCountIs(jsii.String("AWS::DynamoDB::Table"), jsii.Number(1))
}

```
Esta prueba simplemente está asegurando que la pila sintetizada incluye una tabla de DynamoDB.

Ejecute la prueba.

```bash
$ go test
```

Usted debería ver una salida similar a esta:

```bash
╰─ go test
PASS
ok      cdk-workshop    6.224s
```

#### Crear una prueba para la función Lambda

Ahora adicionemos otra prueba, esta vez para la función Lambda que el constructo `HitCounter` crea.
Además de probar que la función Lambda es creada, también queremos probar que es creada con las dos variables de entorno `DOWNSTREAM_FUNCTION_NAME` & `HITS_TABLE_NAME`.

Adicione otra prueba debajo de la prueba de la tabla de DynamoDB. Si recuerda, cuando creamos la función Lambda los valores de las variables de entorno eran referencias a otros constructos.

{{<highlight go "hl_lines=6-7">}}
handler := awslambda.NewFunction(this, jsii.String("HitCounterHandler"), &awslambda.FunctionProps{
	Runtime: awslambda.Runtime_NODEJS_16_X(),
	Handler: jsii.String("hitcounter.handler"),
	Code:    awslambda.Code_FromAsset(jsii.String("lambda"), nil),
	Environment: &map[string]*string{
		"DOWNSTREAM_FUNCTION_NAME": props.Downstream.FunctionName(),
		"HITS_TABLE_NAME":          table.TableName(),
	},
})
{{</highlight>}}

En este punto no sabemos realmente cuales serán los valores de `FunctionName` o `TableName` ya que CDK calculará un hash que será añadido al final del nombre de los constructos, así que utilizaremos un valor ficticio por el momento. Una vez que ejecutemos la prueba, fallará y nos mostrará el valor esperado.

Necesitaremos comparar los valores de las estructuras, así que también necesitaremos importar un módulo que nos permita fácilmente hacer esto:
[`go-cmp`](https://pkg.go.dev/github.com/google/go-cmp/cmp)

```
go get github.com/google/go-cmp/cmp
```

No olvide adicionar el módulo a los imports

{{<highlight go "hl_lines=10">}}
import (
	"testing"

	"cdk-workshop/hitcounter"

	"github.com/aws/aws-cdk-go/awscdk/v2"
	"github.com/aws/aws-cdk-go/awscdk/v2/assertions"
	"github.com/aws/aws-cdk-go/awscdk/v2/awslambda"
	"github.com/aws/jsii-runtime-go"
	"github.com/google/go-cmp/cmp"
)
{{</highlight>}}

Cree una nueva prueba en `cdk-workshop_test.go` con el siguiente código:

```go
func TestLambdaFunction(t *testing.T) {
	defer jsii.Close()

	// GIVEN
	stack := awscdk.NewStack(nil, nil, nil)

	// WHEN
	testFn := awslambda.NewFunction(stack, jsii.String("TestFunction"), &awslambda.FunctionProps{
		Code: awslambda.Code_FromAsset(jsii.String("lambda"), nil),
		Runtime: awslambda.Runtime_NODEJS_16_X(),
		Handler: jsii.String("hello.handler"),
	})
	hitcounter.NewHitCounter(stack, "MyTestConstruct", &hitcounter.HitCounterProps{
		Downstream: testFn,
	})

	// THEN
	template := assertions.Template_FromStack(stack, nil)
	envCapture := assertions.NewCapture(nil)
	template.HasResourceProperties(jsii.String("AWS::Lambda::Function"), &map[string]any{
		"Environment": envCapture,
		"Handler": "hitcounter.handler",
	})
	expectedEnv := &map[string]any{
		"Variables": map[string]any{
			"DOWNSTREAM_FUNCTION_NAME": map[string]any{
		  		"Ref": "TestFunctionXXXXX",
			},
			"HITS_TABLE_NAME": map[string]any{
		  		"Ref": "MyTestConstructHitsXXXXX",
			},
	  	},
	}
	if !cmp.Equal(envCapture.AsObject(), expectedEnv) {
		t.Error(expectedEnv, envCapture.AsObject())
	}
}
```

Guarde el archivo y ejecute la prueba de nuevo.

```bash
$ go test
```

Esta vez la prueba debe fallar y usted podrá obtener los valores correctos para las variables de la salida.

{{<highlight bash "hl_lines=3">}}
╰─ go test
--- FAIL: TestLambdaFunction (0.04s)
    cdk-workshop_test.go:65: &map[Variables:map[DOWNSTREAM_FUNCTION_NAME:map[Ref:TestFunctionXXXXX] HITS_TABLE_NAME:map[Ref:MyTestConstructHitsXXXXX]]] &map[Variables:map[DOWNSTREAM_FUNCTION_NAME:map[Ref:TestFunction22AD90FC] HITS_TABLE_NAME:map[Ref:MyTestConstructHits24A357F0]]]
FAIL
exit status 1
FAIL    cdk-workshop    5.960s
{{</highlight>}}

Tome nota de los valores reales para las variables de entorno y actualice su prueba.

{{<highlight go "hl_lines=25 28">}}
func TestLambdaFunction(t *testing.T) {
	// GIVEN
	stack := awscdk.NewStack(nil, nil, nil)

	// WHEN
	testFn := awslambda.NewFunction(stack, jsii.String("TestFunction"), &awslambda.FunctionProps{
		Code: awslambda.Code_FromAsset(jsii.String("lambda"), nil),
		Runtime: awslambda.Runtime_NODEJS_16_X(),
		Handler: jsii.String("hello.handler"),
	})
	hitcounter.NewHitCounter(stack, "MyTestConstruct", &hitcounter.HitCounterProps{
		Downstream: testFn,
	})

	// THEN
	template := assertions.Template_FromStack(stack, nil)
	envCapture := assertions.NewCapture(nil)
	template.HasResourceProperties(jsii.String("AWS::Lambda::Function"), &map[string]any{
		"Environment": envCapture,
		"Handler": "hitcounter.handler",
	})
	expectedEnv := &map[string]any{
		"Variables": map[string]any{
			"DOWNSTREAM_FUNCTION_NAME": map[string]any{
		  		"Ref": "TestFunction22AD90FC",
			},
			"HITS_TABLE_NAME": map[string]any{
		  		"Ref": "MyTestConstructHits24A357F0",
			},
	  	},
	}
	if !cmp.Equal(envCapture.AsObject(), expectedEnv) {
		t.Error(expectedEnv, envCapture.AsObject())
	}
}
{{</highlight>}}

Ahora, ejecute la prueba de nuevo.  Esta vez debe ser exitosa.

```bash
$ go test
```

Usted debe ver una salida como la siguiente:

```bash
╰─ go test
PASS
ok      cdk-workshop    6.095s
```

Usted también puede aplicar TDD (Test Driven Development) para desarrollar Constructos de CDK. Para mostrar un ejemplo muy simple, adicionemos un nuevo requerimiento para que nuestra tabla de Dynamo DB sea encriptada.

Primero actualizaremos la prueba para reflejar este nuevo requerimiento.

{{<highlight go "hl_lines=1 19-23">}}
func TestTableCreatedWithEncryption(t *testing.T) {
	defer jsii.Close()

	// GIVEN
	stack := awscdk.NewStack(nil, nil, nil)

	// WHEN
	testFn := awslambda.NewFunction(stack, jsii.String("TestFunction"), &awslambda.FunctionProps{
		Code:    awslambda.Code_FromAsset(jsii.String("lambda"), nil),
		Runtime: awslambda.Runtime_NODEJS_16_X(),
		Handler: jsii.String("hello.handler"),
	})
	hitcounter.NewHitCounter(stack, "MyTestConstruct", &hitcounter.HitCounterProps{
		Downstream: testFn,
	})

	// THEN
	template := assertions.Template_FromStack(stack, nil)
	template.HasResourceProperties(jsii.String("AWS::DynamoDB::Table"), &map[string]any{
		"SSESpecification": map[string]any{
			"SSEEnabled": true,
		},
	})
}
{{</highlight>}}

Ahora ejecutemos la prueba, que debe fallar.

```bash
╰─ go test
--- FAIL: TestTableCreatedWithEncryption (4.51s)
panic: "Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.\nThe closest result is:\n  {\n    \"Type\": \"AWS::DynamoDB::Table\",\n    \"Properties\": {\n      \"KeySchema\": [\n        {\n          \"AttributeName\": \"path\",\n          \"KeyType\": \"HASH\"\n        }\n      ],\n      \"AttributeDefinitions\": [\n        {\n          \"AttributeName\": \"path\",\n          \"AttributeType\": \"S\"\n        }\n      ],\n      \"ProvisionedThroughput\": {\n        \"ReadCapacityUnits\": 5,\n        \"WriteCapacityUnits\": 5\n      }\n    },\n    \"UpdateReplacePolicy\": \"Delete\",\n    \"DeletionPolicy\": \"Delete\"\n  }\nwith the following mismatches:\n\tMissing key 'SSESpecification' among {KeySchema,AttributeDefinitions,ProvisionedThroughput} at /Properties/SSESpecification (using objectLike matcher)" [recovered]
        panic: "Template has 1 resources with type AWS::DynamoDB::Table, but none match as expected.\nThe closest result is:\n  {\n    \"Type\": \"AWS::DynamoDB::Table\",\n    \"Properties\": {\n      \"KeySchema\": [\n        {\n          \"AttributeName\": \"path\",\n          \"KeyType\": \"HASH\"\n        }\n      ],\n      \"AttributeDefinitions\": [\n        {\n          \"AttributeName\": \"path\",\n          \"AttributeType\": \"S\"\n        }\n      ],\n      \"ProvisionedThroughput\": {\n        \"ReadCapacityUnits\": 5,\n        \"WriteCapacityUnits\": 5\n      }\n    },\n    \"UpdateReplacePolicy\": \"Delete\",\n    \"DeletionPolicy\": \"Delete\"\n  }\nwith the following mismatches:\n\tMissing key 'SSESpecification' among {KeySchema,AttributeDefinitions,ProvisionedThroughput} at /Properties/SSESpecification (using objectLike matcher)"

goroutine 6 [running]:
testing.tRunner.func1.2({0x163f040, 0xc0002eb760})
        /usr/local/go/src/testing/testing.go:1396 +0x24e
testing.tRunner.func1()
        /usr/local/go/src/testing/testing.go:1399 +0x39f
panic({0x163f040, 0xc0002eb760})
        /usr/local/go/src/runtime/panic.go:884 +0x212
github.com/aws/jsii-runtime-go/runtime.InvokeVoid({0x16f8de0, 0xc0002fffc0}, {0x1778bcd, 0x15}, {0xc0003a5e80, 0x2, 0x2})
        /Users/woodwoop/go/pkg/mod/github.com/aws/jsii-runtime-go@v1.65.0/runtime/runtime.go:237 +0x266
github.com/aws/aws-cdk-go/awscdk/v2/assertions.(*jsiiProxy_Template).HasResourceProperties(0x1646300?, 0xc00010f2f0?, {0x15fb9c0?, 0xc0000122b0?})
        /Users/woodwoop/go/pkg/mod/github.com/aws/aws-cdk-go/awscdk/v2@v2.38.1/assertions/assertions.go:1104 +0x71
cdk-workshop.TestTableCreatedWithEncryption(0x0?)
        /Users/woodwoop/dev/CdkRepos/goWorkshop/aws-cdk-intro-workshop/code/go/main-workshop/cdk-workshop_test.go:30 +0x352
testing.tRunner(0xc0002ddba0, 0x199a290)
        /usr/local/go/src/testing/testing.go:1446 +0x10b
created by testing.(*T).Run
        /usr/local/go/src/testing/testing.go:1493 +0x35f
exit status 2
FAIL    cdk-workshop    5.667s
```

Ahora, corrijamos el problema. Actualicemos el código de hitcounter para habilitar la encripción por defecto.

{{<highlight go "hl_lines=7">}}
func NewHitCounter(scope constructs.Construct, id string, props *HitCounterProps) HitCounter {
	this := constructs.NewConstruct(scope, &id)

	table := awsdynamodb.NewTable(this, jsii.String("Hits"), &awsdynamodb.TableProps{
		PartitionKey:  &awsdynamodb.Attribute{Name: jsii.String("path"), Type: awsdynamodb.AttributeType_STRING},
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
		Encryption:    awsdynamodb.TableEncryption_AWS_MANAGED,
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

	table.GrantReadWriteData(handler)
	props.Downstream.GrantInvoke(handler)

	return &hitCounter{this, handler, table}
}
{{</highlight>}}

Ejecutemos la prueba nuevamente, esta vez debe ser exitosa.

```console
$ go test
ok      cdk-workshop    42.069s
```
