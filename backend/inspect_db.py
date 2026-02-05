from sqlalchemy import inspect
from database.database import engine

def check_columns():
    inspector = inspect(engine)
    columns = [col['name'] for col in inspector.get_columns('orders')]
    print("Columns in 'orders' table:")
    for col in columns:
        print(f" - {col}")

if __name__ == "__main__":
    check_columns()
