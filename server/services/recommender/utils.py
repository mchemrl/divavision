from sklearn.metrics.pairwise import cosine_similarity as sk_cosine
from server.utils.db import get_connection

def cosine_similarity(vec1, vec_matrix):
    return sk_cosine(vec1, vec_matrix)

def user_top_genres(user_id, limit=3, threshold=4):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                    select g.genre_id, count(*) as count
                    from reviews r
                    join movie_genres mg on r.movie_id = mg.movie_id
                    join genres g on mg.genre_id = g.genre_id
                    where r.user_id = %s
                      and r.rating >= %s
                    group by g.genre_id
                    order by count desc
                    limit %s""", (user_id, threshold, limit))
            return [row[0] for row in cur.fetchall()]

def user_high_rated_movies(user_id, threshold=4):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
            select movie_id
            from reviews
            where user_id = %s and rating is not null and rating >= %s;
            """, (user_id, threshold))
            return [row[0] for row in cur.fetchall()]
