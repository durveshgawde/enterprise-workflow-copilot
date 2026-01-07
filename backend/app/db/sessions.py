from typing import Generator

def get_db() -> Generator:
    """
    Placeholder dependency for future DB access.
    Currently unused because Supabase REST is called directly
    via app.utils.supabase (sb_select/sb_insert/sb_update).
    """
    try:
        yield None
    except Exception as e:
        print(f"Database error: {str(e)}")
