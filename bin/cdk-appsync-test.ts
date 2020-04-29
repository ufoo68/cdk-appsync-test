#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkAppsyncTestStack } from '../lib/cdk-appsync-test-stack';

const app = new cdk.App();
new CdkAppsyncTestStack(app, 'CdkAppsyncTestStack');
