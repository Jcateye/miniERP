#!/bin/bash
# check-docs-consistency.sh - 检查四文档一致性
# 用法: check-docs-consistency.sh

set -e

REPO_ROOT="/Users/haoqi/OnePersonCompany/miniERP"
DOCS=(
    "$REPO_ROOT/CLAUDE.md"
    "$REPO_ROOT/AGENTS.md"
    "$REPO_ROOT/README.md"
    "$REPO_ROOT/CLAW.md"
)

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== 四文档一致性检查 ===${NC}\n"

# 检查文件存在性
for DOC in "${DOCS[@]}"; do
    if [[ ! -f "$DOC" ]]; then
        echo -e "${RED}✗ 文档不存在: $(basename $DOC)${NC}"
        exit 1
    fi
done

# 检查 T1/T2/T3/T4 定义
echo "检查 T1/T2/T3/T4 定义..."
for DOC in "${DOCS[@]}"; do
    if grep -q "T1.*Hub.*Dashboard" "$DOC" && \
       grep -q "T2.*List.*Index" "$DOC" && \
       grep -q "T3.*Detail.*Record" "$DOC" && \
       grep -q "T4.*Flow.*Wizard" "$DOC"; then
        echo -e "${GREEN}✓ $(basename $DOC): T1/T2/T3/T4 定义一致${NC}"
    else
        echo -e "${RED}✗ $(basename $DOC): T1/T2/T3/T4 定义不一致${NC}"
        exit 1
    fi
done

# 检查工程红线数量
echo ""
echo "检查工程红线数量..."
for DOC in "${DOCS[@]}"; do
    LINES=$(grep -c "工程红线\|Engineering redlines" "$DOC" || true)
    if [[ $LINES -gt 0 ]]; then
        echo -e "${GREEN}✓ $(basename $DOC): 包含工程红线章节${NC}"
    else
        echo -e "${YELLOW}⚠ $(basename $DOC): 缺少工程红线章节${NC}"
    fi
done

# 检查禁止万能装配器
echo ""
echo "检查禁止万能装配器..."
for DOC in "${DOCS[@]}"; do
    if grep -q "WorkbenchAssembly.*OverviewAssembly.*legacy" "$DOC" || \
       grep -q "禁止.*万能.*装配器" "$DOC"; then
        echo -e "${GREEN}✓ $(basename $DOC): 禁止万能装配器${NC}"
    else
        echo -e "${RED}✗ $(basename $DOC): 缺少禁止万能装配器说明${NC}"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}=== 所有检查通过 ===${NC}"
