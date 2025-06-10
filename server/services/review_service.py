import json
from ..services.achievement_service import award_badge_if_earned
from ..services.list_service import add_watched_movie
from ..utils.db import get_connection

def create_review(user_id, movie_id, rating, review_text=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                select review_id from reviews
                where user_id = %s and movie_id = %s
            """, (user_id, movie_id))
            existing = cur.fetchone()
            if existing:
                raise ValueError("user has already reviewed this movie")

            cur.execute("""
                insert into reviews (user_id, movie_id, rating, review_text)
                values (%s, %s, %s, %s)
                returning review_id
            """, (user_id, movie_id, rating, review_text))
            row = cur.fetchone()
            review_id = row[0]
            cur.execute("""
                            insert into feed_events (user_id, event_type, target_id, event_data)
                            values (%s, %s, %s, %s)
                            """, (user_id, "write_review", review_id, json.dumps({'user_id': user_id, "movie_id": movie_id})))
            # add_watched_movie(user_id, movie_id)
            cur.execute("""
                update movies
                set avg_user_rating = (
                    select round(avg(rating)::numeric, 2)
                    from reviews
                    where movie_id = %s
                )
                where movie_id = %s
            """, (movie_id, movie_id))
            award_badge_if_earned(user_id)
            conn.commit()

def change_review(review_id, user_id, rating, review_text = None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                   update reviews
                   set rating = %s,
                       review_text = %s
                   where review_id = %s and user_id = %s
               """, (rating, review_text, review_id, user_id))
            conn.commit()

def delete_review(review_id, user_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                delete from reviews
                where review_id = %s and user_id = %s
                returning review_id
            """, (review_id, user_id))
            conn.commit()

def fetch_reviews(user_id=None, movie_id=None, keyword=None, rating_min=None, rating_max=None,
                  sort_by='created_at', limit=5):
    valid_sort_fields = ['created_at', 'rating']
    if sort_by not in valid_sort_fields:
        sort_by = 'created_at'

    filters = list()
    values = list()
    if user_id:
        filters.append("r.user_id = %s")
        values.append(user_id)
    if movie_id:
        filters.append("r.movie_id = %s")
        values.append(movie_id)
    if keyword:
        filters.append("r.review_text ILIKE %s")
        values.append(f"%{keyword}%")
    if rating_min is not None:
        filters.append("r.rating >= %s")
        values.append(rating_min)
    if rating_max is not None:
        filters.append("r.rating <= %s")
        values.append(rating_max)

    where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

    query = f"""
        SELECT r.review_id, r.user_id, u.username, r.movie_id, r.rating, r.review_text, r.created_at
        FROM reviews r
        JOIN users u ON r.user_id = u.user_id
        {where_clause}
        ORDER BY r.{sort_by} DESC
        LIMIT %s
    """
    values.append(limit)

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, values)
            rows = cur.fetchall()
            return [
                {
                    'review_id': row[0],
                    'user_id': row[1],
                    'username': row[2],
                    'movie_id': row[3],
                    'rating': row[4],
                    'review_text': row[5],
                    'created_at': row[6].strftime("%Y-%m-%d"),
                } for row in rows
            ]

