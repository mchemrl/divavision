from ..db import get_connection

def fetch_movie_by_id(movie_id: int):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                select movie_id, title, description, tagline, poster_link,
                       release_year, runtime, rating, avg_user_rating,
                       original_language, production_companies
                from movies
                where movie_id = %s
            """, (movie_id,))
            row = cur.fetchone()
            if not row:
                return None
            return _format_movie(row)

def fetch_movies(sort_by=None, order='asc', language=None, search=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            base_query = """
                select movie_id, title, description, tagline, poster_link,
                       release_year, runtime, rating, avg_user_rating,
                       original_language, production_companies
                from movies
            """
            conditions = list()
            params = list()

            if language:
                conditions.append("original_language = %s")
                params.append(language)

            if search:
                conditions.append("lower(title) like %s")
                params.append(f"%{search.lower()}%")

            if conditions:
                base_query += " where " + " and ".join(conditions)

            allowed_sort_fields = { 'title': 'title','rating': 'rating', 'avg_user_rating': 'avg_user_rating','release_year': 'release_year'}

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
        'production_companies': row[10]
    }