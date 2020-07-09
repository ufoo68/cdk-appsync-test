import * as cdk from '@aws-cdk/core'
import { GraphQLApi, CfnApiKey, MappingTemplate, PrimaryKey, Values } from '@aws-cdk/aws-appsync'
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb'
import { Function, Code, Runtime, LayerVersion } from '@aws-cdk/aws-lambda'

export class CdkAppsyncTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const layer = new LayerVersion(this, 'layer', {
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      code: Code.fromAsset('layer'),
    })

    const api = new GraphQLApi(this, 'graphQlApi', {
      name: 'test-api',
      schemaDefinitionFile: './schema.graphql',
    })

    new CfnApiKey(this, 'apiKey', {
      apiId: api.apiId,
    })

    const itemTable = new Table(this, 'itemTable', {
      partitionKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'category',
        type: AttributeType.STRING,
      }
    })
    itemTable.addGlobalSecondaryIndex({
      indexName: 'categoryKey',
      partitionKey: {
        name: 'category',
        type: AttributeType.STRING,
      }
    })
    const itemDS = api.addDynamoDbDataSource('ItemDynamoDB', 'Item data source', itemTable)
    itemDS.createResolver({
      typeName: 'Query',
      fieldName: 'allItem',
      requestMappingTemplate: MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: MappingTemplate.dynamoDbResultList(),
    })
    itemDS.createResolver({
      typeName: 'Mutation',
      fieldName: 'addItem',
      requestMappingTemplate: MappingTemplate.dynamoDbPutItem(
        PrimaryKey.partition('id').auto(),
        Values.projecting('item')),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    })

    const allItemOnCategory = new Function(this, 'allItemOnCategory', {
      code: Code.asset('lambda/allItemOnCategory'),
      handler: 'index.handler',
      runtime: Runtime.NODEJS_12_X,
      layers: [layer],
      environment: {
        TABLE_NAME: itemTable.tableName,
      },
    })
    itemTable.grantReadData(allItemOnCategory)

    api.addLambdaDataSource('ItemLambda', 'Item lambda source', allItemOnCategory).createResolver({
      typeName: 'Query',
      fieldName: 'allItemOnCategory',
      requestMappingTemplate: MappingTemplate.lambdaRequest(),
      responseMappingTemplate: MappingTemplate.lambdaResult(),
    })

  }
}
