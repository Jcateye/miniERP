#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNTIME_DIR="${TMPDIR:-/tmp}/minierp-runtime"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/logs}"

SERVER_PORT="${SERVER_PORT:-3001}"
WEB_PORT="${WEB_PORT:-3000}"

POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-minierp}"
POSTGRES_USER="${POSTGRES_USER:-minierp}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-change_me}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"

DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}}"
REDIS_URL="${REDIS_URL:-redis://${REDIS_HOST}:${REDIS_PORT}}"

WEB_HEALTH_URL="${WEB_HEALTH_URL:-http://localhost:${WEB_PORT}}"
SERVER_HEALTH_URL="${SERVER_HEALTH_URL:-http://localhost:${SERVER_PORT}/api/health/ready}"

mkdir -p "$RUNTIME_DIR"
mkdir -p "$LOG_DIR"

pid_file() {
  local service="$1"
  echo "$RUNTIME_DIR/${service}.pid"
}

log_file() {
  local service="$1"
  echo "$LOG_DIR/${service}.log"
}

detect_lan_ip() {
  local default_iface default_ip iface iface_ip
  default_iface="$(route get default 2>/dev/null | awk '/interface:/{print $2}' | head -n 1)"

  if [[ -n "${default_iface:-}" ]]; then
    default_ip="$(ipconfig getifaddr "$default_iface" 2>/dev/null || true)"
    if [[ -n "${default_ip:-}" ]]; then
      echo "$default_ip"
      return
    fi
  fi

  for iface in $(ifconfig -l); do
    case "$iface" in
      lo*|utun*|awdl*|llw*|bridge*|gif*|stf*)
        continue
        ;;
    esac

    iface_ip="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    if [[ -n "${iface_ip:-}" ]]; then
      echo "$iface_ip"
      return
    fi
  done
}

print_access_urls() {
  local lan_ip
  lan_ip="$(detect_lan_ip || true)"

  echo "[project] 访问地址"
  echo "[project] web(local): http://localhost:${WEB_PORT}"
  echo "[project] server(local): http://localhost:${SERVER_PORT}"
  echo "[project] server health(local): ${SERVER_HEALTH_URL}"

  if [[ -n "${lan_ip:-}" ]]; then
    echo "[project] web(lan): http://${lan_ip}:${WEB_PORT}"
    echo "[project] server(lan): http://${lan_ip}:${SERVER_PORT}"
  else
    echo "[project] lan 地址获取失败（请检查网络接口）"
  fi
}

print_service_log_snippet() {
  local service="$1"
  local lines="${2:-20}"
  local window_size="${3:-200}"
  local log_path
  local recent_window
  local error_lines

  log_path="$(log_file "$service")"

  if [[ ! -f "$log_path" ]]; then
    echo "[project] ${service} 日志不存在：${log_path}"
    return 0
  fi

  recent_window="$(tail -n "$window_size" "$log_path" || true)"
  error_lines="$(printf '%s\n' "$recent_window" | grep -Ei 'error|exception|failed|refused|timeout|unavailable|503|502|500|econn|nest\] .*\bERR\b' | tail -n "$lines" || true)"

  if [[ -n "${error_lines:-}" ]]; then
    echo "[project] ${service} 关键错误日志（最近窗口 ${window_size} 行内，展示最多 ${lines} 行）：${log_path}"
    printf '%s\n' "$error_lines"
    return 0
  fi

  echo "[project] ${service} 最近未发现明显错误，回退显示最新 ${lines} 行日志：${log_path}"
  tail -n "$lines" "$log_path"
}

run_bun() {
  (cd "$ROOT_DIR" && bun "$@")
}

require_curl() {
  if ! command -v curl >/dev/null 2>&1; then
    echo "[project] 未安装 curl，无法执行 health/doctor"
    exit 1
  fi
}

require_nc() {
  if ! command -v nc >/dev/null 2>&1; then
    echo "[project] 未安装 nc，无法执行 infra 健康检查"
    exit 1
  fi
}

is_pid_running() {
  local pid="$1"
  kill -0 "$pid" >/dev/null 2>&1
}

service_pid() {
  local service="$1"
  local file
  file="$(pid_file "$service")"
  if [[ -f "$file" ]]; then
    cat "$file"
  fi
}

service_running() {
  local service="$1"
  local pid
  pid="$(service_pid "$service" || true)"
  [[ -n "$pid" ]] && is_pid_running "$pid"
}

start_service() {
  local service="$1"
  local command="$2"
  local pid_path log_path
  pid_path="$(pid_file "$service")"
  log_path="$(log_file "$service")"

  if service_running "$service"; then
    echo "[project] $service 已在运行（pid=$(service_pid "$service")）"
    return 0
  fi

  if [[ -f "$pid_path" ]]; then
    rm -f "$pid_path"
  fi

  echo "[project] 启动 $service ..."
  nohup bash -lc "cd '$ROOT_DIR' && $command" >"$log_path" 2>&1 &
  echo "$!" >"$pid_path"
  echo "[project] $service 已启动（pid=$!，日志=${log_path}）"
}

stop_service() {
  local service="$1"
  local pid_path pid
  pid_path="$(pid_file "$service")"

  if ! [[ -f "$pid_path" ]]; then
    echo "[project] $service 未运行（无 pid 文件）"
    return 0
  fi

  pid="$(cat "$pid_path")"

  if ! is_pid_running "$pid"; then
    echo "[project] $service 进程不存在，清理 pid 文件"
    rm -f "$pid_path"
    return 0
  fi

  echo "[project] 停止 ${service} (pid=${pid}) ..."
  kill "$pid" >/dev/null 2>&1 || true

  for _ in {1..20}; do
    if ! is_pid_running "$pid"; then
      break
    fi
    sleep 0.2
  done

  if is_pid_running "$pid"; then
    echo "[project] $service 未正常退出，执行强制终止"
    kill -9 "$pid" >/dev/null 2>&1 || true
  fi

  rm -f "$pid_path"
  echo "[project] $service 已停止"
}

status_service() {
  local service="$1"
  if service_running "$service"; then
    echo "[project] $service: running (pid=$(service_pid "$service"))"
  else
    echo "[project] $service: stopped"
  fi
}

logs_service() {
  local service="$1"
  local log_path
  log_path="$(log_file "$service")"
  if [[ ! -f "$log_path" ]]; then
    echo "[project] $service 暂无日志文件：$log_path"
    return 1
  fi
  echo "[project] 跟随 $service 日志：$log_path"
  tail -f "$log_path"
}

probe_tcp() {
  local host="$1"
  local port="$2"

  nc -z "$host" "$port" >/dev/null 2>&1
}

infra_health() {
  require_nc
  local failures=0

  echo "[project] 外部 infra 健康检查"

  if probe_tcp "$POSTGRES_HOST" "$POSTGRES_PORT"; then
    echo "[project] postgres: up (${POSTGRES_HOST}:${POSTGRES_PORT})"
  else
    echo "[project] postgres: down (${POSTGRES_HOST}:${POSTGRES_PORT})"
    failures=$((failures + 1))
  fi

  if probe_tcp "$REDIS_HOST" "$REDIS_PORT"; then
    echo "[project] redis: up (${REDIS_HOST}:${REDIS_PORT})"
  else
    echo "[project] redis: down (${REDIS_HOST}:${REDIS_PORT})"
    failures=$((failures + 1))
  fi

  if [[ "$failures" -gt 0 ]]; then
    return 1
  fi
}

infra_preflight() {
  if infra_health; then
    echo "[project] 外部 infra 已就绪，跳过启动"
    return 0
  fi

  echo "[project] 外部 infra 未就绪，请先在 Macmini 侧拉起共享中间件（PostgreSQL/Redis）"
  return 1
}

infra_start() {
  infra_preflight
}

infra_stop() {
  echo "[project] 当前为外部 infra 模式，不在本仓库内停止共享中间件"
  echo "[project] 如需停止，请在基础设施仓库执行 docker compose down"
}

infra_status() {
  infra_health
}

infra_logs() {
  echo "[project] 当前为外部 infra 模式，不在本仓库内聚合中间件日志"
  echo "[project] 请到基础设施仓库查看：docker compose logs -f [service]"
}

web_health() {
  require_curl
  if curl -fsS "$WEB_HEALTH_URL" >/dev/null; then
    echo "[project] web health ok: $WEB_HEALTH_URL"
  else
    echo "[project] web health failed: $WEB_HEALTH_URL"
    return 1
  fi
}

server_health() {
  require_curl
  if curl -fsS "$SERVER_HEALTH_URL" >/dev/null; then
    echo "[project] server health ok: $SERVER_HEALTH_URL"
  else
    echo "[project] server health failed: $SERVER_HEALTH_URL"
    return 1
  fi
}

web_check() {
  echo "[project] web check: lint -> build"
  run_bun run --filter web lint
  run_bun run --filter web build
}

server_check() {
  echo "[project] server check: lint -> test -> build"
  run_bun run --filter server lint
  run_bun run --filter server test
  run_bun run --filter server build
}

app_post_start_report() {
  local web_failed=0
  local server_failed=0

  print_access_urls

  web_health || web_failed=1
  server_health || server_failed=1

  if [[ "$web_failed" -eq 1 || "$server_failed" -eq 1 ]]; then
    echo "[project] 启动后健康检查失败，以下是简要错误日志"
    [[ "$web_failed" -eq 1 ]] && print_service_log_snippet "web" 30
    [[ "$server_failed" -eq 1 ]] && print_service_log_snippet "server" 30
    return 1
  fi

  echo "[project] 启动后健康检查通过"
}

app_start() {
  start_service "server" "PORT=${SERVER_PORT} DATABASE_URL='${DATABASE_URL}' REDIS_URL='${REDIS_URL}' AUTH_CONTEXT_SECRET='${AUTH_CONTEXT_SECRET:-dev-only-auth-context-secret}' bun run dev:server"
  start_service "web" "PORT=${WEB_PORT} NEXT_PUBLIC_API_BASE_URL='${NEXT_PUBLIC_API_BASE_URL:-http://localhost:${SERVER_PORT}}' bun run dev:web"
  app_post_start_report
}

app_stop() {
  stop_service "web"
  stop_service "server"
}

app_status() {
  status_service "server"
  status_service "web"
}

app_logs() {
  echo "[project] 可选日志：server | web"
  echo "[project] 示例：./project.sh server logs"
  echo "[project]       ./project.sh web logs"
}

app_health() {
  local failed=0
  web_health || failed=1
  server_health || failed=1
  return "$failed"
}

app_check() {
  echo "[project] app check: lint -> test -> build（根命令）"
  run_bun run lint
  run_bun run test
  run_bun run build
}

print_help() {
  cat <<'EOF'
miniERP 项目管理脚本（双参数）

用法: ./project.sh <scope> <command>
兼容旧写法: ./project.sh <command>（等价于 scope=all）

scope 说明:
  all     => 前后端 + 外部 infra 预检（通用入口）
  app     => 前后端整体（web + server）
  web     => 仅前端
  server  => 仅后端
  infra   => 外部中间件探活（不做启停）

统一 command（每个 scope 都支持）:
  start   => 启动
  stop    => 停止
  restart => 重启
  status  => 查看状态
  logs    => 查看日志
  health  => 健康检查
  check   => 质量检查
  doctor  => status + health
  help    => 帮助

关键行为:
  all start => 先检查外部 infra（postgres + redis），就绪后再启动 server + web
  all stop  => 只停止 server + web，不会动外部 infra
  infra *   => 仅做探活/提示，不在本仓库内执行中间件启停

常用命令:
  ./project.sh all start
  ./project.sh all status
  ./project.sh all stop
  ./project.sh infra health
  ./project.sh infra doctor
  ./project.sh server logs
  ./project.sh web logs
EOF
}

dispatch_scope_command() {
  local scope="$1"
  local command="$2"

  case "$scope" in
    all)
      case "$command" in
        start) infra_preflight; app_start ;;
        stop) app_stop ;;
        restart) app_stop; infra_preflight; app_start ;;
        status) app_status; echo; infra_status ;;
        logs) echo "[project] all logs 请分别查看：./project.sh server logs / ./project.sh web logs" ;;
        health)
          local failed=0
          app_health || failed=1
          infra_health || failed=1
          return "$failed"
          ;;
        check) app_check ;;
        doctor) app_status; echo; infra_status || true; echo; app_health || true ;;
        help) print_help ;;
        *) echo "[project] 未知命令: $command"; print_help; exit 1 ;;
      esac
      ;;
    app)
      case "$command" in
        start) app_start ;;
        stop) app_stop ;;
        restart) app_stop; app_start ;;
        status) app_status ;;
        logs) app_logs ;;
        health) app_health ;;
        check) app_check ;;
        doctor) app_status; echo; app_health || true ;;
        help) print_help ;;
        *) echo "[project] 未知命令: $command"; print_help; exit 1 ;;
      esac
      ;;
    web)
      case "$command" in
        start) start_service "web" "bun run dev:web" ;;
        stop) stop_service "web" ;;
        restart) stop_service "web"; start_service "web" "bun run dev:web" ;;
        status) status_service "web" ;;
        logs) logs_service "web" ;;
        health) web_health ;;
        check) web_check ;;
        doctor) status_service "web"; echo; web_health || true ;;
        help) print_help ;;
        *) echo "[project] 未知命令: $command"; print_help; exit 1 ;;
      esac
      ;;
    server)
      case "$command" in
        start) start_service "server" "bun run dev:server" ;;
        stop) stop_service "server" ;;
        restart) stop_service "server"; start_service "server" "bun run dev:server" ;;
        status) status_service "server" ;;
        logs) logs_service "server" ;;
        health) server_health ;;
        check) server_check ;;
        doctor) status_service "server"; echo; server_health || true ;;
        help) print_help ;;
        *) echo "[project] 未知命令: $command"; print_help; exit 1 ;;
      esac
      ;;
    infra)
      case "$command" in
        start) infra_start ;;
        stop) infra_stop ;;
        restart) infra_preflight ;;
        status) infra_status ;;
        logs) infra_logs ;;
        health) infra_health ;;
        check) infra_health ;;
        doctor) infra_health ;;
        help) print_help ;;
        *) echo "[project] 未知命令: $command"; print_help; exit 1 ;;
      esac
      ;;
    *)
      echo "[project] 未知 scope: $scope"
      print_help
      exit 1
      ;;
  esac
}

main() {
  local first="${1:-help}"
  local second="${2:-}"
  local scope command

  case "$first" in
    all|app|web|server|infra)
      scope="$first"
      command="${second:-help}"
      ;;
    *)
      scope="all"
      command="$first"
      ;;
  esac

  dispatch_scope_command "$scope" "$command"
}

main "$@"
