# GitHub Workflows

This directory contains GitHub Actions workflows for the Ignite LAB590 repository.

## add-to-project.yml

This workflow automatically manages new issues by:

1. **Adding to Project**: Automatically adds newly opened issues to the Ignite GitHub Project
2. **Applying Labels**: Intelligently applies labels based on issue content

### Setup Requirements

To use this workflow, you need to configure the following:

1. **Project URL**: Set the `IGNITE_PROJECT_URL` repository variable to point to your GitHub Project
   - Example: `https://github.com/orgs/microsoft/projects/123`

2. **Secrets**: Configure the following repository secrets:
   - `ADD_TO_PROJECT_TOKEN`: A GitHub token with permissions to add items to projects

### Automatic Labeling

The workflow automatically applies labels based on issue title and body content:

- `needs-triage`: Applied to all new issues
- `bug`: Issues containing "bug" or "error"
- `enhancement`: Issues containing "feature" or "enhancement"  
- `documentation`: Issues containing "documentation" or "docs"
- `question`: Issues containing "question" or "help"
- `teams`: Issues related to Microsoft Teams
- `ai`: Issues related to AI functionality
- `lab`: Issues related to lab exercises

### Trigger

The workflow triggers on:
- Issue opened events

Both jobs (`add-to-project` and `label_issues`) run only for open issues.