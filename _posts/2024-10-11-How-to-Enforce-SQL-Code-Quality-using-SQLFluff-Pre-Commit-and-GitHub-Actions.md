---
layout: post
title: "How To Enforce SQL Code Quality Using SQLFluff, Pre-Commit And GitHub Actions"
date: 2024-10-11 11:02:54.000000000 +02:00
tags:
- CICD
- Data Engineering
- Code Quality
---
# How To Enforce SQL Code Quality Using SQLFluff, Pre-Commit And GitHub Actions.

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2024-10-11-How-to-Enforce-SQL-Code-Quality-using-SQLFluff-Pre-Commit-and-GitHub-Actions.png" | absolute_url }})
{: refdef}

8 Min Read

---

# The Story

As a data engineer, one of your task is to ensure that you and everyone in your team is writing efficient and maintainable SQL code. This is crucial to the success of any data-driven project. However, ensuring that your SQL code adheres to best practices can be challenging, especially when working in large teams with engineers from different standards. That’s where automating SQL code quality checks comes in to ensure that the SQL code going to production aligns with a standard (crafted by the engineers).

In this post, I’ll show you how I integrated [SQLFluff](https://sqlfluff.com/), [Pre-Commit](https://pre-commit.com/), and [GitHub Actions](https://github.com/features/actions) into your GitHub workflow to enforce consistent SQL coding standards and catch issues before they reach production. By the end, you’ll have a streamlined, automated process that makes maintaining SQL code quality easy and efficient.

## The How

In this section, we will breakdown the various components our solution:

- **SQLFluff:** An open source, dialect-flexible and configurable SQL linter. Some of the key benefits SQLFluff offers include:
    - Highly Configurable: Supports multiple SQL dialects and allows customization of linting rules.
    - Auto-fixing Capability: Can automatically correct some code style issues to match the defined standards.
    - Integrates Seamlessly: Works well with existing development workflows, including CI/CD pipelines.

- **Pre-Commit:** A tool that lets you run code checks before committing changes to your repository. By using pre-commit hooks, you ensure that issues in your code are identified and resolved early in the development process. We integrating SQLFluff with Pre-Commit and that ensures that every time you make a commit, your SQL files will be checked for potential issues. This tool can easily be intergrated into a continous integration environment to run individual files through the various configured linting tools.

- **GitHub Actions:** A powerful automation tool that allows you to create custom workflows triggered by events in your GitHub repository. We will use it to set up a continuous integration pipeline that automatically runs pre-commit SQLFluff hook on your SQL code every time you push changes or open a PR. This ensures that all SQL code going into your main branch meets the quality standards.

## The Walk-through

This section will provide a step-by-step guide to setting up SQLFluff, Pre-Commit, and GitHub Actions to create a seamless SQL code quality process in your GitHub workflow.

### Step 1: Install Dependencies

To get started, install SQLFluff and Pre-Commit using pip:

```bash
python -m pip install sqlfluff pre-commit
```

### Step 2: Fine-tune SQLFluff Config

To ensure SQLFluff works best for your team, you will need to customize its settings to match your coding standards. Modify the [.sqlfluff](https://docs.sqlfluff.com/en/stable/configuration/setting_configuration.html#configuration-files) file to specify rules, like excluding specific linting checks or setting the SQL dialect:

```
[sqlfluff]
# dialect = ansi
exclude_rules = L003, L008, L014
sql_file_exts = .sql
max_line_length = 150
```

These updates will ensure that SQLFluff only flags issues that are relevant to your project, reducing noise and increasing focus on the most critical code quality issues.

### Step 3: Inferring SQL Dialect (Optional)

In our case, our project contains multiple SQL dialects (MSSQL and Redshift) and in an automated environment one needs to be able to infer the dialect from the file before running SQLFluff. The script below infers the SQL dialect from file:

```python
cat dialect_inferer.py

import re
import sys
from collections import defaultdict
from typing import Dict, List, Tuple

class AmbiguousDialectError(Exception):
    def __init__(self, dialects):
        self.dialects = dialects
        message = f"Ambiguous dialect match: {', '.join(dialects)}"
        super().__init__(message)


class SQLDialectInferrer:
    def __init__(self):
        self.dialect_patterns: Dict[str, List[Tuple[str, int]]] = {
            "redshift": [
                # Redshift-specific keywords and procedural patterns
                (r"\bdiststyle\b", 2),
                (r"\bdistkey\b", 2),
                (r"\bsortkey\b", 2),
                (r"\bcompound sortkey\b", 3),
                (r"\binterleaved sortkey\b", 3),
                (r"\bvacuum\b", 2),
                (r"\bunload\b", 2),
                (r"\bcopy\b", 2),
                (r"\bcreate\s+materialized\s+view\b", 3),
                (r"\blanguage\s+plpgsql\b", 3),  # Redshift supports PL/pgSQL
                (r"\bdo\s*\$\$", 3),  # PL/pgSQL procedural language block
                (r"\breturn\s+query\b", 2),  # PL/pgSQL return query
                (r"\bexecute\b", 3),  # Redshift procedural EXECUTE statements
                (r"\bcreate\s+procedure\b", 3),  # Redshift stored procedures
                (r"\bprocedure\b", 2),  # General procedure keyword
                (r"\bcommit\b", 1),  # Transactions are supported in Redshift SPs
                # Redshift's standard SQL keywords:
                (r"\bcurrent_timestamp\b", 2),
                (r"\bgetdate\(\)", 2),  # Redshift supports GETDATE()
                (r"\bnow\(\)", 2),  # NOW() is common for current timestamp in Redshift
                (r"\bnvarchar\b", 2),  # Redshift uses NVARCHAR
                (r"\bchar\b", 2),  # Redshift supports CHAR
                (r"\bvarchar\b", 2),
                (r"\bboolean\b", 2),  # Redshift BOOLEAN type
                (r"\bdate\b", 2),
                (r"\btimestamp\b", 2),
                (r"\binteger\b", 2),  # Redshift uses INTEGER types
            ],
            "tsql": [
                (r"\bbegin\s+try\b", 2),
                (r"\bend\s+try\b", 2),
                (r"\bbegin\s+catch\b", 2),
                (r"\bend\s+catch\b", 2),
                (r"\bexec\b", 2),
                (r"\bexecute\b", 2),
                (r"\bsp_\w+", 2),  # Stored procedure calls
                (r"\bwith\s*\(\s*nolock\s*\)", 3),  # NOLOCK hint for table access
                (r"\bmerge\b", 2),
                (r"\bdeclare\s+@", 4),  # Variable declarations in T-SQL
                (r"@@", 4),  # System variable declarations in T-SQL
                (
                    r"\bisnumeric\(\)",
                    2,
                ),  # ISNUMERIC() function to check if a value is numeric
                (r"\btransaction\b", 2),
                (r"\bidentity\b", 2),
                (r"\bgetdate\(\)", 2),  # T-SQL specific datetime function
                (r"\bcoalesce\(", 2),  # COALESCE is common but more prominent in T-SQL
                (r"\btry_convert\b", 2),  # T-SQL specific type conversion function
                (r"\brow_number\(\)", 3),  # T-SQL's analytic function
                (r"\btop\s+\d+", 2),  # TOP N syntax in T-SQL for limiting rows
                (
                    r"\bdb_name\(\)",
                    2,
                ),  # DB_NAME() function to get the name of the current database
                (
                    r"\bobject_schema_name\(\)",
                    2,
                ),  # OBJECT_SCHEMA_NAME(@@PROCID) to get the schema of the current object
                (
                    r"\bobject_name\(\)",
                    2,
                ),  # OBJECT_NAME() to get the name of the current object
                (
                    r"\bobject_schema_name\(\s*@@procid\s*\)",
                    2,
                ),  # OBJECT_SCHEMA_NAME() to get the schema of the current object
                (
                    r"\bobject_name\(\s*@@procid\s*\)",
                    2,
                ),  # OBJECT_NAME(@@PROCID) to get the name of the current object
                (
                    r"\bcreate\s+nonclustered\s+index\b",
                    2,
                ),  # CREATE NONCLUSTERED INDEX for performance optimization in T-SQL
                (
                    r"\buse\s*\[\s*\w+\s*\]",
                    2,
                ),  # USE [database_name] for switching database context
            ],
        }

        # Common SQL keywords that should not affect dialect inference
        self.common_sql_keywords = set(
            [
                "select",
                "from",
                "where",
                "and",
                "or",
                "insert",
                "update",
                "delete",
                "create",
                "table",
                "index",
                "drop",
                "alter",
                "join",
                "on",
                "group by",
                "order by",
                "having",
                "union",
                "all",
                "as",
                "distinct",
                "like",
                "in",
                "between",
                "is",
                "null",
                "not",
                "case",
                "when",
                "then",
                "else",
                "end",
            ]
        )

    def remove_comments(self, content: str) -> str:
        """Remove single-line and multi-line comments from the SQL content."""
        # Remove single-line comments
        content = re.sub(r"--.*$", "", content, flags=re.MULTILINE)
        # Remove multi-line comments
        content = re.sub(r"/\*[\s\S]*?\*/", "", content)
        return content

    def calculate_sql_likelihood(self, content: str) -> float:
        """Calculate how likely the content is to be SQL based on common keywords."""
        words = re.findall(r"\b\w+\b", content.lower())
        sql_keywords = sum(1 for word in words if word in self.common_sql_keywords)
        return sql_keywords / len(words) if words else 0

    def score_content_against_dialects(self, content: str) -> list:
        # Score the content against known dialect patterns
        scores = defaultdict(int)
        for dialect, patterns in self.dialect_patterns.items():
            for pattern, weight in patterns:
                if re.search(pattern, content):
                    scores[dialect] += weight

        if not scores:
            return "ansi"  # Assume ANSI SQL if no specific dialect patterns are matched

        max_score = max(scores.values())
        return [d for d, s in scores.items() if s == max_score]

    def infer_dialect(self, file_path: str) -> str:
        """Infer SQL dialect from the provided file."""
        try:
            with open(file_path, "r", encoding="utf-8") as file:
                content = file.read().lower()
        except UnicodeDecodeError:
            try:
                with open(file_path, "r", encoding="latin-1") as file:
                    content = file.read().lower()
            except Exception as e:
                print(f"Error reading file: {e}")
                return "unknown"

        content = self.remove_comments(content)

        # Check if the file is likely to be SQL based on common keywords
        sql_likelihood = self.calculate_sql_likelihood(content)
        if sql_likelihood < 0.1:  # Adjust this threshold as needed
            raise RuntimeError("File isn't SQL or does not contain enough SQL keywords")

        top_dialects = self.score_content_against_dialects(content)

        if len(top_dialects) == 1:
            return top_dialects[0]  # Return the single top dialect
        else:
            raise AmbiguousDialectError(
                top_dialects
            )  # Raise exception if multiple dialects have the same score

    def update_sqlfluff_config(self, config_path: str, inferred_dialect: str) -> None:
        try:
            with open(config_path, "r") as config_file:
                config_lines = config_file.readlines()

            updated = False
            with open(config_path, "w") as config_file:
                for line in config_lines:
                    if line.strip().startswith("dialect ="):
                        config_file.write(f"dialect = {inferred_dialect}\n")
                        updated = True
                    else:
                        config_file.write(line)

                if not updated:
                    config_file.write(f"dialect = {inferred_dialect}\n")

            print(f"Updated .sqlfluff config with dialect: {inferred_dialect}")

        except Exception as e:
            print(f"Error updating .sqlfluff config: {e}")


def main(file_path: str) -> None:
    """Main function to run the SQL dialect inference."""
    inferrer = SQLDialectInferrer()
    try:
        dialect = inferrer.infer_dialect(file_path)
        print(dialect)
    except AmbiguousDialectError as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python sql_dialect_inferrer.py <path_to_sql_file>")
        sys.exit(1)
    main(sys.argv[1])
```

### Step 4: Create the Pre-Commit Configuration File:

In the root directory of your project, create a file named `.pre-commit-config.yaml` with the following content:

```yaml
---
fail_fast: false
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.3.0
    hooks:
      # General checks (see https://pre-commit.com/hooks.html)
      - id: trailing-whitespace
      - id: mixed-line-ending
      # Language file specific checks
      - id: check-yaml
        args: [ '--unsafe' ] # for the Source Validator
      - id: check-ast

  - repo: https://github.com/Lucas-C/pre-commit-hooks
    rev: v1.5.1
    hooks:
    # Convert CRLF to LF
    - id: remove-crlf
    # - id: remove-tabs

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
    - id: black
      args: ["-l", "90"]

  - repo: https://github.com/PyCQA/isort
    rev: 5.12.0
    hooks:
      - id: isort
        args: ["--profile", "black"]

  - repo: https://github.com/PyCQA/flake8
    rev: 6.0.0
    hooks:
      - id: flake8
        args: ["--max-line-length", "90"]

  - repo: https://github.com/adrienverge/yamllint.git
    rev: v1.29.0
    hooks:
      - id: yamllint
        args: [ '--strict' ]

  - repo: local
    hooks:
      - id: SQL_code_linter
        name: SQL_code_linter
        description: SQL code static analyser
        additional_dependencies: [sqlfluff==2.0.2, sqlparse==0.4.3]
        entry: >
          bash -c '
          for FILE in "$@"; do
              FILE_PATH=$(realpath -e ${FILE});
              DIALECT=$(python dialect_inferer.py "${FILE_PATH}");
              echo "Inferred dialect: ${DIALECT} for file: ${FILE}"
              sqlfluff lint --dialect "${DIALECT}" "${FILE}";
          done
          ' --
        types: [sql]
        language: python
        pass_filenames: true
```


Thereafter, run the following command to install the pre-commit hook so that it runs every time you commit code:

```bash
pre-commit install
```

### Step 5: GitHub Actions Integration

With GitHub Actions, we can take our static code analysis even a step further rather than assuming that engineers will checkin clean code. We leverage the automation that GH Actions provide by automating the static code analysis as part of our continous integration (CI) pipeline. This setup ensures that our code goes through vigorous quality checks on every push or pull request to the repository. This adds an extra layer of verification beyond our localk development environment.

Create a directory called `.github/workflows` in your repository (if it doesn't already exist). From the directory, create a new file named `static_code_analysis.yml`:

```yaml
cat .github/workflows/static_code_analysis.yml

---
name: Static Code Analysis

on:  # yamllint disable-line rule:truthy
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

jobs:
  linting:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout the repo
      uses: actions/checkout@v4
      with:
        fetch-depth: 0

    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10.11'

    - name: Cache Python dependencies
      uses: actions/cache@v3
      with:
        path: |
          ~/.cache/pip
          ~/.cache/pip-tools
          ~/.cache/pre-commit
        key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.in') }}
        restore-keys: |
          ${{ runner.os }}-pip-

    - id: file_changes
      uses: tj-actions/changed-files@v44

    - name: Install all Python dependencies.
      env:
        PYTHON_SRC_DIR: CICD
      run: |
        python -m pip install -U pip
        python -m pip install pip-tools
        pip-compile ${PYTHON_SRC_DIR}/requirements.in --output-file ${PYTHON_SRC_DIR}/requirements.out
        python -m pip install -r ${PYTHON_SRC_DIR}/requirements.out

    - name: Run the pre-commit.
      env:
        ALL_CHANGED_FILES: ${{ steps.file_changes.outputs.all_changed_files }}
        SKIP: no-commit-to-branch
      run: |
        set -e  # Exit with code 1, if a command fails
        echo ${ALL_CHANGED_FILES}
        if [ -n "${ALL_CHANGED_FILES}" ]; then
          echo "Running pre-commit on the following files: ${ALL_CHANGED_FILES}"
          pre-commit run --show-diff-on-failure --files ${ALL_CHANGED_FILES}
        else
          echo "No changed files to run pre-commit on."
        fi

    - name: Check for changes in Python files and commit them.
      id: check_python_changes
      run: |
        git config --global user.name "github-actions[bot]"
        git config --global user.email "github-actions[bot]@users.noreply.github.com"

        # Check for modified Python files after running pre-commit
        MODIFIED_PYTHON_FILES=$(git ls-files --modified | grep -E '\.py$' || echo '')

        if [ -n "$MODIFIED_PYTHON_FILES" ]; then
          echo "Changes detected in the following Python files:"
          echo "${MODIFIED_PYTHON_FILES}"

          git add "${MODIFIED_PYTHON_FILES}"
          git commit -m "Auto-format: Applied black and isort formatting to Python files"
          git push origin ${{ github.head_ref || github.ref_name }}
        fi
```

By integrating these steps into your GitHub Actions workflow, you create a seamless CI/CD process that not only enforces code quality but also reduces the manual effort required to maintain it. This automated approach helps maintain a high-standard for SQL, Python and other code in your repository eventually leading to a more reliable and robust software development practice.

## Reference

- [SQLFluff Docs](https://docs.sqlfluff.com/en/stable/index.html)
- [Pre-Commit Docs](https://pre-commit.com/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
