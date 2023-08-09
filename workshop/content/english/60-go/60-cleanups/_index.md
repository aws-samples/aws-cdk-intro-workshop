+++
title = "Clean up"
weight = 60
bookFlatSection = true
+++

# Clean up your stack

When destroying a stack, resources may be deleted, retained, or snapshotted according to their deletion policy.
By default, most resources will get deleted upon stack deletion, however that's not the case for all resources.
The DynamoDB table will be retained by default. If you don't want to retain this table, we can set this in CDK
code by using `RemovalPolicy`:

## Set the DynamoDB table to be deleted upon stack deletion

Edit `hitcounter.go` and add the `RemovalPolicy` prop to the table

{{<highlight python "hl_lines=4 32">}}
package hitcounter

import (
	"github.com/aws/aws-cdk-go/awscdk/v2"
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
	table awsdynamodb.Table
}

type HitCounter interface {
	constructs.Construct
	Handler() awslambda.IFunction
	Table() awsdynamodb.Table
}

func NewHitCounter(scope constructs.Construct, id string, props *HitCounterProps) HitCounter {
	this := constructs.NewConstruct(scope, &id)

	table := awsdynamodb.NewTable(this, jsii.String("Hits"), &awsdynamodb.TableProps{
		PartitionKey: &awsdynamodb.Attribute{Name: jsii.String("path"), Type: awsdynamodb.AttributeType_STRING},
		RemovalPolicy: awscdk.RemovalPolicy_DESTROY,
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

func (h *hitCounter) Handler() awslambda.IFunction {
	return h.handler
}

func (h *hitCounter) Table() awsdynamodb.Table {
	return h.table
}

{{</highlight>}}

Since we made a change in the construct file, we need to redeploy the stack to put the changes into effect. Use `cdk deploy`:

```
cdk deploy
```

Additionally, the Lambda function created will generate CloudWatch logs that are
permanently retained. These will not be tracked by CloudFormation since they are
not part of the stack, so the logs will still persist. You will have to manually
delete these in the console if desired.

Now that we know which resources will be deleted, we can proceed with deleting the
stack. You can either delete the stack through the AWS CloudFormation console or use
`cdk destroy`:

```
cdk destroy
```

You'll be asked:

```
Are you sure you want to delete: CdkWorkshopStack (y/n)?
```

Hit "y" and you'll see your stack being destroyed.

The bootstrapping stack created through `cdk bootstrap` still exists. If you plan
on using the CDK in the future (we hope you do!) do not delete this stack.

If you would like to delete this stack, it will have to be done through the CloudFormation
console. Head over to the CloudFormation console and delete the `CDKToolkit` stack. The S3
bucket created will be retained by default, so if you want to avoid any unexpected charges,
be sure to head to the S3 console and empty + delete the bucket generated from bootstrapping.
