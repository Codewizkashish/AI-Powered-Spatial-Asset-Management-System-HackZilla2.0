from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from neo4j import GraphDatabase
from .config import settings

# --- PostgreSQL / PostGIS Setup ---
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency block for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Neo4j Graph Database Setup (Optional) ---
neo4j_driver = None

if settings.NEO4J_URI and settings.NEO4J_USER and settings.NEO4J_PASSWORD:
    try:
        neo4j_driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
    except Exception as e:
        print(f"Warning: Neo4j connection failed - {str(e)}. Graph DB features disabled.")
else:
    print("Info: Neo4j credentials not provided. Graph DB features disabled.")

def get_neo4j_session():
    if neo4j_driver is None:
        raise RuntimeError("Neo4j driver not initialized. Check NEO4J_* environment variables.")
    return neo4j_driver.session()