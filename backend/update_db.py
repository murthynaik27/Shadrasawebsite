import os
from pymongo import MongoClient

# Use the same mongo URL as server.py
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'shadrasa_db')

try:
    client = MongoClient(mongo_url)
    db = client[db_name]
    
    # Update products that have weight_options
    result = db.products.update_many(
        {"weight_options": {"$exists": True, "$type": "array"}},
        {"$set": {"weight_options.$[].retailerPrice": 0}}
    )
    
    print(f"Matched {result.matched_count} products, modified {result.modified_count} products.")
except Exception as e:
    print(f"Error: {e}")
