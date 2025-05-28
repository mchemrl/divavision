from ..db import get_connection

def get_user_profile_by_id(user_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(""" 
                        select username, email, profile_pic_url, start_date, tagline
                        from users
                        where user_id = %s
                        """, (user_id,))
            row = cur.fetchone()

    return {
        'username': row[0],
        'email': row[1],
        'profile_pic_url': row[2],
        'start_date': row[3].isoformat(),
        'tagline': row[4]
    }