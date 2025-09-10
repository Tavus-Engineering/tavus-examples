# Tavus Examples - Makefile
# Convenience commands for subtree management

.PHONY: help sync-subtrees sync-dry-run sync-single sync-auto-detect detect-subtrees install-deps

help: ## Show this help message
	@echo "Tavus Examples - Subtree Management"
	@echo "=================================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Examples:"
	@echo "  make sync-subtrees                    # Sync configured subtrees"
	@echo "  make sync-dry-run                     # Preview what would be synced"
	@echo "  make sync-single DIR=examples/red_or_black  # Sync specific subtree"
	@echo "  make sync-auto-detect                 # Auto-detect and sync all subtrees"
	@echo "  make detect-subtrees                  # Just show detected subtrees"

install-deps: ## Install required dependencies (jq)
	@echo "Installing dependencies..."
	@if command -v brew >/dev/null 2>&1; then \
		echo "Installing jq via Homebrew..."; \
		brew install jq; \
	elif command -v apt-get >/dev/null 2>&1; then \
		echo "Installing jq via apt..."; \
		sudo apt-get update && sudo apt-get install -y jq; \
	else \
		echo "Please install jq manually for your system"; \
		echo "See: https://stedolan.github.io/jq/download/"; \
		exit 1; \
	fi
	@echo "✅ Dependencies installed"

sync-subtrees: ## Sync all subtrees with their source repositories
	@echo "🔄 Syncing all subtrees..."
	@./.subtree/sync.sh

sync-dry-run: ## Show what would be synced without making changes
	@echo "🔍 Dry run - showing what would be synced..."
	@./.subtree/sync.sh --dry-run

sync-single: ## Sync a single subtree (use: make sync-single DIR=examples/red_or_black)
	@if [ -z "$(DIR)" ]; then \
		echo "❌ Please specify DIR parameter"; \
		echo "Example: make sync-single DIR=examples/red_or_black"; \
		exit 1; \
	fi
	@echo "🎯 Syncing single subtree: $(DIR)"
	@./.subtree/sync.sh --single $(DIR)

sync-auto-detect: ## Auto-detect and sync all subtrees from git history
	@echo "🔍 Auto-detecting and syncing all subtrees..."
	@./.subtree/sync.sh --auto-detect

detect-subtrees: ## Show all subtrees detected from git history
	@echo "🔍 Detecting subtrees from git history..."
	@./.subtree/sync.sh --detect-only

validate-config: ## Validate the subtree configuration file
	@echo "🔍 Validating subtree configuration..."
	@if command -v jq >/dev/null 2>&1; then \
		if jq empty .subtree/config.json; then \
			echo "✅ Configuration is valid JSON"; \
			jq -r '.subtrees[] | "  - \(.directory) -> \(.repository) (\(.branch))"' .subtree/config.json; \
		else \
			echo "❌ Invalid JSON in .subtree/config.json"; \
			exit 1; \
		fi \
	else \
		echo "❌ jq is required. Run 'make install-deps' first"; \
		exit 1; \
	fi

check-status: ## Check git status and subtree configuration
	@echo "📊 Repository Status"
	@echo "==================="
	@echo ""
	@echo "Git status:"
	@git status --short
	@echo ""
	@echo "Configured subtrees:"
	@make validate-config 2>/dev/null | grep "  -" || echo "  (none configured)"
	@echo ""
	@echo "Recent subtree commits:"
	@git log --grep="git-subtree" --oneline -n 5 || echo "  (no subtree commits found)"
