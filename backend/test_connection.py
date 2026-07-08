import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    dbname="asset_dashboard",
    user="postgres",
    password="nischay1234"  # whatever you set
)
print("Connected successfully:", conn)
conn.close()