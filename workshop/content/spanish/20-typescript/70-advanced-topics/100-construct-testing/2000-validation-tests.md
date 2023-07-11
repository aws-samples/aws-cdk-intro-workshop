+++
title = "Pruebas de Validación"
weight = 300
+++

### Pruebas de Validación

Algunas veces queremos que las entradas sean configurables, pero a la misma vez queremos poner restricciones en las entradas o validar que los valores asignados a ellas sean correctos.

Supongamos que para el constructo `HitCounter` queremos permitir al usuario especificar la capacidad de lectura (`readCapacity`) en la tabla de DynamoDB, pero también queremos asegurar que el valor asignado está dentro de un rango razonable. Podemos escribir una prueba que asegure que la lógica de validación trabaje: pasar valores no válidos y observar el resultado.

Primero, adicionemos la propiedad `readCapacity` a la interfaz `HitCounterProps`:

{{<highlight ts "hl_lines=12">}}
export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  downstream: lambda.IFunction;

  /**
   * The read capacity units for the table
   *
   * Must be greater than 5 and lower than 20
   *
   * @default 5
   */
  readCapacity?: number;
}
{{</highlight>}}

Luego, actualizemos la tabla de DynamoDB para adicionar la propiedad `readCapacity`.

{{<highlight ts "hl_lines=4">}}
const table = new dynamodb.Table(this, 'Hits', {
  partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
  encryption: dynamodb.TableEncryption.AWS_MANAGED,
  readCapacity: props.readCapacity ?? 5
});
{{</highlight>}}

Ahora adicionemos una validación que generará un error si la propiedad `readCapacity` no está dentro del rango permitido.

{{<highlight ts "hl_lines=9-11">}}
export class HitCounter extends Construct {
  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
      throw new Error('readCapacity must be greater than 5 and less than 20');
    }

    super(scope, id);
    // ...
  }
}
{{</highlight>}}

Y por último, adicionemos una prueba que valide si se generó un error.

```typescript
test('read capacity can be configured', () => {
  const stack = new cdk.Stack();

  expect(() => {
    new HitCounter(stack, 'MyTestConstruct', {
      downstream:  new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hello.handler',
        code: lambda.Code.fromAsset('lambda')
      }),
      readCapacity: 3
    });
  }).toThrowError(/readCapacity must be greater than 5 and less than 20/);
});
```

Ejecutemos la prueba.

```bash
$ npm run test
```

Usted debería ver una salida similar a esta:

```bash
$ npm run test

> cdk-workshop@0.1.0 test /home/aws-cdk-intro-workshop
> jest

 PASS  test/hitcounter.test.ts
  ✓ DynamoDB Table Created (206 ms)
  ✓ Lambda Has Environment Variables (61 ms)
  ✓ DynamoDB Table Created With Encryption (55 ms)
  ✓ Read Capacity can be configured (14 ms)

Test Suites: 1 passed, 1 total
Tests:       4 passed, 4 total
Snapshots:   0 total
Time:        4.755 s, estimated 5 s
Ran all test suites.
```
