import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export interface HitCounterProps {
  /** the function for which we want to count url hits **/
  readonly downstream: lambda.IFunction;
  readonly readCapacity?: number;
}

export class HitCounter extends Construct {

  /** allows accessing the counter function */
  public readonly handler: lambda.Function;

  /** the hit counter table */
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    super(scope, id);

    if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
      throw new Error('readCapacity must be greater than 5 and less than 20!!!!!');
    }

    this.table = new dynamodb.Table(this, 'Hits', {
      partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      readCapacity: props.readCapacity ?? 5,
    });

    this.handler = new lambda.Function(this, 'HitCounterHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'hitcounter.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        DOWNSTREAM_FUNCTION_NAME: props.downstream.functionName,
        HITS_TABLE_NAME: this.table.tableName,
      },
    });

    // grant the lambda role read/write permissions to our table
    this.table.grantReadWriteData(this.handler);

    // grant the lambda role invoke permissions to the downstream function
    props.downstream.grantInvoke(this.handler);
  }
}