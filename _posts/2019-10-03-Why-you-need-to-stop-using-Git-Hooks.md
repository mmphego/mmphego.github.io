---
layout: post
title: "Why You Need To Stop Using Git-Hooks"
date: 2019-10-03 11:28:54.000000000 +02:00
tags:

---

{:refdef: style="text-align: center;"}
![post image]({{ "/assets/2019-10-03-Why-you-need-to-stop-using-Git-Hooks.jpg" | absolute_url }})
{: refdef}

10 Min Read

<!-- {:refdef: style="text-align: right;"}
<figure>
    <figcaption>Listen to this article:</figcaption>
    <audio controls src="https://raw.githubusercontent.com/mmphego/mmphego.github.io/master/assets/2019-09-02-I-built-an-automated-irrigation-system-because-im-lazy.mp3"> Your browser does not support the <code>audio</code> element.
    </audio>
</figure>
{: refdef}
 -->
-----------------------------------------------------------------------------------------

# The Story

## TL;DR

Native Git-hooks are very useful but have some shortcomings around installation, maintainability and re-usability. But there's a great alternative...

## TS;RE

[Git-Hooks](https://githooks.com/) are great way to execute custom actions triggered by various git events on the local machine, in order to identify bugs/issues before committing and pushing our work for review. Ideally these hooks are ran on every commit to automatically point out issues/bugs in
the code, for example: missing semicolons, trailing whitespace, docstrings
violations, Python module sorting and etc.

For the longest time, I have been using [git-hooks](https://githooks.com/) mainly for `pre-commit` and `prepare-commit-msg`. You can find my *deprecated git-hooks* [here](http://bit.ly/2MOKasK)

- `pre-commit`: A script written in `bash/shell` that gets called by a `git commit`, and then execute linting depending on the file being staged. Exiting this hook with a non-zero status will abort the commit, which makes it extremely useful for last-minute quality checks.

- `prepare-commit-msg`: A script called by `git commit` that automatically prepends the commit message with the [Jira](https://www.atlassian.com/software/jira) ticket link based on the branch name.

Githooks are great for pointing out any issues before committing any form of work and submitting for review, this allows reviewer to direct their focus on the architecture of a change than wasting time on trivial style nitpicks.

IMHO, they have some shortcomings around installation, maintainability and re-usability, let me try to explain.

- Installation:

    Git hooks normally live inside the `.git/hooks` folders of local repositories. They can contain one executable per trigger event, such as `pre-commit` or `prepare-commit-msg`, which is run automatically by various git commands. It sounds magical, so you'd think what's the problem with this?

    The `.git` folder is excluded from version control (i.e., You won't be able to track it's life-cycle), it only lives on your machine. To get a hook in place, you either have to copy an executable file with the trigger’s name into the `.git/hooks` folder or symlink one into it. It becomes cumbersome sharing hooks across various libraries or repositories and manually making changes to suit each individual repository.

- Maintainability:

    The next problem is that you can have one of these files per event. You can then write a long Bash script (see my [pre-commit](https://github.com/mmphego/git-hooks/blob/master/hooks/pre-commit), for instance) to execute multiple actions for one trigger or split the actions to several individual files, and then create a main entry point to run the additional functionalities in the divided files. It is fully feasible, but it is tedious to maintain

- Re-usability:

    The last point concerns the re-usability, both for the setup and for the hooks. Doing so manually, you need to get the hook script and copy it or symlink it in each repository you want to use. You would also like to see your setup move with you when switching workstations/systems, without the going through the above-mentioned setup for each project.

    You may also want to have these hooks executed for all same type of projects, for example, of updating Python dependencies or executing [flake8](https://flake8.pycqa.org/en/latest/) checks before each commit, etc. You would have to copy and create your hook for each project automatically, with an out-of-the-box setup, which over time became painful and tedious for me to use which led me to use my hooks less.

With all that said, do not get me wrong, I love the concept of Git hooks, and they can be very useful in a number of ways. However, portability and maintenance is an issue.

This post will detail why you should probably consider ditching your native git-hooks (Assuming you currently use them), reasons stated above. But nature abhors a vacuum, so we would need to replace native git-hooks with an alternative. Enters [pre-commit](https://pre-commit.com).

# The How

According to the [website](https://pre-commit.com):
> Pre-commit is a framework for managing and maintaining multi-language pre-commit hooks, which is far more flexible and feature-rich than native git-hooks.

`pre-commit` makes it easier for the developer to specify a list of hooks they want and `pre-commit` manages the installation and execution of any hook written in any language before every commit, in a completely isolated environment and does not require `root` access.

## Why Do You Need It

- Gently enforced best consistent practices between all team members or contributors.
- No need to fight with the reviewer about code formatting (PEP-8 violations), pre-commit can enforce it using the same coding standards across your team.
- Improved code quality == More green pipelines on your CI.
- Human time is expensive i.e. less time spent reviewing and quoting (PEP-8) coding standards.

# The Walkthrough

## Installation
Setting up pre-commit is straight forward, Run (alternatively [read the docs.](https://pre-commit.com/#install)):

`pip install pre-commit`

## Configuration
Once the package is installed you would need to configure pre-commit, so that it knows what you want - right!


Follow these simple steps and you should be good to go:

- `cd` to any repository you want to install pre-commit hooks.
- create a file named `.pre-commit-config.yaml` (alternatively you can generate a template by running:  `pre-commit sample-config > .pre-commit-config.yaml`
- If you opted for the option to create `.pre-commit-config.yaml` manually then copy and paste the following code to it.

```yaml
# See https://pre-commit.com for more information
# See https://pre-commit.com/hooks.html for more hooks
repos:
-   repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v2.0.0
    hooks:
    -   id: trailing-whitespace
    -   id: end-of-file-fixer
    -   id: check-yaml
    -   id: check-added-large-files
-   repo: https://github.com/psf/black
    rev: 19.3b0
    hooks:
    -   id: black
```

**Note:** `pre-commit` (hooks) are not restricted to one programming language.

You can add all kinds of hooks - linting, automatic formatting, safety checks, tests, custom scripts the list is endless alternatively you can use [the official hooks.](https://github.com/pre-commit/pre-commit-hooks)

## Hooks Installation

In order to have pre-commit run every time you commit, run;

`pre-commit install`

Now every time you execute `git commit`, `pre-commit` will run the hooks defined above.

**Note:** `git commit -n` bypasses/disables `pre-commit`hooks, but not advised consider benefits gained vs time.

Alternatively, one would like to run `pre-commit` manually time to time.
Running `pre-commit run --all-files` will run all hooks against current changes in your repository or,

If you wish to execute an individual hooks use `pre-commit run <hook_id>.`
Example:

-   `pre-commit run black`, this will execute
    [black](https://github.com/psf/black) on the current working directory.
    [Black](https://github.com/psf/black) is the uncompromising Python code formatter.


If like me you rather prefer to have `pre-commit hooks` installed every time your clone or create a new repository. Run;

- `mkdir -p ~/.git-template`
- `git config --global init.templateDir ~/.git-template` : This tells git to copy everything in ~/.git-templates to your per-project .git/ directory when you run git init
- `pre-commit init-templatedir ~/.git-template` : This will install the current hooks into the template directory and ensure that everytime you clone or create a repository pre-commit hooks will be installed.

# Custom Hooks

It's easy to [create your own custom hooks](https://pre-commit.com/#new-hooks) and share them with the community.
Since I deprecated [my native git-hooks](http://bit.ly/2MOKasK), I have been constantly updating (WIP) [my custom hooks](https://github.com/mmphego/pre-commit-hooks) which you are more than welcome to checkout and contributions are welcome.

Alternatively see my `.pre-commit-config.yaml`

```yaml
##########################################################################################
#                                                                                        #
#                       Pre-commit configuration file                                    #
#                                                                                        #
##########################################################################################
---
default_language_version:
    python: python3

repos:
    ####################################### Various Checks ###############################
    # Various checks
    -   repo: https://github.com/pre-commit/pre-commit-hooks
        rev: v2.3.0
        hooks:
        -   id: check-ast
            name: check-ast
            description: Simply check whether files parse as valid python.
        -   id: check-builtin-literals
            name: check-builtin-literals
            description: Require literal syntax when initializing empty,
                         or zero Python builtin types.
        -   id: check-docstring-first
            name: check-docstring-first
            description: Checks for a common error of placing code before the docstring.
        -   id: check-added-large-files
            name: check-added-large-files
            description: Prevent giant files from being committed.
        -   id: check-merge-conflict
            name: check-merge-conflict
            description: Check for files that contain merge conflict strings.
        -   id: check-symlinks
            name: check-symlinks
            description: Checks for symlinks which do not point to anything.
        -   id: check-yaml
            name: check-yaml
            description: Attempts to load all yaml files to verify syntax.
        -   id: check-toml
            name: check-toml
            description: Attempts to load all TOML files to verify syntax.
        -   id: debug-statements
            name: debug-statements
            description: Check for debugger imports and py37+ breakpoint() calls in python source.
        -   id: detect-private-key
            name: detect-private-key
            description: Checks for the existence of private keys.
        -   id: end-of-file-fixer
            name: end-of-file-fixer
            description: Makes sure files end in a newline and only a newline.
        -   id: trailing-whitespace
            name: trailing-whitespace
            description: Trims trailing whitespace
        -   id: requirements-txt-fixer
            name: requirements-txt-fixer
            description: Sorts entries in requirements.txt

    -   repo: local
        hooks:
        # Python minor syntax related checks
        # https://github.com/Pike/pygrep
        -   id: python-check-mock-methods
            name: python-check-mock-methods
            description: Prevent common mistakes of `assert mck.not_called()`, `assert mck.called_once_with(...)`
                        and `mck.assert_called`.
            language: pygrep
            entry: >
                (?x)(
                    assert .*\.(
                        not_called|
                        called_
                    )|
                    \.assert_(
                        any_call|
                        called|
                        called_once|
                        called_once_with|
                        called_with|
                        has_calls|
                        not_called
                    )($|[^(\w])
                )
            types: [python]

        -   id: python-no-eval
            name: python-no-eval
            description: 'A quick check for the `eval()` built-in function'
            entry: '\beval\('
            language: pygrep
            types: [python]

        -   id: python-no-log-warn
            name: python-no-log-warn
            description: 'A quick check for the deprecated `.warn()` method of python loggers'
            entry: '(?<!warnings)\.warn\('
            language: pygrep
            types: [python]

        -   id: python-use-type-annotations
            name: python-use-type-annotations
            description: 'Enforce that python3.6+ type annotations are used instead of type comments'
            entry: '# type(?!: *ignore *($|#))'
            language: pygrep
            types: [python]

        # Python security check
        # https://bandit.readthedocs.io/en/latest/
        -   id: bandit
            name: bandit
            description: Find common security issues in your Python code using bandit
            entry: bandit
            args: [
                '-ll',
                '--ini', 'setup.cfg',
                '--recursive',
            ]
            language: python
            types: [python]

        # Vulture
        # https://github.com/jendrikseipp/vulture
        -   id: vulture
            name: vulture
            description: Find dead Python code
            entry: vulture
            args: [
                "--min-confidence", "90",
                "--exclude", "*env*", "docs/",
                ".",
            ]
            language: system
            types: [python]

        # Jira Ticket Link Prepender
        -   repo: https://github.com/mmphego/prepend-jira-ticket-link
            rev: master
            hooks:
            -   id: prepend-jira-link
                description: Appends ticket number and link below commit message based on branch name

    ####################################### Linters ######################################
    -   repo: local
        hooks:
        # Flake8 Linter
        # https://flake8.pycqa.org/en/latest/
        -   id: flake8
            name: flake8
            description: Python style guide enforcement
            entry: flake8
            args: ["--config=setup.cfg"]
            additional_dependencies: [
                flake8-2020, # flake8 plugin which checks for misuse of `sys.version` or `sys.version_info`
                flake8-blind-except, # A flake8 extension that checks for blind except: statements
                flake8-bugbear, # A plugin for flake8 finding likely bugs and design problems in your program.
                                # Contains warnings that don't belong in pyflakes and pycodestyle.
                flake8-builtins, # Check for python builtins being used as variables or parameters.
                flake8-comprehensions, # It helps you write better list/set/dict comprehensions.
                flake8-copyright, # Adds copyright checks to flake8
                flake8-deprecated, # Warns about deprecated method calls.
                dlint, # Dlint is a tool for encouraging best coding practices and helping ensure we're writing secure Python code.
                flake8-docstrings, # Extension for flake8 which uses pydocstyle to check docstrings
                # flake8-eradicate, # Flake8 plugin to find commented out code
                flake8-license,
                pandas-vet, # A Flake8 plugin that provides opinionated linting for pandas code
                flake8-pytest, # pytest assert checker plugin for flake8
                flake8-variables-names, # flake8 extension that helps to make more readable variables names
                flake8-tabs, # Tab (or Spaces) indentation style checker for flake8
                pep8-naming, # Check PEP-8 naming conventions, plugin for flake8
            ]
            language: python
            types: [python]

        # MyPy Linter
        # https://mypy.readthedocs.io/en/latest/
        -   id: mypy
            name: mypy
            description: Optional static typing for Python 3 and 2 (PEP 484)
            entry: mypy
            args: ["--config-file", "setup.cfg"]
            language: python
            types: [python]

        # PyDocstyle
        # https://github.com/PyCQA/pydocstyle
        -   id: pydocstyle
            name: pydocstyle
            description: pydocstyle is a static analysis tool for checking compliance with Python docstring conventions.
            entry: pydocstyle
            args: ["--config=setup.cfg", "--count"]
            language: python
            types: [python]

        # YAML Linter
        -   id: yamllint
            name: yamllint
            description: A linter for YAML files.
            # https://yamllint.readthedocs.io/en/stable/configuration.html#custom-configuration-without-a-config-file
            entry: yamllint
            args: [
                '--format', 'parsable',
                '--strict',
                '-d', "{
                    extends: relaxed,
                    rules: {
                        hyphens: {max-spaces-after: 4},
                        indentation: {spaces: consistent, indent-sequences: whatever,},
                        key-duplicates: {},
                        line-length: {max: 90}},
                    }"
            ]
            language: system
            types: [python]
            additional_dependencies: [yamllint]

        # Shell Linter
        # NOTE: Hook requires shellcheck [installed].

        -   id: shellcheck
            name: shellcheck (local)
            language: script
            entry: scripts/shellcheck.sh
            types: [shell]
            args: [-e, SC1091]
            additional_dependencies: [shellcheck]

        # Prose (speech or writing) Linter
        -   id: proselint
            name: proselint
            description: An English prose (speech or writing) linter
            entry: proselint
            language: system
            types: [ rst, markdown ]
            additional_dependencies: [proselint]


    ################################### Code Format ######################################
    -   repo: local
        hooks:
        # pyupgrade
        # Upgrade Python syntax
        -   id: pyupgrade
            name: pyupgrade
            description: Automatically upgrade syntax for newer versions of the language.
            entry: pyupgrade
            args: ['--py3-plus']
            language: python
            types: [python]
            additional_dependencies: [pyupgrade]

        # Sort imports
        # https://github.com/timothycrosley/isort
        -   id: isort
            name: isort
            description: Library to sort imports.
            entry: isort
            args: [
                "--recursive",
                "--settings-path", "setup.cfg"
            ]
            language: python
            types: [python]

        # Manifest.in checker
        # https://github.com/mgedmin/check-manifest
        -   id: check-manifest
            name: check-manifest
            description: Check the completeness of MANIFEST.in for Python packages.
            entry: check-manifest
            language: python
            types: [python]

        # pycodestyle code format
        # https://pypi.python.org/pypi/autopep8/
        -   id: autopep8
            name: autopep8
            description: A tool that automatically formats Python code to conform to the PEP 8 style guide.
            entry: autopep8
            args: [
                '--in-place',
                '--aggressive', '--aggressive',
                '--global-config', 'setup.cfg',
            ]
            language: python
            types: [python]

        # Python code format
        # https://github.com/psf/black/
        -   id: black
            name: black
            description: The uncompromising Python code formatter
            entry: black
            args: [
                '--line-length', '90',
                '--target-version', 'py36'
            ]
            language: python
            types: [python]

################################### Test Runner ##########################################
    -   repo: local
        hooks:
        -   id: tests
            name: run tests
            description: Run pytest
            entry: pytest -sv
            language: system
            types: [python]
            stages: [push]
```

Assuming both pre-commit and pre-push are installed (`pre-commit install && pre-commit install -t pre-push`), it will:

**During Commit Stage**

- Check whether files parse as valid Python.
- Require literal syntax when initializing empty, or zero Python builtin types.
- Checks for a common error of placing code before the docstring.
- Prevent giant files from being committed.
- Check for files that contain merge conflict strings.
- Checks for dead symlinks.
- Check for `yaml` syntax.
- Check for `TOML` syntax.
- Check for debugger imports and py37+ breakpoint() calls in python source.
- Checks for the existence of private keys.
- Makes sure files end in a newline and only a newline.
- Trims trailing whitespace.
- Sorts entries in `requirements.txt`.
- Prevent common mistakes of `assert mck.not_called()`, `assert mck.called_once_with(...)` and `mck.assert_called`.mck.called_once_with(...)`
- Check if `eval()` built-in function is used.
- Check if deprecated `.warn()` method of python loggers.
- Enforce that python3.6+ type annotations are used instead of type comments.
- Find common security issues in your Python code using `bandit`.
- Append JIRA ticket number and link below commit message, if branch name contains ticket number.
- Python style guide enforcement using `flake8`.
- Optional static typing for Python 3 and 2 (PEP 484)
- Static analysis tool for checking compliance with Python docstring conventions.
- A linter for YAML files.
- A static anaylsis tool that automatically finds bugs in your shell scripts.
- An English prose (speech or writing) linter.
- Automatically upgrade syntax for newer versions of the language.
- Sort imports.
- Check the completeness of `MANIFEST.in` for Python packages.
- Automatically format Python code to conform to the PEP 8 style guide. (Optional)
- The uncompromising Python code formatter.

**During Push Stage**

- Runs also [pytest](https://docs.pytest.org/en/latest/) with verbose and no-capture flag.


You should see something like this in the command line while committing/pushing:

```bash
check-ast............................................(no files to check)Skipped
check-builtin-literals...............................(no files to check)Skipped
check-docstring-first................................(no files to check)Skipped
check-added-large-files..................................................Passed
check-merge-conflict.....................................................Passed
check-symlinks.......................................(no files to check)Skipped
check-yaml...............................................................Passed
check-toml...............................................................Passed
debug-statements.....................................(no files to check)Skipped
detect-private-key.......................................................Passed
end-of-file-fixer........................................................Passed
trailing-whitespace......................................................Passed
requirements-txt-fixer...............................(no files to check)Skipped
python-check-mock-methods............................(no files to check)Skipped
python-no-eval.......................................(no files to check)Skipped
python-no-log-warn...................................(no files to check)Skipped
python-use-type-annotations..........................(no files to check)Skipped
bandit...............................................(no files to check)Skipped
flake8...............................................(no files to check)Skipped
mypy.................................................(no files to check)Skipped
pydocstyle...........................................(no files to check)Skipped
yamllint.............................................(no files to check)Skipped
shellcheck (local).......................................................Passed
proselint............................................(no files to check)Skipped
pyupgrade............................................(no files to check)Skipped
isort................................................(no files to check)Skipped
check-manifest.......................................(no files to check)Skipped
autopep8.............................................(no files to check)Skipped
black................................................(no files to check)Skipped
```

# Conclusion

If you’ve followed along this far, you should be able to see the different ways and benefits that pre-commit hooks can help automate some of your tasks. They can help you deploy your code, or help you maintain quality standards by rejecting non-conformant changes or commit messages. Go [here](https://pre-commit.com/#usage-in-continuous-integration), further reading on how to use `pre-commit` in your CI environment.

# Reference

- [[Podcast] Keep Your Code Clean Using pre-commit with Anthony Sottile - Episode 178](https://www.podcastinit.com/pre-commit-with-anthony-sottile-episode-178/)
- [[Manual] pre-commit](https://pre-commit.com/)
- [[Blog] Githooks: auto-install hooks](https://blog.viktoradam.net/2018/07/26/githooks-auto-install-hooks/)
- [[Blog] Pre-commit is awesome](https://blog.jerrycodes.com/pre-commit-is-awesome/)
- [[Blog] Automate Python workflow using pre-commits: black and flake8](https://ljvmiranda921.github.io/notebook/2018/06/21/precommits-using-black-and-flake8/)
- [[Tutorial] How To Use Git Hooks To Automate Development and Deployment Tasks](https://www.digitalocean.com/community/tutorials/how-to-use-git-hooks-to-automate-development-and-deployment-tasks)
- [[Blog] Automatically check your Python code for errors before committing.](https://blog.mphomphego.co.za/blog/2018/06/28/Automatically-check-your-Python-code-for-errors-before-committing.html)