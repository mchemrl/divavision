from ..db import get_connection

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
                return "follow someone first!"

            cur.execute("""
                    select event_id, user_id, event_type, target_id, event_data, created_at
                    from feed_events
                    where user_id = any(%s)
                    order by created_at desc
                    limit 20
                """, (followed_ids,))
            events = cur.fetchall()

            if not events:
                return "no events!"

            user_ids = set()
            list_ids = set()
            movie_ids = set()
            for eid, uid, etype, tid, edata, cat in events:
                user_ids.add(uid)
                if etype == 'follow':
                    user_ids.add(tid)
                elif etype == 'create_list':
                    list_ids.add(tid)
                elif etype in ('write_review', 'add_favorite'):
                    movie_ids.add(tid)

            query_users = """
                    select user_id, username
                    from users
                    where user_id = any(%s)
                """
            cur.execute(query_users, (list(user_ids),))
            rows = cur.fetchall()
            usernames = {row[0]: row[1] for row in rows}

            if list_ids:
                query_lists = """
                        select list_id, title
                        from lists
                        where list_id = any(%s)
                    """
                cur.execute(query_lists, (list(list_ids),))
                rows = cur.fetchall()
                list_names = {row[0]: row[1] for row in rows}
            else:
                list_names = dict()

            if movie_ids:
                query_movies = """
                        select movie_id, title
                        from movies
                        where movie_id = any(%s)
                    """
                cur.execute(query_movies, (list(movie_ids),))
                rows = cur.fetchall()
                movie_titles = {row[0]: row[1] for row in rows}
            else:
                movie_titles = dict()

            result = list()
            for event_id, uid, etype, tid, edata, created_at in events:
                actor = usernames.get(uid, 'someone')
                message = ''

                if etype == 'follow':
                    target_user = usernames.get(tid, 'someone')
                    message = f"{actor} just followed {target_user}"
                elif etype == 'list_created':
                    list_name = list_names.get(tid, 'new list')
                    message = f"{actor} made a new list «{list_name}»"
                elif etype == 'write_review':
                    movie = movie_titles.get(tid, 'this film')
                    message = f"{actor} wrote a review on «{movie}»"
                elif etype == 'add_favorite':
                    movie = movie_titles.get(tid, 'this film')
                    message = f"{actor} added favorite movie «{movie}»"

                result.append({
                    'event_id': event_id,
                    'event_type': etype,
                    'created_at': created_at.strftime("%Y-%m-%d"),
                    'message': message
                })

            return result
