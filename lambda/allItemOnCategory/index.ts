import { DynamoDB } from 'aws-sdk'

const dynamodb = new DynamoDB()

interface AllItemOnCategoryEvent {
  arguments: {
    category: string
  }
}

export const handler = async (event: AllItemOnCategoryEvent) => {

  const result = await dynamodb.query({
    TableName: process.env.TABLE_NAME!,
    ExpressionAttributeValues: {
      ':category': {
        S: event.arguments.category,
      },
    },
    KeyConditionExpression: 'category = :category',
    IndexName: 'categoryKey',
  }).promise()

  return result.Items?.map(item=>({
    id: item.id.S,
    data: item.data.S,
    category: item.data.S,
  }))
}