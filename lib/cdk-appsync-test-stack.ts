import * as cdk from '@aws-cdk/core'
import { GraphQLApi, MappingTemplate, PrimaryKey, Values, UserPoolDefaultAction } from '@aws-cdk/aws-appsync'
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb'
import { UserPool } from '@aws-cdk/aws-cognito'

export class CdkAppsyncTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const userPool = new UserPool(this, 'UserPool')

    const api = new GraphQLApi(this, 'graphQlApi', {
      name: 'test-api',
      authorizationConfig: {
        defaultAuthorization: {
          userPool,
          defaultAction: UserPoolDefaultAction.ALLOW,
        },
      },
      schemaDefinitionFile: './schema.graphql',
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
