from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import logging

logger = logging.getLogger(__name__)

# Global MongoDB client (singleton pattern)
mongo_client = None
mongo_db = None


def init_mongo(app):
    """Инициализация MongoDB подключения"""
    global mongo_client, mongo_db
    
    mongo_uri = app.config.get('MONGO_URI')
    db_name = app.config.get('MONGO_DB_NAME', 'SquadJS')
    
    if not mongo_uri:
        logger.warning("MONGO_URI not configured, MongoDB features will be disabled")
        return None
    
    try:
        mongo_client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=10000,
            socketTimeoutMS=45000,
            maxPoolSize=50,
            minPoolSize=10
        )
        
        # Test connection
        mongo_client.admin.command('ping')
        mongo_db = mongo_client[db_name]
        
        logger.info(f"✓ Connected to MongoDB: {db_name}")
        return mongo_db
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"✗ MongoDB connection failed: {e}")
        mongo_client = None
        mongo_db = None
        return None
    except Exception as e:
        logger.error(f"✗ Unexpected MongoDB error: {e}")
        mongo_client = None
        mongo_db = None
        return None


def get_db():
    """Получить экземпляр базы данных MongoDB"""
    return mongo_db


def get_collection(collection_name):
    """Получить коллекцию по имени"""
    if mongo_db is None:
        raise RuntimeError("MongoDB not initialized")
    return mongo_db[collection_name]


def close_mongo():
    """Закрыть соединение с MongoDB"""
    global mongo_client, mongo_db
    
    if mongo_client:
        mongo_client.close()
        mongo_client = None
        mongo_db = None
        logger.info("MongoDB connection closed")
