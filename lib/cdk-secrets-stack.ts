import { Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { ParameterTier, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

export class CdkSecretsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a Secrets Manager secret with multiple key-value pairs
    const secret = new Secret(this, 'MyMultiValueSecret', {
      secretName: 'MyMultiValueSecret',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          username: 'user123',
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
      tier: ParameterTier.STANDARD,
    });

    const lambdaFunction = new NodejsFunction(this, 'MyLambdaFunction', {
      entry: 'lib/lambda/index.ts',
      runtime: Runtime.NODEJS_LATEST,
      handler: 'handler',
      environment: {
        SECRET_ARN: secret.secretArn,
        PARAMETER_NAME: parameter.parameterName,
      },
    });

    secret.grantRead(lambdaFunction);
    parameter.grantRead(lambdaFunction);
  }
}
