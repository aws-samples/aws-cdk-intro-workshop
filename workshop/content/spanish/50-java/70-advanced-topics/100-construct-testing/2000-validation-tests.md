+++
title = "Pruebas de Validación"
weight = 300
+++

### Pruebas de Validación

Algunas veces queremos que las entradas sean configurables, pero a la misma vez queremos poner restricciones en las entradas o validar que los valores asignados a ellas sean correctos.

Supongamos que para el constructo `HitCounter` queremos permitir al usuario especificar la capacidad de lectura (`readCapacity`) en la tabla de DynamoDB, pero también queremos asegurar que el valor asignado está dentro de un rango razonable. Podemos escribir una prueba que asegure que la lógica de validación trabaje: pasar valores no válidos y observar el resultado.

Primero, adicionemos la propiedad `readCapacity` a `HitCounter`:

Edite `HitCounterProps.java`
{{<highlight java "hl_lines=14 19 26-29 42-45">}}
package com.myorg;

import software.amazon.awscdk.services.lambda.IFunction;

public interface HitCounterProps {
    // Public constructor for the props builder
    public static Builder builder() {
        return new Builder();
    }

    // The function for which we want to count url hits
    IFunction getDownstream();

    Number getReadCapacity();

    // The builder for the props interface
    public static class Builder {
        private IFunction downstream;
        private Number readCapacity;

        public Builder downstream(final IFunction function) {
            this.downstream = function;
            return this;
        }

        public Builder readCapacity(final Number readCapacity) {
          this.readCapacity = readCapacity;
          return this;
        }

        public HitCounterProps build() {
            if(this.downstream == null) {
                throw new NullPointerException("The downstream property is required!");
            }

            return new HitCounterProps() {
                @Override
                public IFunction getDownstream() {
                    return downstream;
                }

                @Override
                public Number getReadCapacity() {
                  return readCapacity;
                }
            };
        }
    }
}
{{</highlight>}}

Luego, actualizemos la tabla de DynamoDB para adicionar la propiedad `readCapacity`.

{{<highlight java "hl_lines=1 9">}}
Number readCapacity = (props.getReadCapacity() == null) ? 5 : props.getReadCapacity();

this.table = Table.Builder.create(this, "Hits")
    .partitionKey(Attribute.builder()
        .name("path")
        .type(AttributeType.STRING)
        .build())
    .encryption(TableEncryption.AWS_MANAGED)
    .readCapacity(readCapacity)
    .build();
{{</highlight>}}

Ahora adicionemos una validación que generará un error si la propiedad `readCapacity` no está dentro del rango permitido.

{{<highlight java "hl_lines=5 8-12">}}
public class HitCounter extends Construct {
    private final Function handler;
    private final Table table;

    public HitCounter(final Construct scope, final String id, final HitCounterProps props) throws RuntimeException {
        super(scope, id);

        if (props.getReadCapacity() != null) {
          if (props.getReadCapacity().intValue() < 5 || props.getReadCapacity().intValue() > 20) {
            throw new RuntimeException("readCapacity must be greater than 5 or less than 20");
          }
        }

        ...

    }
}
{{</highlight>}}

Y por último, adicionemos una prueba que valide si se generó un error.

```java
    @Test
    public void testDynamoDBRaises() throws IOException {
        Stack stack = new Stack();

        Function hello = Function.Builder.create(stack, "HelloHandler")
            .runtime(Runtime.NODEJS_14_X)
            .code(Code.fromAsset("lambda"))
            .handler("hello.handler")
            .build();

        assertThrows(RuntimeException.class, () -> {
          new HitCounter(stack, "HelloHitCounter", HitCounterProps.builder()
              .downstream(hello)
              .readCapacity(1)
              .build());
        });
    }
```

Ejecutemos la prueba.

```bash
$ mvn test
```

Usted debería ver una salida similar a esta:

```bash
$ mvn test

-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.myorg.HitCounterTest
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 1.828 sec


Results :

Tests run: 4, Failures: 0, Errors: 0, Skipped: 0

[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  10.148 s
[INFO] Finished at: 2021-11-01T12:54:45Z
[INFO] ------------------------------------------------------------------------
```
