---
layout: post
title: "How To Automate Jira And Confluence Using Python"
date: 2024-05-22 10:43:51.000000000 +02:00
tags:
- Python
- Automation
- Jira
---
# How To Automate Jira And Confluence Using Python.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2024-05-22-How-to-automate-Jira-and-Confluence-using-Python.png" | absolute_url }})
{: refdef}

10 Min Read

---

# The Story

So, I found myself getting frustrated with the time-consuming process of manually updating numerous Jira issues (Death-by-Admin)? Imagine having to create over 44 tickets with new descriptions and acceptance criteria. The mere thought of opening 44 tabs (on a simple 16GB RAM Dell laptop), copying & pasting data, and repeating this process was enough to make me feel overwhelmed and rethinking my life's decisions.

In an attempt to streamline this cumbersome task, I then embarked on a journey to simplify my workload. Using the skills I already have I decided to develop a simple Python script to handle these updates swiftly and efficiently, leveraging the power of the Jira API.

The Jira Manager script is a Python tool, that I designed to automate the process of updating Jira issue descriptions & acceptance criteria, as well as Confluence pages. It leverages the Jira API to perform these updates based on the provided configuration file.

### The Solution

In response to this challenge and also keeping my skills fresh, I wrote an Attlasian Manager script. This Python tool harnesses the capabilities of the [Jira API](https://jira.readthedocs.io/) to automate the process of updating issue descriptions & acceptance criteria, including the creation of Confluence pages. The script removes the tedious manual updates with a streamlined and error-free solution.

## The Walk-through

Before you continue ensure you have the necessary permissions and API access to interact with Jir in your organization.

### Prerequisites

- Obtain an API token by following these steps:
  - Go to [Jira Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens).
- Create an API token and copy it.
- Store the token securely and export it to an environment variable:
  - `mkdir -p ~/.secrets && nano ~/.secrets/jira_api.token`
- Paste the token, save, and close the file.
- Export the token into an environment variable:
  - `export JIRA_API_TOKEN=$(cat ~/.secrets/jira_api.token)`

### The Script

Install the Python dependencies: `python3 -m pip install atlassian-python-api==3.41.4 envyaml==1.10.211231`

The script below provides a modular and reusable way to interact with Atlassian (Jira & Confluence) based on user choices and configuration. It also demonstrates the usage of SOLID principles for object-oriented programming (popularised by Uncle Bob AKA Robert Martin) and command-line arguments for user interaction.

Read more about the [SOLID Principles](https://arjancodes.com/blog/solid-principles-in-python-programming/)

```python
import argparse
import sys
from abc import ABC, abstractmethod
from textwrap import dedent

from envyaml import EnvYAML


class AtlassianConnector(ABC):
    @abstractmethod
    def connect(self):
        pass

    @abstractmethod
    def _jira_connect(self):
        pass

    @abstractmethod
    def _confluence_connect(self):
        pass


class AtlassianManager(AtlassianConnector):
    def __init__(
        self, atlassian_server: str, atlassian_username: str, api_token: str, option: str
    ):
        self.__params = {
            "url": atlassian_server,
            "username": atlassian_username,
            "password": api_token,
        }
        self._atlassian_option = option
        self._jira_connection = None
        self._confluence_connection = None

    def connect(self):
        connectors = {
            "jira": self._jira_connect(),
            "confluence": self._confluence_connect(),
        }
        return connectors[self._atlassian_option]

    def _jira_connect(self):
        if not self._jira_connection:
            from atlassian import Jira

            self._jira_connection = Jira(**self.__params)
        return self._jira_connection

    def _confluence_connect(self):
        if not self._confluence_connection:
            from atlassian import Confluence

            self._confluence_connection = Confluence(**self.__params)
        return self._confluence_connection


# -----------------------------------------
class IssueUpdater:
    def __init__(self, jira_connector: AtlassianConnector):
        self._jira_connector = jira_connector

    def update_issues(self, issues: list):
        def _fields_to_update(issue_data: dict):
            fields_to_update = {}
            if "description" in issue_data:
                fields_to_update["description"] = issue_data["description"]
            if "acceptance_criteria" in issue_data:
                fields_to_update[acceptance_criteria_field_id] = issue_data[
                    "acceptance_criteria"
                ]
            if "summary" in issue_data:
                fields_to_update["summary"] = issue_data["summary"]
            return fields_to_update

        acceptance_criteria_field_id = self._get_acceptance_criteria_field_id()
        jira_connection = self._jira_connector.connect()
        for issue_data in issues:
            issue_key = issue_data["key"]
            issue = jira_connection.issue(issue_key)
            issue.update(fields=_fields_to_update(issue_data))
            print(f"Issue {issue_key} updated successfully!")

    def _get_acceptance_criteria_field_id(self):
        acceptance_criteria_field_id = [
            field["id"]
            for field in self._jira_connector.connect().fields()
            if field["name"].lower() == "acceptance criteria"
        ][0]
        return acceptance_criteria_field_id


class ConfluencePageCreator:
    def __init__(self, confluence_connector: AtlassianConnector):
        self._confluence_connector = confluence_connector

    def create_page(self, config: dict):
        confluence_connection = self._confluence_connector.connect()
        space_key = config["space_key"]
        body = config["template"].get("body", "h1. update page heading.")
        parent_id = config["template"].get("parent_id")
        for title in config["create_pages"]:
            try:
                result = confluence_connection.create_page(
                    space_key,
                    title,
                    body,
                    parent_id=parent_id,
                    type="page",
                    representation="wiki",
                )
                print(f"Page {result['title']} created successfully!")
            except Exception:
                print(f"Error creating page {title}")


# ----------------------------------------
class ConfigurationLoader:
    @staticmethod
    def load_config(filename):
        try:
            return EnvYAML(filename)
        except ValueError:
            print(
                dedent(
                    """
                    Environment Variables are not defined!
                    Ensure that you export the envvar before running the script.

                    -----------
                    export JIRA_API_TOKEN=$(cat ~/.secrets/jira_api.token)"""
                )
            )
            sys.exit(1)
        except Exception as e:
            raise Exception(f"Error loading configuration: {str(e)}")


def arguments():
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument(
        "-c",
        "--config",
        default="./Config.yaml",
        type=str,
        required=True,
        help="Path to configuration file (Default: %(default)s)",
    )
    parser.add_argument(
        "--choice",
        type=str,
        required=True,
        choices=["issue", "confluence"],
        help="Interact with jira or confluence",
    )

    args = parser.parse_args()
    if len(sys.argv) == 1:
        parser.print_help()
        parser.exit(1)
    return args


if __name__ == "__main__":
    args = arguments()
    config = ConfigurationLoader.load_config(args.config)

    connection_config = config["connection"]
    atlassian_manager = AtlassianManager(
        atlassian_server=connection_config["atlassian_server"],
        atlassian_username=connection_config["atlassian_username"],
        api_token=connection_config["atlassian_api_token"],
        option=args.choice,
    )
    if args.choice == "issue":
        if config["jira"].get("update_issues"):
            issue_updater = IssueUpdater(atlassian_manager)
            issue_updater.update_issues(config["update_issues"])
    elif args.choice == "confluence":
        if config["confluence"].get("create_pages"):
            confluence_page_creator = ConfluencePageCreator(atlassian_manager)
            confluence_page_creator.create_page(config["confluence"])
```


### Usage

Create a `config.yaml` file with also include your API token or use an environment variable [Recommended], and specify a list of Jira issue keys, descriptions, and acceptance criteria.

Replace placeholders (<your_jira_host>, <your_jira_username>, <JIRA_API_TOKEN>, etc.) with your specific information and project details.
```yaml
connection:
  atlassian_api_token: $JIRA_API_TOKEN # Assumes that environment exists
  atlassian_server: <your_jira_host>
  atlassian_username: <your_jira_username>

confluence:
  space_key: <your-confluence-space-key>
  template:
    parent_id: <some-parent-id-bigint>
    body: |
      h1. Introduction:
      h2. Overview of the Data Asset (Combined Table)
      h2. Purpose and Importance

      h1. Table Creation Process:
      h2. Description of Tables to Be Created
      h2. Steps Involved in Table Creation

      h1. Schema and Table Streamlining:
      h2. Overview of Various Schemas and Tables Involved
      h2. Streamlining Process to Form a Single Table
      h2. Data Mapping and Consolidation Methods

      h1. Data Validation Methods:
      h2. Overview of Validation Techniques Used
      h2. Specific Validation Scripts/Methods
      h2. Results and Outcomes of Validation

      h1. Data Quality and Governance:
      h2. Data Quality Measures and Standards Followed
      h2. Governance Procedures Implemented

      h1. Dependencies and Relationships:
      h2. Impact and Relationships with Other Components
      h2. Data Lineage and Connection with Downstream Systems

      h1. Conclusion:
      h2. Summary of Key Achievements
      h2. Challenges Faced and Overcome
      h2. Future Considerations and Enhancements

  create_pages:
    - <page_title>
    - <some_other_page_title>

  update_pages:

jira:
  create_issues:

  update_issues:
    - key: <jira-ticket-id>
      description: |
                  As a Data Engineer, I propose developing a stored procedure to facilitate the aggregation of data from various tables across different schemas.

                  The objective is to bla bla bla bla

                  The creation of a query to align the with bla bla bla bla
      acceptance_criteria: |
                            - Successful creation of the stored procedure.
                            - Aggregated data table is placed into the LOB schema.
                            - Validation through testing to confirm the accuracy of the aggregated data.
    - key: <jira-ticket-id>
      description: |
                  As a Data Engineer, I propose developing a stored procedure to facilitate the aggregation of data from various tables across different schemas.

                  The objective is to bla bla bla bla

                  The creation of a query to align the with bla bla bla bla
      acceptance_criteria: |
                            - Successful creation of the stored procedure.
                            - Aggregated data table is placed into the LOB schema.
                            - Validation through testing to confirm the accuracy of the aggregated data.
```


#### Run the script


```bash
python atlassian_manager.py -c config.yaml
```

This script will update the specified Jira issues descriptions and acceptance criteria, and create confluences pages with the provided template that is based on the provided `config.yaml` file.

Example of results after running the script:

![image](https://github.com/mmphego/mmphego.github.io/assets/7910856/59890df5-9598-44f4-9ad6-44346b684090)

## Conclusion

The Python script has revolutionized the way I handle creation and updates for multiple Jira issues and/or Confluence pages. What was once a daunting and frustrating task requiring excessive manual effort has now become a seamless, automated process (said every developer ever!). By leveraging the Atlassian API, this script has significantly reduces the time and effort needed to update Jira issues/tickets and Confluence pages.

The ability to manage Jira issues and Confluence pages not only enhances productivity swiftly and accurately but also ensures consistency and precision in project management. As a developer, this script has proven invaluable in optimizing workflows and minimizing mundane tasks, allowing me to focus on more critical aspects of project delivery.

By implementing this automated solution, I've saved substantial time and mitigated the risk of errors associated with manual data entry. This endeavor serves as a testament to the power of automation in simplifying complex workflows, thereby enhancing overall productivity and efficiency.

## Reference

- [Jira API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)
- [Manage API tokens for your Atlassian account](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)
- [Python Jira Documentation](https://jira.readthedocs.io/)
