import { Handler } from 'aws-cdk-lib/aws-lambda';
import { SecretsManager, SSM } from 'aws-sdk';

const secretsManager = new SecretsManager();
const ssm = new SSM();

export const handler: Handler = async (): Promise<any> => {
  try {
    // Retrieve the secret from Secrets Manager
    const secretArn = process.env.SECRET_ARN!;
    const secretValue = await secretsManager.getSecretValue({ SecretId: secretArn }).promise();
    const secret = JSON.parse(secretValue.SecretString!);

    console.log('Retrieved Secret:', secret);

    // Retrieve the parameter from Parameter Store
    const parameterName = process.env.PARAMETER_NAME!;
    const parameterValue = await ssm.getParameter({
      Name: parameterName,
      WithDecryption: true,
    }).promise();

    const parameter = parameterValue.Parameter!.Value!;

    console.log('Retrieved Parameter:', parameter);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Secret and Parameter retrieved successfully',
        secret,
        parameter,
      }),
    };
  } catch (err) {
    console.error('Error retrieving secret or parameter:', err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to retrieve secret or parameter',
      }),
    };
  }
};
