#!/usr/bin/env python3
"""
Script migrate dữ liệu từ PostgreSQL local (Docker) lên Render PostgreSQL.

Cách dùng:
  1. Điền RENDER_DB_URL bên dưới (lấy từ Render Dashboard → Database → Connection String)
  2. Chạy: python migrate_to_render.py
"""

import subprocess
import sys
import os

# ──────────────────────────────────────────────────────────────────────────────
# 👇 THAY BẰNG CONNECTION STRING CỦA RENDER (External URL)
# Dạng: postgresql://user:password@host/dbname
RENDER_DB_URL = "PGPASSWORD=vfv8smY4URxiqFEPFQYigvNvd5Q2qbsG psql -h dpg-d8kh3er7uimc73b26550-a.singapore-postgres.render.com -U healthychat_user healthychat"
# ──────────────────────────────────────────────────────────────────────────────

DATA_ONLY_DUMP = "healthychat_data_only.sql"
FULL_DUMP      = "healthychat_dump.sql"

def check_psql():
    """Kiểm tra psql có được cài không."""
    try:
        subprocess.run(["psql", "--version"], capture_output=True, check=True)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False

def run_psql(sql_file, db_url):
    """Chạy file SQL lên Render DB."""
    print(f"\n⏳ Đang import {sql_file} lên Render...")
    result = subprocess.run(
        ["psql", db_url, "-f", sql_file, "--set=ON_ERROR_STOP=0"],
        capture_output=True,
        text=True
    )
    if result.stdout:
        print("Output:", result.stdout[:500])
    if result.returncode != 0 and result.returncode != 3:
        print("⚠️  Stderr:", result.stderr[:500])
    return result.returncode

def main():
    print("=" * 60)
    print("🚀 HealthyChat — Migrate DB Local → Render")
    print("=" * 60)

    # Kiểm tra URL đã được điền chưa
    if "YOUR_USER" in RENDER_DB_URL:
        print("\n❌ Lỗi: Bạn chưa điền RENDER_DB_URL!")
        print("   Mở file migrate_to_render.py và điền Connection String từ Render Dashboard.")
        sys.exit(1)

    # Kiểm tra file dump tồn tại
    if not os.path.exists(DATA_ONLY_DUMP):
        print(f"❌ Không tìm thấy {DATA_ONLY_DUMP}. Hãy chạy export trước.")
        sys.exit(1)

    # Kiểm tra psql
    if not check_psql():
        print("\n⚠️  psql chưa được cài. Dùng cách thủ công bên dưới:")
        print("   → Lên Render Dashboard → Database → Shell")
        print(f"   → Copy nội dung file {DATA_ONLY_DUMP} và paste vào Shell")
        sys.exit(1)

    print(f"\n📊 Dữ liệu sẽ được import từ: {DATA_ONLY_DUMP}")
    print(f"📡 Đích: {RENDER_DB_URL[:40]}...")
    confirm = input("\n▶ Tiếp tục? (y/N): ").strip().lower()
    if confirm != "y":
        print("Đã hủy.")
        sys.exit(0)

    # Chạy import
    code = run_psql(DATA_ONLY_DUMP, RENDER_DB_URL)

    if code in [0, 3]:
        print("\n✅ Import hoàn tất!")
        print("   → Kiểm tra tại: https://your-backend.onrender.com/docs")
    else:
        print(f"\n❌ Import thất bại (exit code: {code})")
        print("   → Hãy dùng Render Shell để import thủ công.")

if __name__ == "__main__":
    main()
