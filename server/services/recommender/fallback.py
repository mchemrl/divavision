from server.utils.db import get_connection

def popular_fallback(sort_by='avg_user_rating'):
    allowed_sort_columns = ['avg_user_rating', 'rating', 'review_count', 'title']
    if sort_by not in allowed_sort_columns:
        sort_by = 'avg_user_rating'
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
                select m.movie_id, m.rating, m.avg_user_rating, m.poster_link, m.title, COUNT(r.review_id) AS review_count
                from movies m
                left join reviews r on r.movie_id = m.movie_id
                group by m.movie_id, m.rating, m.avg_user_rating, m.poster_link, m.title
                order by {sort_by} desc
                limit 10
            """)
            res = cur.fetchall()
    return res
