### Clubhouse 2.0 Deployment

# Deploying to S3

Before trying to deploy the frontend to S3, make sure the environment variables listed in this document are setup first.

```$ ember deploy production --active=true```

# Environment Variables

* RANGER_CLUBHOUSE_CLIENT_PREFIX the URL prefix where client and its
asset files are.

Example: if the site is being hosted at https://ranger-town.dev/client
the URL prefix would be /client.

* RANGER_CLUBHOUSE_CLASSIC_URL the URL for the old Clubhouse.
  e..g., "/classic"

* RANGER_CLUBHOUSE_API_URL the URL for the API server
  .e.,g. "/api" or "https:/someother.com/api"
  NOTE: the frontend and backend should be in the same domain otherwise CORS
  will kill performance.

# Deployment to S3

* RANGER_CLUBHOUSE_S3_ACCESS_KEY the AWS access key

* RANGER_CLUBHOUSE_S3_SECRET_KEY the AWS secret key

* RANGER_CLUBHOUSE_S3_BUCKET bucket name to use

* RANGER_CLUBHOUSE_S3_REGION AWS region bucket is located in (default 'us-west-2' aka US West Oregon)
