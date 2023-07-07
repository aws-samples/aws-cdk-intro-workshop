+++
title = "Pruebas de Validación"
weight = 2000
+++

### Pruebas de Validación

Algunas veces queremos que las entradas sean configurables, pero a la misma vez queremos poner restricciones en las entradas o validar que los valores asignados a ellas sean correctos.

Supongamos que para el constructo `HitCounter` queremos permitir al usuario especificar la capacidad de lectura (`read_capacity`) en la tabla de DynamoDB, pero también queremos asegurar que el valor asignado está dentro de un rango razonable. Podemos escribir una prueba que asegure que la lógica de validación trabaje: pasar valores no válidos y observar el resultado.

Primero, adicionemos la propiedad `read_capacity` a `HitCounter`:

{{<highlight go "hl_lines=4">}}
type HitCounterProps struct {
  // Downstream is the function for which we want to count hits
	Downstream   awslambda.IFunction
	ReadCapacity float64
}
{{</highlight>}}

Luego, actualizemos la tabla de DynamoDB para adicionar la propiedad `read_capacity`.

{{<highlight go "hl_lines=5">}}
	table := awsdynamodb.NewTable(this, jsii.String("Hits"), &awsdynamodb.TableProps{
		PartitionKey:  &awsdynamodb.Attribute{Name: jsii.String("path"), Type: awsdynamodb.AttributeType_STRING},
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
		Encryption:    awsdynamodb.TableEncryption_AWS_MANAGED,
		ReadCapacity:  &props.ReadCapacity,
	})
{{</highlight>}}

Ahora adicionemos una validación que generará un error si la propiedad `read_capacity` no está dentro del rango permitido.

{{<highlight go "hl_lines=2-4">}}
func NewHitCounter(scope constructs.Construct, id string, props *HitCounterProps) HitCounter {
	if props.ReadCapacity < 5 || props.ReadCapacity > 20 {
		panic("ReadCapacity must be between 5 and 20")
	}
{{</highlight>}}

No olvidemos pasar el valor para *ReadCapacity* en nuestra aplicación donde creamos HitCounter, y tambiên en las pruebas existentes.

{{<highlight go "hl_lines=3">}}
hitcounter := hitcounter.NewHitCounter(stack, "HelloHitCounter", &hitcounter.HitCounterProps{
	Downstream:   helloHandler,
	ReadCapacity: 10,
})
{{</highlight>}}

Y por último, adicionemos una prueba que valide si se generó un error.

```go
func TestCanPassReadCapacity(t *testing.T) {
  defer jsii.Close()
  defer func() {
    if r := recover(); r == nil {
      t.Error("Did not throw ReadCapacity error")
    }
  }()

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
    ReadCapacity: 10,
  })
}
```

Ejecutemos la prueba.

```bash
$ go test
```

Usted debería ver una salida similar a esta:

```bash
╰─ go test
--- FAIL: TestCanPassReadCapacity (0.01s)
    cdk-workshop_test.go:78: Did not throw ReadCapacity error
FAIL
exit status 1
FAIL    cdk-workshop    5.442s
```

Ahora cambiemos el valor de *ReadCapacity* de tal manera que este fuera del rango válido.

{{<highlight go "hl_lines=19">}}
func TestCanPassReadCapacity(t *testing.T) {
  defer func() {
    if r := recover(); r == nil {
      t.Error("Did not throw ReadCapacity error")
    }
  }()

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
    ReadCapacity: 21,
  })
}
{{</highlight>}}

Y si ejecutamos la prueba de nuevo deberá ser existosa.

```bash
╰─ go test
PASS
ok      cdk-workshop    5.384s
```
