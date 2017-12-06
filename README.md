# Stu: Serverless Teeny Url

Serverless URL Shortener.  See demo at [stu.evanchiu.com](https://stu.evanchiu.com).

It integrates [API Gateway](https://aws.amazon.com/api-gateway/) + [AWS Lambda](https://aws.amazon.com/lambda) + [Node.js](https://nodejs.org/) + [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)

Created and managed with [AWS CodeStar](https://aws.amazon.com/codestar).

## Deploy with CodeStar
* Create an [AWS](https://aws.amazon.com/) Account and [IAM User](https://aws.amazon.com/iam/), login as that IAM user.
* Go to [CodeStar](https://console.aws.amazon.com/codestar) in the AWS Console, create any new project
* Add the project as a git remote to this repository and `push --force`
* Wait for CodePipeline to build and deploy, then visit the application endpoint

## Deploy from the AWS Serverless Application Repository
* Hit "Deploy" from the [application](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~stu) page

## Links
* [stu.evanchiu.com](https://stu.evanchiu.com) live demo
* [stu](https://github.com/evanchiu/stu) on Github
* [stu](https://serverlessrepo.aws.amazon.com/#/applications/arn:aws:serverlessrepo:us-east-1:233054207705:applications~stu) on the AWS Serverless Application Repository

## License
&copy; 2017 [Evan Chiu](https://evanchiu.com). This project is available under the terms of the MIT license.
