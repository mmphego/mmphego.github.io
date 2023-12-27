---
layout: post
title: "How To Connect To AWS Athena Using DBeaver Community Edition Via AWS SSO"
date: 2023-12-27 10:00:48.000000000 +02:00
tags:
- AWS
- Athena
- Data Engineering
- DBeaver
---
# How To Connect To AWS Athena Using DBeaver Community Edition Via AWS SSO

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2023-12-27-How-to-connect-to-AWS-Athena-using-DBeaver-Community-Edition-via-AWS-SSO.png" | absolute_url }})
{: refdef}

5 Min Read

---

# The Story

As a data engineer, I find myself entrenched in Amazon Athena from verifying/validating source extracts to daily analysis, the struggle with AWS console is all too familiar. Its cumbersome nature-repetitive logins, navigations and manual query input challenges efficiency and creativity. Engaging solely through this console impedes agile data exploration and analysis, a crucial aspect of my role.

To liberate efficiency, I turned to [DBeaver Community Edition](https://dbeaver.io/download/) and AWS SSO to query data on Athena. This integration promises an escape from the console's constraints offering a more familiar database tool for executing Athena queries. [AWS SSO](https://aws.amazon.com/iam/identity-center/) makes it easy to centrally manage SSO Access to multiple AWS accounts, moves the authentication to the IdP (Identity Provider) and removes the need for managing static, long-lived credentials.

In this post, I will detail how one can use DBeaver to execute Athena queries.

## The How

### Prerequisite

- **AWS Account [obviously]**: Ensure you have an AWS account with the necessary permissions to access AWS Athena.
  - Install the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- Download and install [DBeaver Community Edition](https://dbeaver.io/download/)

### Configure AWS CLI

Open powershell/bash and configure AWS CLI with your AWS credentials before configuring SSO:

```bash
aws configure
```

### Configure AWS SSO in AWS CLI

Run the following command to configure AWS SSO in the AWS CLI:

```bash
aws configure sso
```

Ensure you know your SSO Start URL and the region.
**NB:** You will be provided with a selection of all available AWS accounts your organization has or you have access to.

Copy the CLI **profile name**, we will need it when we login to SSO and setting up DBeaver.

### Authenticate via SSO

When the configuration is complete, you will need to login and authenticate with AWS.

Login to SSO with the profile name you have created/saved above using the following:

```bash
aws sso login --profile <copied-profile-name>
```

## Configure DBeaver

- Open DBeaver
  - Click **"New Database Connection"**
  - Search and select **"Athena"**

![dbeaver1]({{ "/assets/dbeaver-1.png" | absolute_url }})

- Enter your region and S3 query output location:

![dbeaver2]({{ "/assets/dbeaver-2.png" | absolute_url }})

- Download [Simba Athena Driver with SSO support]({{ "/assets/simba-athena-driver-sso-support-1.0-jar-with-dependencies.zip" | absolute_url }})
  - Extract to `C:\Users\<name>\AppData\Roaming\DBeaverData\drivers\athena-sso\` or `/usr/share/dbeaver/athena-sso`

- Thereafter, select **"Edit Driver Settings"**
- Select **"Libraries"**
- Select **"Add Files"**, which will open a pop-up
- Navigate to where you extracted the file and select  `"simba-athena-driver-sso-support-1.0-jar-with-dependencies"` file
- Select **"Find Class"**

![dbeaver3]({{ "/assets/dbeaver-3.png" | absolute_url }})

- This will open the **"Download driver files"** dialogue box, select **"Download"**
  - When download is complete, **"Find Class"** will give you a list of **"Driver Classes"** to select from,
  - Select `com.simba.athena.jdbc.Driver`

![dbeaver4]({{ "/assets/dbeaver-4.png" | absolute_url }})

- On **"AWS Athena Connection Settings"**,
- Select **"Driver properties"**
- Update **"AwsCredentialsProviderClass"** with **"com.github.neitomic.aws.SsoCredentialsProvider"**  and,
- **"AwsCredentialsProviderArguments"** with **"<Profile Name Copied to file above>"**
  - Alternatively, find the profile name in `~/.aws/config`

Note: This example might look like it references the AWS Team Role - but it is actually the profile name you chose in the step above with the aws configure sso command

![dbeaver5]({{ "/assets/dbeaver-5.png" | absolute_url }})

- Select **"Test Connection"**

![dbeaver6]({{ "/assets/dbeaver-6.png" | absolute_url }})

- If all the configuration is complete, you should see the **"Connection test"** dialogue box shown below
- Select **"Finish"**

![dbeaver7]({{ "/assets/dbeaver-7.png" | absolute_url }})

- Browse the list of databases.

![dbeaver8]({{ "/assets/dbeaver-8.png" | absolute_url }})

**Note:** In most organizations, credentials expires after certain hours, thereafter you will need to re-authenticate.

Running the command below with re-authenticate (assuming you only have 1 profile):

```bash
profile_name=$(awk -F'[][]' '/^\[/{print $2}' ~/.aws/config | grep  ^profile |cut -f 2 -d " ")
aws sso login --profile $profile_name
```

![dbeaver9]({{ "/assets/dbeaver-9.png" | absolute_url }})

## Conclusion

Connecting DBeaver Community Edition to AWS Athena through AWS SSO, leveraging AWS Directory Service with Azure AD integration, provides a secure, streamlined, and efficient way to query data stored in Amazon S3.

With this setup, users can seamlessly access Athena, utilize its querying capabilities, and derive insights from their data with ease.

![remember]({{ "/assets/remember.jpg" | absolute_url }})

## Reference

- [DBeaver Community Edition](https://dbeaver.io/download/)
- [AWS Athena](https://aws.amazon.com/athena/)
- [What is SSO?](https://aws.amazon.com/what-is/sso/)
- [Getting started with AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
