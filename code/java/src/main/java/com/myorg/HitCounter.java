package com.myorg;

import java.util.HashMap;
import java.util.Map;

import software.amazon.awscdk.Construct;
import software.amazon.awscdk.services.dynamodb.Attribute;
import software.amazon.awscdk.services.dynamodb.AttributeType;
import software.amazon.awscdk.services.dynamodb.Table;
import software.amazon.awscdk.services.lambda.Code;
import software.amazon.awscdk.services.lambda.Function;
import software.amazon.awscdk.services.lambda.FunctionProps;
import software.amazon.awscdk.services.lambda.Runtime;

public class HitCounter extends Construct {
  private final Function handler;
  private final Table table;

  public HitCounter(Construct scope, String id, HitCounterProps props) {
    super(scope, id);

    this.table = new Table(this, "Hits");
    this.table.addPartitionKey(Attribute.builder().withName("path").withType(AttributeType.String).build());

    Map<String, Object> environment = new HashMap<>();
    environment.put("DOWNSTREAM_FUNCTION_NAME", props.getDownstream().getFunctionName());
    environment.put("HITS_TABLE_NAME", this.table.getTableName());
    this.handler = new Function(this, "HitCounterHandler", FunctionProps.builder().withRuntime(Runtime.NODE_J_S810)
        .withHandler("hitcounter.handler").withCode(Code.asset("lambda")).withEnvironment(environment).build());

    // grant the lambda role read/write permissions to our table
    this.table.grantReadWriteData(this.handler.getRole());
    // grant the lambda role invoke permissions to the downstream function
    props.getDownstream().grantInvoke(this.handler.getRole());
  }

  /**
   * @return the counter function
   */
  public Function getHandler() {
    return handler;
  }

  /**
   * @return the hit counter table
   */
  public Table getTable() {
    return this.table;
  }
}
