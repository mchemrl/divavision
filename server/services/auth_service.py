from werkzeug.security import generate_password_hash
from ..utils.db import get_connection
from ..services.list_service import create_list


def fetch_user_by_id(user_id):
    with get_connection() as conn:
        if conn is None:
            return None
        with conn.cursor() as cur:
            cur.execute("select * from users where user_id = %s", (user_id,))
            return cur.fetchone()

def fetch_user_by_identifier(identifier):
    with get_connection() as conn:
        if conn is None:
            return None
        with conn.cursor() as cur:
            cur.execute(
                "select * from users where username = %s or email = %s",
                (identifier, identifier)
            )
            return cur.fetchone()

def create_user(username, email, password):
    with get_connection() as conn:
        if conn is None:
            return None
        password_hash = generate_password_hash(password)
        with conn.cursor() as cur:
            cur.execute(
                """
                insert into users (username, email, password_hash)
                values (%s, %s, %s)
                returning user_id
                """,
                (username, email, password_hash)
            )
            user_id = cur.fetchone()[0]
            conn.commit()
            return user_id

def create_user_if_not_exists(username, email, profile_pic_url=None):
    with get_connection() as conn:
        if conn is None:
            return None
        with conn.cursor() as cur:
            cur.execute("select user_id from users where email = %s", (email,))
            existing = cur.fetchone()
            if existing:
                return existing[0]

            cur.execute("""
                insert into users (username, email, password_hash, profile_pic_url)
                values (%s, %s, %s, %s)
                returning user_id
            """, (username, email, '', profile_pic_url))
            user_id = cur.fetchone()[0]
            conn.commit()
            return user_id

def create_basic_lists(user_id):
    create_list(user_id, "Favourites", "Your favourite movies list", is_default=True)
    create_list(user_id, "Watched", "Movies you have watched", is_default=True)