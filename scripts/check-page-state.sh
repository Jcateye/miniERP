#!/bin/bash
# check-page-state.sh - 检查页面状态
# 用法: check-page-state.sh [route]

set -e

REPO_ROOT="/Users/haoqi/OnePersonCompany/miniERP"
LEDGER_FILE="$REPO_ROOT/docs/page-state-ledger.md"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_route() {
    local ROUTE="$1"
    local PAGE_FILE="$REPO_ROOT/apps/web/src/app/(dashboard)${ROUTE}/page.tsx"
    
    if [[ ! -f "$PAGE_FILE" ]]; then
        echo -e "${RED}✗ $ROUTE: 页面文件不存在${NC}"
        return 1
    fi
    
    # 检查是否是 re-export
    if grep -q "export.*from.*page" "$PAGE_FILE" 2>/dev/null; then
        echo -e "${RED}✗ $ROUTE: re-export（禁止）${NC}"
        return 1
    fi
    
    # 检查是否使用 RoutePlaceholderPage
    if grep -q "RoutePlaceholderPage" "$PAGE_FILE" 2>/dev/null; then
        echo -e "${YELLOW}⚠ $ROUTE: placeholder${NC}"
        return 0
    fi
    
    # 检查是否有 page-view
    local VIEW_DIR="$REPO_ROOT/apps/web/src/components/views/erp"
    local ROUTE_NAME=$(basename "$ROUTE")
    if ls "$VIEW_DIR"/*"$ROUTE_NAME"*-view.tsx 2>/dev/null | head -1 > /dev/null; then
        echo -e "${GREEN}✓ $ROUTE: page-view${NC}"
        return 0
    fi
    
    # 默认
    echo -e "${BLUE}? $ROUTE: 状态未知${NC}"
    return 1
}

check_all() {
    echo -e "${BLUE}=== 页面状态检查 ===${NC}\n"
    
    local TOTAL=0
    local PASS=0
    local FAIL=0
    
    # 从台账读取路由列表
    if [[ ! -f "$LEDGER_FILE" ]]; then
        echo -e "${RED}✗ 页面状态台账不存在: $LEDGER_FILE${NC}"
        exit 1
    fi
    
    # 简单解析台账中的路由
    ROUTES=$(grep -E '^\| /' "$LEDGER_FILE" | awk -F'|' '{print $2}' | tr -d ' ')
    
    for ROUTE in $ROUTES; do
        if [[ -n "$ROUTE" ]]; then
            TOTAL=$((TOTAL + 1))
            if check_route "$ROUTE"; then
                PASS=$((PASS + 1))
            else
                FAIL=$((FAIL + 1))
            fi
        fi
    done
    
    echo ""
    echo -e "${BLUE}统计：${TOTAL} 页面，${GREEN}${PASS} 通过${NC}，${RED}${FAIL} 失败${NC}"
    
    if [[ $FAIL -gt 0 ]]; then
        exit 1
    fi
}

if [[ -n "$1" ]]; then
    check_route "$1"
else
    check_all
fi
