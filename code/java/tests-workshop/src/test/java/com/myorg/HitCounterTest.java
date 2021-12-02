package com.myorg;

import software.amazon.awscdk.Stack;
import software.amazon.awscdk.assertions.Template;
import software.amazon.awscdk.assertions.Capture;
import java.io.IOException;

import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.Runtime;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

public class HitCounterTest {

    @Test
    public void testDynamoDBTable() throws IOException {
        Stack stack = new Stack();

        Function hello = Function.Builder.create(stack, "HelloHandler")
            .runtime(Runtime.NODEJS_14_X)
            .code(Code.fromAsset("lambda"))
            .handler("hello.handler")
            .build();

        HitCounter helloWithCounter = new HitCounter(stack, "HelloHitCounter", HitCounterProps.builder()
            .downstream(hello)
            .build());

        // synthesize the stack to a CloudFormation template
        Template template = Template.fromStack(stack);

        template.resourceCountIs("AWS::DynamoDB::Table", 1);
    }

    @Test
    public void testLambdaEnvVars() throws IOException {
        Stack stack = new Stack();

        Function hello = Function.Builder.create(stack, "HelloHandler")
            .runtime(Runtime.NODEJS_14_X)
            .code(Code.fromAsset("lambda"))
            .handler("hello.handler")
            .build();

        HitCounter helloWithCounter = new HitCounter(stack, "HelloHitCounter", HitCounterProps.builder()
            .downstream(hello)
            .build());

        // synthesize the stack to a CloudFormation template
        Template template = Template.fromStack(stack);
        Capture envCapture = new Capture();
        Map<String, Object> expected = Map.of(
         "Handler", "hitcounter.handler",
         "Environment", envCapture);

        template.hasResourceProperties("AWS::Lambda::Function", expected);

        Map<String, Object> expectedEnv = Map.of(
            "Variables", Map.of(
                "DOWNSTREAM_FUNCTION_NAME", Map.of("Ref", "HelloHandler2E4FBA4D"),
                "HITS_TABLE_NAME", Map.of("Ref", "HelloHitCounterHits7AAEBF80")
              )
            );
        assertThat(envCapture.asObject()).isEqualTo(expectedEnv);
    }

    @Test
    public void testDynamoDBEncryption() throws IOException {
        Stack stack = new Stack();

        Function hello = Function.Builder.create(stack, "HelloHandler")
            .runtime(Runtime.NODEJS_14_X)
            .code(Code.fromAsset("lambda"))
            .handler("hello.handler")
            .build();

        HitCounter helloWithCounter = new HitCounter(stack, "HelloHitCounter", HitCounterProps.builder()
            .downstream(hello)
            .build());

        // synthesize the stack to a CloudFormation template
        Template template = Template.fromStack(stack);
        Capture envCapture = new Capture();
        Map<String, Object> expected = Map.of(
          "SSESpecification", Map.of("SSEEnabled", true));

        template.hasResourceProperties("AWS::DynamoDB::Table", expected);
    }

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
}
