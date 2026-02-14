# Internal Subtree Automation

This directory contains the internal tooling for managing git subtrees in this repository.

## Quick Start

```bash
# From repository root
cd .subtree

# See all available commands
make help

# Sync all subtrees
make sync-subtrees

# Auto-detect and sync all subtrees (includes any new ones)
make sync-auto-detect
```

## Files

- `config.json` - Configuration mapping subtrees to their source repositories
- `sync.sh` - Main sync script with various options
- `Makefile` - Convenient commands
- `README.md` - Full documentation
- `.github/workflows/sync-subtrees.yml` - Automated daily syncing via GitHub Actions

## Why Hidden?

This automation is internal tooling and is hidden from public repo browsing to keep the main repository focused on the examples themselves, not the infrastructure that manages them.

The `.subtree/` directory is tracked in git but hidden from casual browsing due to the dot prefix.
