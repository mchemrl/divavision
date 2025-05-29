import json

from ..db import get_connection

def fetch_user_by_id(user_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(""" 
                        select username, email, profile_pic_url, start_date, tagline
                        from users
                        where user_id = %s
                        """, (user_id,))
            row = cur.fetchone()
    if row is None:
        return None
    return {
        'username': row[0],
        'email': row[1],
        'profile_pic_url': row[2],
        'start_date': row[3].isoformat(),
        'tagline': row[4]
    }

def change_user(user_id, updated_profile):
    with get_connection() as conn:
        with conn.cursor() as cur:
            fields = list()
            values = list()

            allowed_fields = ['username', 'profile_pic_url', 'tagline']

            for key in allowed_fields:
                if key in updated_profile:
                    fields.append(f"{key} = %s")
                    values.append(updated_profile[key])

            if not fields:
                return None
            values.append(user_id)
            query = f"""
                        update users
                        set {', '.join(fields)}
                        where user_id = %s
                        returning user_id, username, tagline, profile_pic_url
                        """

            cur.execute(query, values)
            conn.commit()

            updated = cur.fetchone()
            if updated is None:
                return None

            return {
                'user_id': updated[0],
                'username': updated[1],
                'tagline': updated[2],
                'profile_pic_url': updated[3],
            }

def fetch_user_lists_by_filter(user_id, is_default=None, title=None, search_title=None):
    query = """
        select list_id, title, description, picture_url, created_at
        from lists
        where user_id = %s
          and (%s::boolean is null or is_default = %s)
          and (%s is null or title = %s)
          and (%s is null or title ilike %s)
        order by created_at desc
    """
    params = [
        user_id,
        is_default, is_default,
        title, title,
        search_title, f"%{search_title}%" if search_title else None
    ]

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()

    return [
        {
            'list_id': r[0],
            'title': r[1],
            'description': r[2],
            'picture_url': r[3],
            'created_at': r[4].isoformat()
        }
        for r in rows
    ]


def follow_user(follower_id, followed_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                insert into followers (follower_id, followed_id)
                values (%s, %s)
                on conflict do nothing
            """, (follower_id, followed_id))
            cur.execute("""
                            insert into feed_events (user_id, event_type, target_id, event_data)
                            values (%s, %s, %s, %s)
                        """, (follower_id, 'followed', followed_id, json.dumps({"follower": follower_id, "followed": followed_id})))
            conn.commit()

def unfollow_user(follower_id, followed_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                delete from followers
                where follower_id = %s and followed_id = %s
            """, (follower_id, followed_id))
            conn.commit()

def fetch_stats(user_id):
    query = """
        select
          u.user_id,
          u.start_date,
          (select count(*) from lists l where l.user_id = u.user_id and is_default = False) as lists_count,
          (select count(*) from followers f where f.followed_id = u.user_id) as followers_count,
          (select count(*) from followers f where f.follower_id = u.user_id) as following_count,
          (select count(li.list_item_id)
           from lists l join list_items li on l.list_id = li.list_id
           where l.user_id = u.user_id and l.title = 'watched') as watched_count,
          (select count(li.list_item_id)
           from lists l join list_items li on l.list_id = li.list_id
           where l.user_id = u.user_id and l.title = 'favorites') as favorites_count,
          (select count(*) from reviews r where r.user_id = u.user_id) as reviews_count
        from users u
        where u.user_id = %s
    """

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id,))
            row = cur.fetchone()
            if not row:
                return None

            return {
                "user_id": row[0],
                "start_date": row[1].strftime("%Y-%m-%d"),
                "lists": row[2],
                "followers": row[3],
                "following": row[4],
                "watched": row[5],
                "favorites": row[6],
                "reviews": row[7]
            }

def fetch_followers(user_id):
    query = """
        select u.user_id, u.username, u.profile_pic_url
        from followers f
        join users u on f.follower_id = u.user_id
        where f.followed_id = %s
        order by u.username
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id,))
            rows = cur.fetchall()

    return [
        {
            "user_id": r[0],
            "username": r[1],
            "profile_pic_url": r[2]
        }
        for r in rows
    ]

def fetch_following(user_id):
    query = """
        select u.user_id, u.username, u.profile_pic_url
        from followers f
        join users u on f.followed_id = u.user_id
        where f.follower_id = %s
        order by u.username
    """
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, (user_id,))
            rows = cur.fetchall()

    return [
        {
            "user_id": r[0],
            "username": r[1],
            "profile_pic_url": r[2]
        }
        for r in rows
    ]

def fetch_feed(user_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                select followed_id
                from followers
                where follower_id = %s
            """, (user_id,))
            followed_ids = [row[0] for row in cur.fetchall()]

            if not followed_ids:
                return []

            cur.execute("""
                select event_id, user_id, event_type, target_id, event_data, created_at
                from feed_events
                where user_id = any(%s)
                order by created_at desc
                LIMIT 50
            """, (followed_ids,))
            events = cur.fetchall()

            return [{
                'event_id': row[0],
                'user_id': row[1],
                'event_type': row[2],
                'target_id': row[3],
                'event_data': row[4],
                'created_at': row[5].isoformat()
            } for row in events]