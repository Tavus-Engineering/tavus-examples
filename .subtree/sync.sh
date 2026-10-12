#!/bin/bash

# Subtree Sync Script
# This script synchronizes all git subtrees with their source repositories

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

CONFIG_FILE="$ROOT_DIR/.subtree/config.json"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required but not installed. Please install jq to run this script.${NC}"
    echo "Install with: brew install jq (macOS) or apt-get install jq (Ubuntu)"
    exit 1
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}Error: Configuration file not found at $CONFIG_FILE${NC}"
    exit 1
fi

# Function to log with timestamp
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to sync a single subtree
sync_subtree() {
    local directory="$1"
    local repository="$2"
    local branch="$3"
    
    log "Syncing ${YELLOW}$directory${NC} from ${YELLOW}$repository${NC} (branch: $branch)"
    
    # Check if directory exists
    if [ ! -d "$ROOT_DIR/$directory" ]; then
        echo -e "${RED}Warning: Directory $directory does not exist. Skipping...${NC}"
        return 1
    fi
    
    # Add remote if it doesn't exist
    remote_name=$(echo "$directory" | sed 's/[^a-zA-Z0-9]/_/g')
    if ! git remote get-url "$remote_name" &> /dev/null; then
        log "Adding remote ${YELLOW}$remote_name${NC} for $repository"
        git remote add "$remote_name" "$repository" || {
            echo -e "${RED}Failed to add remote $remote_name${NC}"
            return 1
        }
    fi
    
    # Fetch from remote
    log "Fetching from remote ${YELLOW}$remote_name${NC}"
    git fetch "$remote_name" "$branch" || {
        echo -e "${RED}Failed to fetch from $remote_name${NC}"
        return 1
    }
    
    # Pull subtree changes
    log "Pulling subtree changes for ${YELLOW}$directory${NC}"
    git subtree pull --prefix="$directory" "$remote_name" "$branch" --squash || {
        echo -e "${RED}Failed to pull subtree changes for $directory${NC}"
        return 1
    }
    
    echo -e "${GREEN}✓ Successfully synced $directory${NC}"
    return 0
}

# Function to display help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Sync git subtrees with their source repositories"
    echo ""
    echo "Options:"
    echo "  -h, --help       Show this help message"
    echo "  -d, --dry-run    Show what would be synced without making changes"
    echo "  -s, --single     Sync only a specific subtree directory"
    echo "  -a, --auto-detect Auto-detect subtrees from git history (experimental)"
    echo "  --detect-only    Only detect and display subtrees, don't sync"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Sync all configured subtrees"
    echo "  $0 --dry-run                         # Show what would be synced"
    echo "  $0 --single examples/red_or_black    # Sync only red_or_black example"
    echo "  $0 --auto-detect                     # Auto-detect and sync all subtrees"
    echo "  $0 --detect-only                     # Just show detected subtrees"
}

# Function to auto-detect subtrees from git history
auto_detect_subtrees() {
    # Find all subtree commits and extract directory info
    git log --grep="git-subtree-dir" --format="%b" --all | \
    grep "git-subtree-dir:" | \
    sed 's/git-subtree-dir: //' | \
    while IFS= read -r directory; do
        if [ -n "$directory" ] && [ -d "$ROOT_DIR/$directory" ]; then
            echo "$directory"
        fi
    done | sort -u
}

# Function to detect subtree repository from remotes or commit history
detect_subtree_repository() {
    local directory="$1"
    
    # Try to find from existing remotes first
    remote_name=$(echo "$directory" | sed 's/[^a-zA-Z0-9]/_/g')
    if remote_url=$(git remote get-url "$remote_name" 2>/dev/null); then
        echo "$remote_url"
        return 0
    fi
    
    # Try to extract from recent subtree commits (look in commit messages)
    repository_url=$(git log --grep="Squashed '$directory/'" --format="%s" -n 5 | \
    head -n 1 | \
    grep -o 'https://github\.com/[^[:space:]]*\.git' | head -n 1)
    
    if [ -n "$repository_url" ]; then
        echo "$repository_url"
    else
        # Fallback: construct likely URL based on directory name
        echo "https://github.com/andy-tavus/$(basename "$directory").git"
    fi
}

# Parse command line arguments
DRY_RUN=false
SINGLE_DIR=""
AUTO_DETECT=false
DETECT_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -s|--single)
            SINGLE_DIR="$2"
            shift 2
            ;;
        -a|--auto-detect)
            AUTO_DETECT=true
            shift
            ;;
        --detect-only)
            DETECT_ONLY=true
            AUTO_DETECT=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Change to root directory
cd "$ROOT_DIR"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes. Consider committing them before syncing subtrees.${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

log "Starting subtree synchronization..."

# Initialize counters
success_count=0
error_count=0
total_count=0

if [ "$AUTO_DETECT" = true ]; then
    # Auto-detect mode
    log "Using auto-detection mode..."
    
    detected_subtrees=$(auto_detect_subtrees)
    
    if [ "$DETECT_ONLY" = true ]; then
        echo ""
        echo "🔍 Detected subtrees:"
        echo "==================="
        if [ -z "$detected_subtrees" ]; then
            echo "No subtrees detected in git history."
        else
            while IFS= read -r directory; do
                if [ -n "$directory" ]; then
                    repository=$(detect_subtree_repository "$directory")
                    echo -e "${YELLOW}$directory${NC} -> ${BLUE}$repository${NC}"
                fi
            done <<< "$detected_subtrees"
        fi
        echo ""
        echo "To sync these subtrees, run with --auto-detect (without --detect-only)"
        echo "Or add them to .subtree/config.json for permanent configuration"
        exit 0
    fi
    
    # Sync detected subtrees
    while IFS= read -r directory; do
        if [ -z "$directory" ]; then
            continue
        fi
        
        # Skip if single directory specified and this isn't it
        if [ -n "$SINGLE_DIR" ] && [ "$directory" != "$SINGLE_DIR" ]; then
            continue
        fi
        
        repository=$(detect_subtree_repository "$directory")
        branch="main"  # Default branch
        
        total_count=$((total_count + 1))
        
        if [ "$DRY_RUN" = true ]; then
            echo -e "${BLUE}[DRY RUN]${NC} Would sync ${YELLOW}$directory${NC} from ${YELLOW}$repository${NC} (branch: $branch)"
            continue
        fi
        
        if sync_subtree "$directory" "$repository" "$branch"; then
            success_count=$((success_count + 1))
        else
            error_count=$((error_count + 1))
        fi
        
        echo "" # Add spacing between subtrees
        
    done <<< "$detected_subtrees"
    
else
    # Configuration-based mode (default)
    log "Using configuration file: $CONFIG_FILE"
    
    # Parse JSON and sync each subtree
    while IFS= read -r subtree_data; do
        directory=$(echo "$subtree_data" | jq -r '.directory')
        repository=$(echo "$subtree_data" | jq -r '.repository')
        branch=$(echo "$subtree_data" | jq -r '.branch')
        
        # Skip if single directory specified and this isn't it
        if [ -n "$SINGLE_DIR" ] && [ "$directory" != "$SINGLE_DIR" ]; then
            continue
        fi
        
        total_count=$((total_count + 1))
        
        if [ "$DRY_RUN" = true ]; then
            echo -e "${BLUE}[DRY RUN]${NC} Would sync ${YELLOW}$directory${NC} from ${YELLOW}$repository${NC} (branch: $branch)"
            continue
        fi
        
        if sync_subtree "$directory" "$repository" "$branch"; then
            success_count=$((success_count + 1))
        else
            error_count=$((error_count + 1))
        fi
        
        echo "" # Add spacing between subtrees
        
    done < <(jq -c '.subtrees[]' "$CONFIG_FILE")
fi

if [ "$DRY_RUN" = true ]; then
    log "Dry run completed. Found ${YELLOW}$total_count${NC} subtrees to sync."
    exit 0
fi

# Summary
echo "=================================================="
log "Subtree synchronization completed!"
echo -e "${GREEN}✓ Success: $success_count${NC}"
if [ $error_count -gt 0 ]; then
    echo -e "${RED}✗ Errors: $error_count${NC}"
fi
echo -e "${BLUE}Total: $total_count${NC}"
echo "=================================================="

if [ $error_count -gt 0 ]; then
    exit 1
fi
