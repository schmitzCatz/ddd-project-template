# Tools

General purpose setup and tooling scripts for the repository.

## Scripts

| Script         | Description         |
|----------------|---------------------|
| `setup-labels` | Setup Github Lables |

### Setup Labels

Creates labels for GitHub issues and pull requests. Make sure to have ``gh`` installed and run ``gh auth login``
beforehand. If unsure you are already authenticated, run ``gh auth status``.

Options ``-DryRun`` will test of functionality without making any changes.

```bash
setup-labels.sh -DryRun
```



