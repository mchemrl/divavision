import json
import psycopg2
from .achievement_service import award_badge_if_earned
from .movie_service import fetch_movie_by_id
from ..utils.db import get_connection

def create_list(user_id, title, description = None, picture_url = None, is_default = False):
    print(user_id, title, description, picture_url, is_default)
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                insert into lists (user_id, title, description, picture_url, is_default)
                values (%s, %s, %s, %s, %s)
                returning list_id, user_id, title, description, picture_url, created_at, is_default
            """, (user_id, title, description, picture_url, is_default))

            row = cur.fetchone()
            list_id = row[0]

            if not is_default:
                cur.execute("""
                insert into feed_events (user_id, event_type, target_id, event_data)
                values (%s, %s, %s, %s)
                """, (user_id, "list_created", list_id, json.dumps({'user_id': user_id})))

            award_badge_if_earned(user_id)
            conn.commit()

def delete_list(user_id, list_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                delete from lists
                where list_id = %s and user_id = %s
                returning list_id
            """, (list_id, user_id))
            result = cur.fetchone()
            conn.commit()

            return result

def change_list(list_id, user_id, title, description=None, picture_url=None):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                update lists
                set title = %s,
                    description = %s,
                    picture_url = %s
                where list_id = %s and user_id = %s
                returning list_id, user_id, title, description, picture_url, created_at, is_default
            """, (title, description, picture_url, list_id, user_id))
            conn.commit()

def fetch_lists(user_id=None, search=None, sort_by=None, order=None):
    sort_by = (sort_by or 'created_at').lower()
    order = (order or 'desc').lower()

    if sort_by not in ['title', 'created_at']:
        sort_by = 'created_at'
    if order not in ['asc', 'desc']:
        order = 'desc'

    with get_connection() as conn:
        with conn.cursor() as cur:
            base_query = f"""
                    select list_id, user_id, title, description, picture_url, created_at
                    from lists
                    where (%s is null or user_id = %s)
                      and (%s is null or lower(title) like lower(concat('%%', %s, '%%')))
                      and is_default = False
                    order by {sort_by} {order.upper()}
                """

            cur.execute(base_query, (user_id, user_id, search, search))
            rows = cur.fetchall()

            return [
                {
                    'list_id': row[0],
                    'user_id': row[1],
                    'title': row[2],
                    'description': row[3],
                    'picture_url': row[4],
                    'created_at': row[5].isoformat()
                }
                for row in rows
            ]

def fetch_list_by_id(list_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                   select list_id, user_id, title, description, picture_url, created_at
                   from lists 
                   where list_id = %s
               """, (list_id,))
            row = cur.fetchone()
            if not row:
                return None

            list_data = {
                'list_id': row[0],
                'user_id': row[1],
                'title': row[2],
                'description': row[3],
                'picture_url': row[4],
                'created_at': row[5].isoformat(),
                'movies': []
            }

            cur.execute("""
                select movie_id from list_items where list_id = %s
            """, (list_id,))
            movie_ids = [r[0] for r in cur.fetchall()]

            for movie_id in movie_ids:
                movie_data = fetch_movie_by_id(movie_id)
                if movie_data:
                    list_data['movies'].append(movie_data)

            return list_data

def delete_movie(list_id, movie_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                   delete from list_items 
                   where list_id = %s and movie_id = %s
                   returning list_item_id
               """, (list_id, movie_id))
            conn.commit()

def add_movie(list_id, movie_id):
    with get_connection() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute("""
                       insert into list_items (list_id, movie_id)
                       values (%s, %s)
                       returning list_item_id
                   """, (list_id, movie_id))
                conn.commit()
                list_item_id = cur.fetchone()[0]

                cur.execute("""
                            select user_id, title, is_default from lists
                            where list_id = %s
                               """, (list_id,))
                list_data = cur.fetchone()
                user_id, title, is_default = list_data

                if is_default and title in ('Favourites'):
                    cur.execute("""
                                    insert into feed_events (user_id, event_type, target_id, event_data)
                                    values (%s, %s, %s, %s)
                                   """, (user_id,
                        f'add_favorite', list_item_id, json.dumps({ 'user_id': user_id, 'movie_id': movie_id })
                    ))

                conn.commit()
            except psycopg2.errors.UniqueViolation:
                conn.rollback()

def add_fav_movie(user_id, movie_id):
    fav_list_id = get_def_list_id(user_id, "Favourites")
    add_movie(fav_list_id, movie_id)

def add_watched_movie(user_id, movie_id):
    watched_list_id = get_def_list_id(user_id, "Watched")
    add_movie(watched_list_id, movie_id)

def get_def_list_id(user_id, name):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("""
            select list_id from lists
            where user_id = %s
            and is_default = True
            and title = %s """, (user_id, name))
            list_id = cur.fetchone()
    return list_id