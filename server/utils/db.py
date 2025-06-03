import os
import psycopg2
from contextlib import contextmanager

SUPABASE_URL = os.getenv("SUPABASE_URL")

@contextmanager
def get_connection():
    conn = None
    try:
        conn = psycopg2.connect(SUPABASE_URL)
        yield conn
    except Exception as e:
        yield None
    finally:
        if conn:
            conn.close()