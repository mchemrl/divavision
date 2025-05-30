from ..db import get_connection

def fetch_achievements():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
            select * from badges
            """)
            ach = cur.fetchall()
    return ach

def award_badge_if_earned(user_id):
    review_count = count_reviews_by_user(user_id)
    if review_count >= 5 and not has_badge(user_id, badge_id=1):
        insert_user_badge(user_id, badge_id=1)

    list_count = count_lists_by_user(user_id)
    if list_count >= 1 and not has_badge(user_id, badge_id=2):
        insert_user_badge(user_id, badge_id=2)

    follow_count = count_follows_by_user(user_id)
    if follow_count >= 1 and not has_badge(user_id, badge_id=3):
        insert_user_badge(user_id, badge_id=3)


def insert_user_badge(user_id, badge_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                insert into user_badges (user_id, badge_id)
                values (%s, %s)
                on conflict do nothing
            """, (user_id, badge_id))
            conn.commit()

def has_badge(user_id, badge_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                select 1 from user_badges
                where user_id = %s and badge_id = %s
            """, (user_id, badge_id))
            return cur.fetchone() is not None

def count_lists_by_user(user_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                select count(*) from movie_lists
                where user_id = %s
            """, (user_id,))
            return cur.fetchone()[0]

def count_reviews_by_user(user_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                select count(*) from reviews
                where user_id = %s
            """, (user_id,))
            return cur.fetchone()[0]


def count_follows_by_user(user_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                select count(*) from follows
                where follower_id = %s
            """, (user_id,))
            return cur.fetchone()[0]