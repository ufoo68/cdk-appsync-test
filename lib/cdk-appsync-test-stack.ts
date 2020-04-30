import * as cdk from '@aws-cdk/core'
import { GraphQLApi, CfnApiKey, MappingTemplate, PrimaryKey, Values } from '@aws-cdk/aws-appsync'
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb'

export class CdkAppsyncTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

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
      }
    })

    const itemDS = api.addDynamoDbDataSource('Item', 'Item data source', itemTable)
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
  }
}
