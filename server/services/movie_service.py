from ..utils.db import get_connection

def fetch_movie_by_id(movie_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                            select m.movie_id, m.title, m.description, m.tagline, m.poster_link,
                                   m.release_year, m.runtime, m.rating, m.avg_user_rating,
                                   m.original_language, m.production_companies,
                                   array_agg(g.name) as genres
                            from movies m
                            left join movie_genres mg on m.movie_id = mg.movie_id
                            left join genres g on mg.genre_id = g.genre_id
                            where m.movie_id = %s
                            group by m.movie_id
                        """, (movie_id,))
            row = cur.fetchone()
            if not row:
                return None
            return _format_movie(row)

def fetch_movies(sort_by=None, order='asc', language=None, search=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            base_query = """
                select m.movie_id, m.title, m.description, m.tagline, m.poster_link,
                       m.release_year, m.runtime, m.rating, m.avg_user_rating,
                       m.original_language, m.production_companies,
                       array_agg(distinct g.name) as genres
                from movies m
                left join movie_genres mg on m.movie_id = mg.movie_id
                left join genres g on mg.genre_id = g.genre_id
            """
            conditions = list()
            params = list()

            if language:
                conditions.append("m.original_language = %s")
                params.append(language)

            if search:
                conditions.append("lower(m.title) like %s")
                params.append(f"%{search.lower()}%")

            if conditions:
                base_query += " where " + " and ".join(conditions)

            base_query += " group by m.movie_id"

            allowed_sort_fields = {
                'title': 'm.title',
                'rating': 'm.rating',
                'avg_user_rating': 'm.avg_user_rating',
                'release_year': 'm.release_year'
            }

            if sort_by in allowed_sort_fields:
                sort_column = allowed_sort_fields[sort_by]
                base_query += f" order by {sort_column} {order}"

            cur.execute(base_query, params)
            rows = cur.fetchall()
            return [_format_movie(row) for row in rows]

def _format_movie(row):
    return {
        'movie_id': row[0],
        'title': row[1],
        'description': row[2],
        'tagline': row[3],
        'poster_link': row[4],
        'release_year': row[5],
        'runtime': row[6],
        'rating': float(row[7]),
        'avg_user_rating': float(row[8]),
        'original_language': row[9],
        'production_companies': row[10],
        'genres': row[11] or []
    }