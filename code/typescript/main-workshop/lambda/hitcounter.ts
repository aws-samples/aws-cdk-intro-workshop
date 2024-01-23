import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent } from "aws-lambda";

export const handler = async function (event: APIGatewayProxyEvent) {
  console.log("request:", JSON.stringify(event, undefined, 2));

  // create AWS SDK clients
  const dynamoClient = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(dynamoClient);

  const lambdaClient = new LambdaClient();

  // update dynamo entry for "path" with hits++
  const updateInput: UpdateCommandInput = {
    TableName: process.env.HITS_TABLE_NAME,
    Key: { path: event.path },
    UpdateExpression: "ADD hits :incr",
    ExpressionAttributeValues: { ":incr": 1 },
  };
  const updateCommand = new UpdateCommand(updateInput);
  await docClient.send(updateCommand);

  // call downstream function and capture response

  const invokeInput = {
    FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
    Payload: JSON.stringify(event),
  };
  const command = new InvokeCommand(invokeInput);
  const response = await lambdaClient.send(command);

  console.log("downstream response:", JSON.stringify(response, undefined, 2));

  // return response back to upstream caller

  return JSON.parse(Buffer.from(response.Payload || "").toString("utf8"));
};
