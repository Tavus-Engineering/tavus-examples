# Subtree Automation

This repository uses git subtrees to include code from multiple external repositories. This document explains the automated synchronization system that keeps all subtrees up-to-date with their source repositories.

## Overview

The automation consists of three main components:

1. **Configuration file** (`.subtree/config.json`) - Defines all subtrees and their source repositories
2. **Sync script** (`.subtree/sync.sh`) - Manual and programmatic subtree synchronization
3. **GitHub Actions workflow** (`.github/workflows/sync-subtrees.yml`) - Automated daily syncing

## Configuration

### Subtree Configuration File

The `.subtree/config.json` file defines all subtrees in the repository:

```json
{
  "subtrees": [
    {
      "directory": "examples/red_or_black",
      "repository": "https://github.com/andy-tavus/red_or_black.git",
      "branch": "main"
    }
  ]
}
```

**Fields:**
- `directory`: Path to the subtree directory within this repository
- `repository`: URL of the source repository
- `branch`: Branch to sync from (usually `main`)

### Adding a New Subtree

There are two approaches for handling new subtrees:

#### Approach 1: Configuration-Based (Recommended)

This approach gives you explicit control over which subtrees are synced:

1. **Add the subtree manually** (first time only):
   ```bash
   git subtree add --prefix=examples/new-example https://github.com/andy-tavus/new-example.git main --squash
   ```

2. **Update the configuration**:
   Add the new subtree to `.subtree/config.json`:
   ```json
   {
     "directory": "examples/new-example",
     "repository": "https://github.com/andy-tavus/new-example.git", 
     "branch": "main"
   }
   ```

3. **Commit the changes**:
   ```bash
   git add .subtree/config.json
   git commit -m "Add new-example subtree to automation"
   ```

#### Approach 2: Auto-Detection (Experimental)

This approach automatically finds and syncs all subtrees from git history:

1. **Add the subtree manually**:
   ```bash
   git subtree add --prefix=examples/new-example https://github.com/andy-tavus/new-example.git main --squash
   ```

2. **The subtree will be automatically detected**:
   ```bash
   # Check detection
   make detect-subtrees
   
   # Sync all detected subtrees
   make sync-auto-detect
   ```

**Pros of auto-detection:**
- ✅ No configuration maintenance required
- ✅ Automatically includes new subtrees
- ✅ Works with existing subtrees

**Cons of auto-detection:**
- ❌ Less control over which subtrees are synced
- ❌ Relies on git commit history parsing
- ❌ May not detect repository URLs correctly in all cases

**Recommendation:** Use the configuration-based approach for production workflows, and auto-detection for quick testing or one-off syncs.

## Manual Synchronization

### Using the Sync Script

The `.subtree/sync.sh` script provides several options for manual synchronization:

```bash
# Sync all configured subtrees
./.subtree/sync.sh

# Dry run to see what would be synced
./.subtree/sync.sh --dry-run

# Sync only a specific subtree
./.subtree/sync.sh --single examples/red_or_black

# Auto-detect and sync all subtrees from git history
./.subtree/sync.sh --auto-detect

# Just show detected subtrees (no syncing)
./.subtree/sync.sh --detect-only

# Show help
./.subtree/sync.sh --help
```

### Quick Commands via Makefile

```bash
# From the .subtree directory
cd .subtree

# Sync configured subtrees
make sync-subtrees

# Preview changes
make sync-dry-run

# Sync specific subtree
make sync-single DIR=examples/red_or_black

# Auto-detect and sync all subtrees
make sync-auto-detect

# Show detected subtrees
make detect-subtrees
```

### Prerequisites

- **jq**: Required for parsing the JSON configuration
  ```bash
  # macOS
  brew install jq
  
  # Ubuntu/Debian
  sudo apt-get install jq
  ```

### Script Features

- ✅ **Colorized output** for better readability
- ✅ **Progress tracking** with timestamps
- ✅ **Error handling** and detailed logging
- ✅ **Dry run mode** to preview changes
- ✅ **Single subtree sync** for targeted updates
- ✅ **Automatic remote management** (adds remotes as needed)
- ✅ **Safety checks** for uncommitted changes

## Automated Synchronization

### GitHub Actions Workflow

The repository includes a GitHub Actions workflow that automatically syncs subtrees:

**Triggers:**
- 🕕 **Daily schedule**: Runs at 6 AM UTC every day
- 🚀 **Manual trigger**: Can be run manually from GitHub Actions tab
- 📝 **Configuration changes**: Runs when automation files are modified

**Features:**
- ✅ **Automatic PR creation** for sync changes
- ✅ **Auto-merge** for scheduled syncs (optional)
- ✅ **Single directory sync** via manual trigger
- ✅ **Configuration validation** when config file changes
- ✅ **Detailed change summaries** in PR descriptions
- ✅ **Safety checks** for uncommitted changes
- ✅ **Auto-detection support** (can be enabled in workflow)

### Manual Workflow Triggers

You can manually trigger the workflow from the GitHub Actions tab with options:

1. **Single Directory** (optional): Specify a single subtree to sync
   - Example: `examples/red_or_black`

2. **Force Sync** (checkbox): Bypass uncommitted changes check
   - Use with caution - only when you're sure about pending changes

### Workflow Permissions

The workflow requires these permissions:
- `contents: write` - To create commits and push changes
- `pull-requests: write` - To create and manage pull requests

## Monitoring and Maintenance

### Checking Sync Status

1. **GitHub Actions tab**: View recent workflow runs and their status
2. **Pull Requests**: Look for automated PRs with the `subtree-sync` label
3. **Manual check**: Run `./scripts/sync-subtrees.sh --dry-run` locally

### Troubleshooting

**Common Issues:**

1. **Merge conflicts during subtree pull**:
   ```bash
   # Resolve conflicts manually, then:
   git add .
   git commit -m "Resolve subtree merge conflicts"
   ```

2. **Missing jq dependency**:
   ```bash
   # Install jq (see Prerequisites section)
   ```

3. **Permission issues in GitHub Actions**:
   - Check that the workflow has required permissions
   - Verify the `GITHUB_TOKEN` has appropriate scopes

4. **Subtree directory doesn't exist**:
   - The script will skip missing directories with a warning
   - Add the subtree manually first, then update configuration

### Maintenance Tasks

**Monthly:**
- Review automated PRs to ensure changes are expected
- Check that all subtrees are being synced successfully
- Update configuration if subtrees are added/removed

**When adding new subtrees:**
1. Add the subtree manually with `git subtree add`
2. Update `.subtree-config.json`
3. Test with `./scripts/sync-subtrees.sh --dry-run`

**When removing subtrees:**
1. Remove the directory: `git rm -r examples/old-example`
2. Remove from `.subtree-config.json`
3. Clean up any associated remotes if desired

## Security Considerations

- The automation uses `GITHUB_TOKEN` which has repository-level permissions
- Subtree sources should be trusted repositories
- Review automated PRs before merging, especially for scheduled syncs
- Consider using branch protection rules for additional safety

## Advanced Usage

### Custom Sync Frequency

To change the sync schedule, modify the cron expression in `.github/workflows/sync-subtrees.yml`:

```yaml
schedule:
  - cron: '0 6 * * *'  # Daily at 6 AM UTC
  # Examples:
  # - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 6 * * 1'    # Weekly on Mondays
```

### Disabling Auto-merge

To disable automatic merging of scheduled syncs, remove or comment out the `Auto-merge PR` step in the workflow.

### Custom Branch Names

The workflow creates branches with the pattern `sync-subtrees-{run_number}`. To customize this, modify the `branch` parameter in the `Create Pull Request` step.

## Contributing

When contributing to the automation system:

1. Test changes locally with the sync script
2. Update this documentation if adding new features
3. Consider backward compatibility when modifying the configuration format
4. Add appropriate error handling and logging

## Support

For issues with the subtree automation:

1. Check the GitHub Actions logs for detailed error messages
2. Run the sync script locally with verbose output
3. Verify the configuration file is valid JSON
4. Ensure all source repositories are accessible
