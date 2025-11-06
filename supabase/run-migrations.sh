#!/bin/bash

# ============================================================================
# Supabase Migration Runner Script
# ============================================================================
# Description: Runs all database migrations in order
# Usage: ./supabase/run-migrations.sh
# Requirements: Supabase CLI installed and project linked
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATIONS_DIR="$SCRIPT_DIR/migrations"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Supabase Migration Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================================================
# Check Prerequisites
# ============================================================================

echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}ERROR: Supabase CLI is not installed${NC}"
    echo ""
    echo "Please install the Supabase CLI:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo -e "${GREEN}✓ Supabase CLI is installed${NC}"

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}ERROR: Migrations directory not found at $MIGRATIONS_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Migrations directory found${NC}"

# Count migration files
MIGRATION_COUNT=$(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | wc -l)
if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo -e "${RED}ERROR: No migration files found in $MIGRATIONS_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found $MIGRATION_COUNT migration files${NC}"
echo ""

# ============================================================================
# Check Supabase Project Link
# ============================================================================

echo -e "${YELLOW}Checking Supabase project link...${NC}"

# Check if project is linked
if [ ! -f "$PROJECT_ROOT/.git/config" ] || ! supabase status &> /dev/null; then
    echo -e "${YELLOW}Project is not linked to a Supabase project${NC}"
    echo ""
    echo "To link your project, you need your Supabase project reference ID."
    echo ""
    echo "You can find it here:"
    echo "  1. Go to https://app.supabase.com"
    echo "  2. Select your project"
    echo "  3. Go to Settings > General"
    echo "  4. Find 'Reference ID' under Project Settings"
    echo ""
    read -p "Enter your Supabase project reference ID: " PROJECT_REF

    if [ -z "$PROJECT_REF" ]; then
        echo -e "${RED}ERROR: No project reference ID provided${NC}"
        exit 1
    fi

    echo ""
    echo -e "${YELLOW}Linking to Supabase project...${NC}"
    supabase link --project-ref "$PROJECT_REF" || {
        echo -e "${RED}ERROR: Failed to link to Supabase project${NC}"
        exit 1
    }
    echo -e "${GREEN}✓ Successfully linked to Supabase project${NC}"
else
    echo -e "${GREEN}✓ Project is already linked${NC}"
fi

echo ""

# ============================================================================
# Run Migrations
# ============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Running Migrations${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Ask for confirmation
read -p "Run all migrations? This will modify your database. (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Migration cancelled by user${NC}"
    exit 0
fi

echo ""

# Counter for successful migrations
SUCCESSFUL=0
FAILED=0

# Run each migration in order
for MIGRATION_FILE in "$MIGRATIONS_DIR"/*.sql; do
    MIGRATION_NAME=$(basename "$MIGRATION_FILE")

    echo -e "${YELLOW}Running: $MIGRATION_NAME${NC}"

    # Execute the migration
    if supabase db execute -f "$MIGRATION_FILE" 2>&1; then
        echo -e "${GREEN}✓ Success: $MIGRATION_NAME${NC}"
        ((SUCCESSFUL++))
    else
        echo -e "${RED}✗ Failed: $MIGRATION_NAME${NC}"
        ((FAILED++))

        # Ask if we should continue
        read -p "Continue with remaining migrations? (y/N): " CONTINUE
        if [[ ! "$CONTINUE" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Migration process stopped by user${NC}"
            break
        fi
    fi

    echo ""
done

# ============================================================================
# Summary
# ============================================================================

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Migration Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Total migrations: $MIGRATION_COUNT"
echo -e "${GREEN}Successful: $SUCCESSFUL${NC}"

if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
fi

echo ""

if [ "$FAILED" -eq 0 ] && [ "$SUCCESSFUL" -eq "$MIGRATION_COUNT" ]; then
    echo -e "${GREEN}All migrations completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Verify tables in Supabase Dashboard > Table Editor"
    echo "  2. Check RLS policies in Authentication > Policies"
    echo "  3. Update your .env files with Supabase credentials"
    echo "  4. Start building your application!"
    exit 0
else
    echo -e "${YELLOW}Some migrations failed or were skipped${NC}"
    echo ""
    echo "Please check the error messages above and:"
    echo "  1. Review the failed migration files"
    echo "  2. Check Supabase logs for detailed errors"
    echo "  3. Fix any issues and re-run this script"
    exit 1
fi
