#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import * as childProcess from 'child_process'
import { CdkAppsyncTestStack } from '../lib/cdk-appsync-test-stack'

const LAMBDA_LAYER_DIR_NAME = './layer/nodejs/node_modules/'
childProcess.execSync(`yarn install --production --modules-folder ${LAMBDA_LAYER_DIR_NAME}`)
const app = new cdk.App()
new CdkAppsyncTestStack(app, 'CdkAppsyncTestStack')
