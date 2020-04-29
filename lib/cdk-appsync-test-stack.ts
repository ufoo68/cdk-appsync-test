import * as cdk from '@aws-cdk/core'
import { GraphQLApi, CfnApiKey } from '@aws-cdk/aws-appsync'

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
  }
}
