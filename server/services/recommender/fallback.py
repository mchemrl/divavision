from server.utils.db import get_connection

def popular_fallback(sort_by = 'avg_user_rating'):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(f"""
            select m.movie_id, m.rating, m.avg_user_rating, m.poster_link, m.title, count(r.review_id) as review_count 
            from movies left join reviews r on r.movie_id = m.movie_id
            group by m.movie_id
            order by {sort_by} desc
            limit 10
            """)
            res = cur.fetchall()
    return res