+++
title = "Validation Tests"
weight = 300
+++

### Validation Tests

Sometimes we want the inputs to be configurable, but we also want to put constraints on those inputs or validate
that the input is valid.

Suppose for the `HitCounter` construct we want to allow the user to specify the `readCapacity` on the DynamoDB
table, but we also want to ensure the value is within a reasonable range. We can write a test to make sure
that the validation logic works: pass in invalid values and see what happens.

First, add a `readCapacity` property to `HitCounterProps`:

Edit `HitCounterProps.java`
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

Then update the DynamoDB table resource to add the `readCapacity` property.

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

Now add a validation which will throw an error if the readCapacity is not in the allowed range.

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

Now lets add a test that validates the error is thrown.

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

Run the test.

```bash
$ mvn test
```

You should see an output like this:

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

{{< nextprevlinks >}}