#!/usr/bin/env bash
# Pila local ALTERNA de Supabase (Postgres + GoTrue + PostgREST + pasarela), sin Realtime ni Storage.
# Úsala solo si `npm run db:iniciar` no puede descargar todas las imágenes (p. ej. en la nube de Claude Code).
# Uso: pruebas/pila/pila.sh arriba | abajo | migrar | pruebas | env
set -euo pipefail
cd "$(dirname "$0")/../.."

RED=sc-red
IMG_DB=supabase/postgres:17.11.0.004
IMG_AUTH=supabase/gotrue:v2.197.0
IMG_REST=postgrest/postgrest:v16.4
SECRETO=super-secret-jwt-token-with-at-least-32-characters-long
DIR_TMP=${TMPDIR:-/tmp}/sabaneta-pila
mkdir -p "$DIR_TMP"

jwt() { node -e '
const c=require("crypto"),b=(o)=>Buffer.from(JSON.stringify(o)).toString("base64url");
const h=b({alg:"HS256",typ:"JWT"}),p=b({iss:"supabase-demo",role:process.argv[1],exp:1983812996});
console.log(h+"."+p+"."+c.createHmac("sha256",process.argv[2]).update(h+"."+p).digest("base64url"))' "$1" "$SECRETO"; }

psql_db() { docker exec -i sc-db psql -v ON_ERROR_STOP=1 -q -U supabase_admin -h localhost -d postgres "$@"; }

migrar() {
  for f in supabase/migrations/*.sql; do
    echo "→ $f"
    docker exec -i sc-db psql -v ON_ERROR_STOP=1 -q -U postgres -h localhost -d postgres < "$f"
  done
  echo "→ supabase/seed.sql"
  docker exec -i sc-db psql -v ON_ERROR_STOP=1 -q -U postgres -h localhost -d postgres < supabase/seed.sql
  # PostgREST recarga el esquema
  docker exec -i sc-db psql -q -U postgres -h localhost -d postgres -c "notify pgrst, 'reload schema'" >/dev/null
}

arriba() {
  docker network inspect $RED >/dev/null 2>&1 || docker network create $RED >/dev/null
  docker rm -f sc-db sc-auth sc-rest >/dev/null 2>&1 || true

  docker run -d --name sc-db --network $RED -p 54322:5432 -e POSTGRES_PASSWORD=postgres $IMG_DB >/dev/null
  echo -n "Esperando Postgres"
  until docker exec sc-db pg_isready -U postgres -h localhost >/dev/null 2>&1 \
    && docker exec sc-db psql -U supabase_admin -h localhost -d postgres -Atc 'select 1' >/dev/null 2>&1; do echo -n .; sleep 1; done
  sleep 2; echo
  psql_db -c "alter role supabase_auth_admin with password 'postgres'; alter role authenticator with password 'postgres';"

  docker run -d --name sc-auth --network $RED -p 59999:9999 \
    -e GOTRUE_API_HOST=0.0.0.0 -e GOTRUE_API_PORT=9999 -e API_EXTERNAL_URL=http://127.0.0.1:54321/auth/v1 \
    -e GOTRUE_DB_DRIVER=postgres -e GOTRUE_DB_DATABASE_URL=postgres://supabase_auth_admin:postgres@sc-db:5432/postgres \
    -e GOTRUE_SITE_URL=http://localhost:3000 -e GOTRUE_URI_ALLOW_LIST='http://localhost:*' \
    -e GOTRUE_JWT_SECRET=$SECRETO -e GOTRUE_JWT_EXP=3600 -e GOTRUE_JWT_AUD=authenticated \
    -e GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated -e GOTRUE_JWT_ADMIN_ROLES=service_role \
    -e GOTRUE_DISABLE_SIGNUP=false -e GOTRUE_EXTERNAL_EMAIL_ENABLED=false \
    -e GOTRUE_EXTERNAL_PHONE_ENABLED=true -e GOTRUE_SMS_AUTOCONFIRM=false -e GOTRUE_SMS_OTP_LENGTH=6 \
    -e GOTRUE_SMS_MAX_FREQUENCY=1s -e GOTRUE_RATE_LIMIT_SMS_SENT=1000 -e GOTRUE_RATE_LIMIT_VERIFY=1000 \
    -e GOTRUE_SMS_PROVIDER=twilio -e GOTRUE_SMS_TWILIO_ACCOUNT_SID=ACprueba -e GOTRUE_SMS_TWILIO_AUTH_TOKEN=prueba \
    -e GOTRUE_SMS_TWILIO_MESSAGE_SERVICE_SID=MGprueba \
    -e "GOTRUE_SMS_TEST_OTP=573001112233:123456,573004445566:123456,573007778899:123456,573001112244:123456,573004445577:123456,573007778800:123456" \
    $IMG_AUTH >/dev/null
  echo -n "Esperando GoTrue"
  until curl -sf --noproxy '*' http://127.0.0.1:59999/health >/dev/null; do echo -n .; sleep 1; done; echo

  migrar

  docker run -d --name sc-rest --network $RED -p 53000:3000 \
    -e PGRST_DB_URI=postgres://authenticator:postgres@sc-db:5432/postgres -e PGRST_DB_SCHEMAS=public \
    -e PGRST_DB_ANON_ROLE=anon -e PGRST_JWT_SECRET=$SECRETO -e PGRST_DB_EXTRA_SEARCH_PATH=public,extensions \
    $IMG_REST >/dev/null

  pkill -f pruebas/pila/pasarela.mjs 2>/dev/null || true
  nohup node pruebas/pila/pasarela.mjs > "$DIR_TMP/pasarela.log" 2>&1 &
  echo -n "Esperando PostgREST"
  until curl -sf --noproxy '*' http://127.0.0.1:54321/rest/v1/ -H "apikey: $(jwt anon)" >/dev/null; do echo -n .; sleep 1; done; echo
  env_local
}

env_local() {
  echo
  echo "# Pega esto en .env.local"
  echo "NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321"
  echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$(jwt anon)"
  echo "SUPABASE_SERVICE_ROLE_KEY=$(jwt service_role)"
  echo "# Números de prueba (código 123456): 3001112233, 3004445566, 3007778899, 3001112244, 3004445577, 3007778800"
}

pruebas() {
  local fallos=0
  for f in supabase/tests/database/*.sql; do
    echo "→ $f"
    salida=$(docker exec -i sc-db psql -q -At -U postgres -h localhost -d postgres < "$f" 2>&1) || fallos=1
    echo "$salida" | grep -E '^(not )?ok|^#|ERROR' | sed 's/^/  /'
    echo "$salida" | grep -qE '^not ok|ERROR|Looks like' && fallos=1
  done
  [ $fallos -eq 0 ] && echo "Todas las pruebas de base de datos pasan." || { echo "Hay pruebas en rojo."; exit 1; }
}

abajo() {
  pkill -f pruebas/pila/pasarela.mjs 2>/dev/null || true
  docker rm -f sc-db sc-auth sc-rest >/dev/null 2>&1 || true
  echo "Pila detenida."
}

case "${1:-}" in
  arriba) arriba ;;
  abajo) abajo ;;
  migrar) migrar ;;
  pruebas) pruebas ;;
  env) env_local ;;
  *) echo "Uso: $0 arriba | abajo | migrar | pruebas | env"; exit 1 ;;
esac
