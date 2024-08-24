import { Stack, StackProps } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { ParameterTier, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { join } from 'path';

export class CdkSecretsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a Secrets Manager secret with multiple key-value pairs
    const secret = new Secret(this, 'MyMultiValueSecret', {
      secretName: 'MyMultiValueSecret',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'user123',
          apiKey: 'static-api-key-12345',
          databaseName: 'myDatabase',
          connectionString: 'jdbc:mysql://myDatabase:3306/mydb'
        }),
        generateStringKey: 'password',
        excludeCharacters: '/@"\'',
      },
    });

    const parameter = new StringParameter(this, 'MySecureParameter', {
      parameterName: 'MyParameterName',
      stringValue: 'MySecureParameterValue',
      description: 'A secure parameter for my application',
      tier: ParameterTier.STANDARD, // Can be STANDARD or ADVANCED
    });

    // Create a Lambda function that accesses the secret
    const lambdaFunction = new NodejsFunction(this, 'MyLambdaFunction', {
      entry: join(__dirname, 'lambda', 'index.ts'), // Path to your Lambda function code
      handler: 'handler',
      environment: {
        SECRET_ARN: secret.secretArn,
        PARAMETER_NAME: parameter.parameterName,
      },
    });

    // Grant the Lambda function permission to read the secret and param
    secret.grantRead(lambdaFunction);
    parameter.grantRead(lambdaFunction);
  }
}
