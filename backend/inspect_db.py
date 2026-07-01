import sqlite3
conn = sqlite3.connect('app.db')
c = conn.cursor()
c.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = c.fetchall()
print("=== TABLES ===")
for t in tables:
    print(t[0])
    c.execute(f"SELECT COUNT(*) FROM {t[0]}")
    count = c.fetchone()[0]
    print(f"  → {count} rows")
conn.close()
