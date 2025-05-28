from ..db import get_connection

def create_list(user_id, title, description=None, picture_url=None, is_default = None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                insert into lists (user_id, title, description, picture_url)
                values (%s, %s, %s, %s)
                returning list_id, user_id, title, description, picture_url, created_at, is_default
            """, (user_id, title, description, picture_url  ))
            row = cur.fetchone()
            conn.commit()
            return {
                'list_id': row[0],
                'user_id': row[1],
                'title': row[2],
                'description': row[3],
                'picture_url': row[4],
                'created_at': row[5].isoformat()
            }
