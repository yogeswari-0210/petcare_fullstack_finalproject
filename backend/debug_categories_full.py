from dependency.db_dependency import get_db
from sqlalchemy import text

def debug_categories():
    try:
        db = next(get_db())
        result = db.execute(text("SELECT id, name, parent_id FROM categories"))
        categories = result.fetchall()
        
        with open("categories_debug.txt", "w", encoding="utf-8") as f:
            f.write(f"Found {len(categories)} categories:\n")
            
            # Build a map for parent names
            cat_map = {row.id: row.name for row in categories}
            
            for row in categories:
                parent_name = cat_map.get(row.parent_id, "None")
                f.write(f"ID: {row.id} | Name: '{row.name}' | Parent: '{parent_name}'\n")
            
    except Exception as e:
        with open("categories_debug.txt", "w", encoding="utf-8") as f:
            f.write(f"Error: {e}\n")

if __name__ == "__main__":
    debug_categories()
