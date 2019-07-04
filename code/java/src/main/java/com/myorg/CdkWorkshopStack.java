package com.myorg;

import software.amazon.awscdk.core.App;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.core.StackProps;
// import software.amazon.awscdk.samples.tableviewer.TableViewer;
// import software.amazon.awscdk.samples.tableviewer.TableViewerProps;
import software.amazon.awscdk.services.apigateway.LambdaRestApi;
import software.amazon.awscdk.services.apigateway.LambdaRestApiProps;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.FunctionProps;
import software.amazon.awscdk.services.lambda.Runtime;

public class CdkWorkshopStack extends Stack {
    public CdkWorkshopStack(final App parent, final String name) {
        this(parent, name, null);
    }

    public CdkWorkshopStack(final App parent, final String name, final StackProps props) {
        super(parent, name, props);

        Function hello = new Function(this, "HelloHandler", FunctionProps.builder()
                .withRuntime(Runtime.NODEJS_8_10)
                .withCode(Code.asset("lambda"))
                .withHandler("hello.handler")
                .build());
        HitCounter helloWithCounter = new HitCounter(this, "HelloHitCounter", HitCounterProps.builder()
                .withDownstream(hello)
                .build());

        new LambdaRestApi(this, "Endpoint", LambdaRestApiProps.builder()
                .withHandler(helloWithCounter.getHandler())
                .build());

        // new TableViewer(this, "ViewHitCounter", TableViewerProps.builder()
        //         .withTitle("Hello Hits")
        //         .withTable(helloWithCounter.getTable())
        //         .withSortBy("-hits")
        //         .build());
    }
}
