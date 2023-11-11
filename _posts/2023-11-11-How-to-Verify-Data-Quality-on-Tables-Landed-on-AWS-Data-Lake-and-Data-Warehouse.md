---
layout: post
title: "How To Verify Data Quality On Tables Landed On AWS Data Lake And Data Warehouse"
date: 2023-11-11 05:32:58.000000000 +02:00
tags:
- Data Engineering
- Data Lake
- Data Warehouse
- AWS
---
# How To Verify Data Quality On Tables Landed On AWS Data Lake And Data Warehouse.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2023-11-11-How-to-Verify-Data-Quality-on-Tables-Landed-on-AWS-Data-Lake-and-Data-Warehouse.png" | absolute_url }})
{: refdef}

5 Min

---

# The Story

As a data engineer, the responsibility of ensuring data quality is not just a task - it's a commitment to the integrity of insights derived from the vast volumes of data we manage.
The accuracy and dependability of your insights depend on the quality of the data you gather. When working with large datasets in [Enterprise Data Lakes (EDL)](https://aws.amazon.com/what-is/data-lake/) and [Enterprise Data Warehouses (EDW)](https://aws.amazon.com/what-is/data-warehouse/), this is especially true.

Ensuring that the tables that you land on these platforms meet the highest data quality standards is a substantial challenge, but one that can be met with the right tools and techniques.

In this guide/post, I'll detail how I verify Data Quality on tables landed on AWS EDL and EDW using a simple Python script. The script is designed to automate various critical data validation checks, simplifying the process and empowering our data team to maintain and deliver high-quality data.

## Understanding Data Quality

Data quality refers to the overall reliability, accuracy, completeness, and consistency of data within a dataset. It involves ensuring that the data meets predefined standards and is fit for its intended use. High-quality data is free from errors, duplications, and inconsistencies, making it a trustworthy foundation for making informed decisions, conducting analysis, and deriving meaningful insights. The significance of data quality lies in its direct impact on the reliability of business intelligence, analytics, and decision-making processes. Poor data quality can lead to flawed insights, operational inefficiencies, and misguided strategic decisions.

## The How

Every morning, I would find myself having to log into the [AWS Console](https://aws.amazon.com/console/) and run queries on [Athena](https://aws.amazon.com/athena/) to verify that the tables were ingested and landed successfully in the Data Lake (EDL) the previous night, thereafter run similar data verification queries on our RedShift cluster via [DBeaver](https://dbeaver.io/) to verify if tables were exposed successfully. This mundane task became tedious over time, so I developed a Python script to automate the data validation process for both the EDL and the Data Warehouse (EDW).

The script provides a flexible and comprehensive solution for data validation in the AWS environment. It connects to AWS using either SSO (Single Sign-on) or traditional access key and secret credentials [Not Recommended]. It then dynamically iterates through a list of tables and databases specified in a YAML file, executing SQL queries against the EDL to perform a range of critical data validation checks:

* **Table existence:** Verifies that the table exists and verifies that the column names are as expected in the EDL/EDW
* **Count per date:** Verifies that the number of rows in the table is consistent with the expected number of rows for the date.
* **Metadata uniqueness:** Verifies that the metadata for the table is consistent and unique, ensuring that there are no duplicates.
* **Extraction date validation:** Verifies that the extraction date for the table is correct.
* **Field-level consistency:** Verifies that the values in the table are valid and consistent.

To ensure data synchronization between the EDL and EDW, my script also establishes a Redshift connection using Azure OAuth for secure authentication and replicates the same suite of validation checks on the EDW. This holistic approach guarantees data integrity and quality across AWS environments.

## The Walk-Through

In this section, I will detail the script. First, we need to create a `Config.yaml` file in the project directory. This file will contains aws services to be used, connection config, tables, database and column names.

```bash
cat << EOF > Config.yaml
aws_service:
  region: eu-west-1
  sso_profile: $SSO_PROFILE
  credentials_path: $CREDENTIALS_PATH|null
  athena:
    tables:
      - name: table_name
        database: glue_database_name
        columns:
          - id
        max_expected_count: 30000000
  redshift:
    config:
      iam: true
      ssl: true
      database: database_name
      host: host
      cluster_identifier: cluster id
      user: user
      credentials_provider: 'BrowserAzureOAuth2CredentialsProvider'
      listen_port: port
      client_id: client_id
      idp_tenant: idp_tenant
      scope: scope_url
    tables:
      - name: table_name
        database: database
        columns:
          - id
EOF
```

Once we have the `Config.yaml` file, we can create the script `AWS_Data_Validation.py`
The code below details shows an `AWS_Credentials` class that provides methods for retrieving and reading AWS credentials from a configuration file (`~/.aws/credentials`).

```python
class AWS_Credentials:
    def __init__(
        self, sso_profile: str, credentials_path: str, region_name: str
    ) -> None:
        self.sso_profile = sso_profile
        self.credentials_path = credentials_path
        self.region_name = region_name

    def config_file_path(self) -> str:
        """
        If the sso_profile is not None, return the sso_profile.
        If the sso_profile is None, check if the credentials_path exists.
        If the credentials_path exists, return the credentials_path.
        If the credentials_path does not exist, raise a FileNotFoundError.
        :return: The path to the config file.
        """

        if self.sso_profile:
            return self.sso_profile
        elif Path(self.credentials_path).exists():
            return Path(self.credentials_path).as_posix()
        else:
            raise FileNotFoundError

    def read_credentials(self, **kwargs) -> dict:
        """
        `read_credentials` reads the credentials from a file and returns them as a
        dictionary
        """

        try:
            if self.sso_profile:
                return {"sso_profile": self.sso_profile}
            else:
                config = configparser.RawConfigParser()
                creds_path = self.config_file_path()
                config.read(creds_path)
                section = kwargs.get("profile", config.sections()[0])
                return {
                    "aws_access_key_id": config.get(section, "aws_access_key_id"),
                    "aws_secret_access_key": config.get(
                        section, "aws_secret_access_key"
                    ),
                    "aws_session_token": config.get(section, "aws_session_token"),
                }
        except Exception:
            raise
```

Thereafter, we create another class `BotoSession` which inherits `AWS_Credentials` and then provides methods for creating a session, verifying the session and returning a client object for an AWS service.

```python
class BotoSession(AWS_Credentials):
    def __init__(
        self,
        sso_profile: str = "",
        credentials_path: str = "",
        region_name: str = "",
    ):
        self.sso_profile = sso_profile
        self.credentials_path = credentials_path
        self.region_name = region_name
        super().__init__(sso_profile, credentials_path, region_name)

    def session_client(self, client: str, **kwargs) -> object:
        """
        It reads the credentials from the file, creates a session,
        and returns a client object

        :param client: The AWS service you want to use
        :type client: str

        :return: The session object is being returned.
        """
        creds = self.read_credentials(**kwargs)
        if creds.get("sso_profile"):
            session = boto3.Session(profile_name=creds.get("sso_profile"))
        else:
            session = boto3.Session(
                aws_access_key_id=creds["aws_access_key_id"],
                aws_secret_access_key=creds["aws_secret_access_key"],
                aws_session_token=creds["aws_session_token"],
                region_name=self.region_name,
            )
        session = self.verified_session(session, **creds)
        return session.client(client)

    @staticmethod
    def verified_session(session: boto3.session.Session, **kwargs):
        sts = session.client("sts")
        try:
            sts.get_caller_identity()
            return session
        except ClientError:
            print(
                dedent(
                    """
                Your Access Expired After 8 Hours.
                ==================================
                You Have To Update Your AWS Credentials File (typically located in
                    ~/.aws/credentials) With The Correct Credentials.
            """
                )
            )
            sys.exit(1)
        except UnauthorizedSSOTokenError:
            subprocess.run(
                ["aws", "sso", "login", "--profile", kwargs.get("sso_profile")]
            )
            return session
```

Once we have all the basic setup ready, we then create an `AthenaClient` class that provides methods for executing queries on Amazon Athena and retrieving the query results for validation.

```python
class AthenaClient:
    def __init__(self, boto_session, **kwargs):
        self.athena_client = boto_session.session_client("athena")
        self.s3_output_bucket = self._get_athena_s3_output_bucket(
            boto_session, **kwargs
        )

    def _get_athena_s3_output_bucket(self, boto_session: boto3.Session, **kwargs):
        bucket_name_contains: str = kwargs.get("bucket_name_contains", "athena-output")
        bucket_object_prefix: str = kwargs.get("bucket_object_prefix", "cldedl")

        s3_client = boto_session.session_client("s3")
        try:
            buckets = s3_client.list_buckets()
        except ClientError:
            raise
        else:
            athena_output_bucket = [
                bucket["Name"]
                for bucket in buckets["Buckets"]
                if bucket_name_contains in bucket["Name"]
            ][0]

            list_objects = s3_client.list_objects(
                Bucket=athena_output_bucket, Delimiter="/"
            )
            sub_dir = [
                obj["Prefix"]
                for obj in list_objects["CommonPrefixes"]
                if bucket_object_prefix in obj["Prefix"]
            ]
            return Path(athena_output_bucket, sub_dir[0]).as_posix()

    def execute_query(self, query: str, max_executions=10):
        def _get_execution_status(execution_id: str) -> str:
            query_execution_stats = self.athena_client.get_query_execution(
                QueryExecutionId=execution_id
            )
            return query_execution_stats["QueryExecution"]["Status"]["State"]

        if not query:
            print("No query specified")
            return

        try:
            query_execution = self.athena_client.start_query_execution(
                QueryString=query,
                ResultConfiguration={"OutputLocation": f"s3://{self.s3_output_bucket}"},
            )
            assert query_execution["ResponseMetadata"]["HTTPStatusCode"] == 200
        except self.athena_client.exceptions.InvalidRequestException as e:
            raise ConnectionError(
                f"Failed to issue: Start query execution command: Reason: {str(e)}"
            )
        else:
            while max_executions > 0:
                max_executions -= 1
                exec_status = _get_execution_status(query_execution["QueryExecutionId"])
                if exec_status == "SUCCEEDED":
                    break
                elif exec_status in ["FAILED", "CANCELLED"]:
                    raise Exception(
                        "Athena query with the string "
                        f'"{query}" failed or was cancelled'
                    )
                time.sleep(1)

            if exec_status == "SUCCEEDED":
                try:
                    response = self.athena_client.get_query_results(
                        QueryExecutionId=query_execution["QueryExecutionId"]
                    )
                except Exception:
                    raise
                else:
                    return response["ResultSet"]["Rows"]
            return False
```

We also, create a `RedShiftClient` class that creates a connection to a Redshift database using the provided configuration.
Future work, includes converting the `RedshiftClient` to a [Context Manager](https://docs.python.org/3/library/contextlib.html) (for auto-closing the client when done.)

```python
class RedShiftClient:
    def __init__(self, config: dict):
        self.config = config

    def create_connection(self):
        conn: redshift_connector.Connection = redshift_connector.connect(
            database=self.config["database"],
            user=self.config["user"],
            host=self.config["host"],
            listen_port=self.config["listen_port"],
            client_id=self.config["client_id"],
            cluster_identifier=self.config["cluster_identifier"],
            credentials_provider=self.config["credentials_provider"],
            idp_tenant=self.config["idp_tenant"],
            scope=self.config["scope"],
            iam=self.config["iam"],
            ssl=self.config["ssl"],
        )
        conn.autocommit = True
        try:
            cursor = conn.cursor()
            result = cursor.execute("SELECT 1")
            assert result.fetchone() == [1], "Could not establish connection!"
            return cursor
        except Exception:
            cursor.close()
            cursor = None
            del cursor
            raise
```

Then implement additional logic to execute a query using the preferred service, return results and run validation.

```python
class DataValidator:
    pass

class ConfigurationLoader:
    pass

def process_athena(aws_service: str):
    pass

def process_redshift(aws_service: str):
    pass

def validate_table(client: object, table_name: str, column: str, database: str, max_expected_count: int):
    pass

def arguments():
    pass
```

### Usage

Combining all of the classes, we end up with the following `main` function that loads a configuration file, checks if a specific AWS service is configured, and then processes the service based on the provided arguments.

```python
def main():
    args = arguments()
    config = ConfigurationLoader.load_config(args.config)
    service = args.service

    if config.get("aws_service"):
        aws_service = config["aws_service"]
        if service == "athena" and aws_service.get("athena"):
            process_athena(aws_service)
        elif service == "redshift" and aws_service.get("redshift"):
            process_redshift(aws_service)
        else:
            print(f"Service '{service}' not found in the configuration.")
    else:
        print("AWS service configuration not found in the configuration file.")

if __name__ == "__main__":
    main()
```

#### Usage Example

Before you run the tool ensure that you can login to AWS via SSO or AWS Credentials.

We do this by setting up SSO to avoid the need to configure credentials each time you need to run the verification process.

Configure SSO using the following:

```bash
aws configure sso
```

After the configuration is complete, export the sso profile name to an envvar.

```bash
export SSO_PROFILE=$(cat ~/.aws/config | grep "\[profile " | sed -e 's/\[//g' -e 's/\]//g' -e 's/profile //g')
```

This will create an SSO profile under `~/.aws/config` which will be used for any AWS authentication related processes.

Once, the SSO/Credentials are configured then we can run the script:

```bash
python AWS_Data_Validation.py -c Config.yaml --service athena
```

#### Interpreting Results

```bash
$ python AWS_Data_Validation.py -c Config.yaml --service athena

Attempting to automatically open the SSO authorization page in your default browser.
If the browser does not open or you wish to use a different device to authorize this request, open the following URL:

https://device.sso.eu-west-1.amazonaws.com/

Then enter the code:

CNDB-LPRG
Successfully logged into Start URL: https://<id>.awsapps.com/start/
Table: 'table_name': Table exists.
Table: 'table_name': meta_extract_date is recent.
Table: 'table_name': Field-level validation passed.
Table: 'table_name': Metadata duplicates validation passed.
Table: 'table_name': Table count per day validation passed.
```

## Reference

- [Connecting to an Amazon Redshift cluster using SQL client tools](https://docs.aws.amazon.com/redshift/latest/mgmt/connecting-to-cluster.html)
- [What is a Data Lake?](https://aws.amazon.com/what-is/data-lake/)
- [What is a Data Warehouse?](https://aws.amazon.com/what-is/data-warehouse/)
