#!/usr/bin/env bash
# ============================================================
# POWER UP! — AWS Learner Lab one-shot deploy (idempotent)
# รันซ้ำได้ทุกครั้งที่ได้เครื่อง EC2 ใหม่ (public IP ใหม่)
# Usage:
#   ./deploy.sh          → deploy + healthcheck + ปริ้น Public URL
#   ./deploy.sh --seed   → deploy + ใส่ portfolio ตัวอย่างสำหรับ demo
# ============================================================
set -euo pipefail

REPO_URL="https://github.com/ningning110645/power-up-portfolio.git"
APP_DIR="/var/www/powerup"          # webroot (repo clone)
DATA_DIR="/var/www/data"            # JSON storage — นอก webroot (ไม่เข้าถึงผ่าน URL)
SEED=false
[[ "${1:-}" == "--seed" ]] && SEED=true

echo "==> [1/7] ติดตั้ง nginx + PHP-FPM"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx php-fpm curl jq git

echo "==> [2/7] Sync โค้ดล่าสุดจาก GitHub"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch --all -q
  git -C "$APP_DIR" reset --hard origin/main -q
else
  rm -rf "$APP_DIR"
  git clone -q "$REPO_URL" "$APP_DIR"
fi
# บังคับเป็น main ถ้า default branch เป็นอย่างอื่น
git -C "$APP_DIR" checkout -q main 2>/dev/null || git -C "$APP_DIR" checkout -q master

echo "==> [3/7] เตรียมโฟลเดอร์เก็บข้อมูล ($DATA_DIR — นอก webroot)"
mkdir -p "$DATA_DIR"
# ไม่ลบ portfolios.json เดิม → persistence หลัง deploy ซ้ำ/reboot
touch "$DATA_DIR/portfolios.json"

echo "==> [4/7] ตั้งค่า nginx (block /data/ + fastcgi PHP)"
PHP_SOCK=$(ls /run/php/php*-fpm.sock 2>/dev/null | head -1 || true)
if [ -z "$PHP_SOCK" ]; then
  echo "ERROR: หา php-fpm socket ไม่เจอ" >&2; exit 1
fi
sed "s|__APP_DIR__|$APP_DIR|g; s|__PHP_SOCK__|$PHP_SOCK|g" \
  "$APP_DIR/deploy/nginx-powerup.conf" > /etc/nginx/sites-available/powerup
ln -sf /etc/nginx/sites-available/powerup /etc/nginx/sites-enabled/powerup
rm -f /etc/nginx/sites-enabled/default   # ปิด default site กัน port conflict
nginx -t

echo "==> [5/7] สิทธิ์การเข้าถึง"
chown -R root:root "$APP_DIR"
chmod -R 755 "$APP_DIR"
chown -R www-data:www-data "$DATA_DIR"
chmod -R 750 "$DATA_DIR"   # www-data เท่านั้นที่อ่าน/เขียน JSON ได้

echo "==> [6/7] เปิด service (enable = รอด reboot)"
PHP_VER=$(basename "$PHP_SOCK" | sed 's/^php//; s/-fpm\.sock$//')
systemctl enable --now nginx >/dev/null 2>&1 || systemctl restart nginx
systemctl enable --now "php${PHP_VER}-fpm" >/dev/null 2>&1 || systemctl restart "php${PHP_VER}-fpm"

echo "==> [7/7] Healthcheck"
sleep 1
HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/index.html)
API=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/api/portfolios.php)
DENY=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/data/../data/portfolios.json)
echo "    index.html        → $HTTP (ต้องเป็น 200)"
echo "    api/portfolios.php→ $API (ต้องเป็น 200)"
echo "    /data/ ทางตรง     → $DENY (ต้องเป็น 403/404 ไม่ใช่ 200)"

if [ "$SEED" = true ]; then
  echo "==> Seed ข้อมูลตัวอย่าง"
  for f in "$APP_DIR"/sample-portfolio-*.json; do
    jq '{displayName:.name, whatIEnjoy, whatIveTried, whatImCuriousAbout}' "$f" |
      curl -s -X POST -H 'Content-Type: application/json' -d @- http://127.0.0.1/api/portfolios.php >/dev/null
  done
  echo "    seed แล้ว $(curl -s http://127.0.0.1/api/portfolios.php | jq length) portfolios"
fi

# --- ปริ้น Public URL (IMDSv2 → EC2 metadata, fallback บริการภายนอก) ---
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 60" 2>/dev/null || true)
PUBLIC_IP=$(curl -s --max-time 3 -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || true)
[[ "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] || \
  PUBLIC_IP=$(curl -s --max-time 3 https://checkip.amazonaws.com)

echo ""
echo "=============================================="
echo " ✅ DEPLOY DONE"
echo " URL: http://$PUBLIC_IP"
echo "----------------------------------------------"
echo " ⚠️  ถ้าเปิดจากภายนอกไม่ได้: เปิด Security Group"
echo "    Inbound rule → HTTP (port 80) → 0.0.0.0/0"
echo " 📝 อย่าลืมแจ้ง URL ใหม่ให้ทีม/บันทึกใน README"
echo "=============================================="
