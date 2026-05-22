import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from server import db, process_and_save_image

def migrate_collection(collection, url_field="image", prefix="img"):
    print(f"Migrating {collection.name}...")
    cursor = collection.find({url_field: {"$regex": "^data:image"}})
    count = 0
    for doc in cursor:
        base64_str = doc.get(url_field)
        if not base64_str:
            continue
            
        print(f"  Processing {doc.get('name') or doc.get('title') or doc.get('id')}...")
        processed = process_and_save_image(base64_str, prefix=prefix)
        
        update_data = {
            url_field: processed["url"]
        }
        if processed.get("blur"):
            update_data["blur_image"] = processed["blur"]
            
        collection.update_one({"_id": doc["_id"]}, {"$set": update_data})
        count += 1
        
    print(f"Done. Migrated {count} items in {collection.name}.\n")

def run():
    if db is None:
        print("Database not connected. Check MONGO_URL.")
        return
        
    migrate_collection(db.products, "image", "prod")
    migrate_collection(db.categories, "image", "cat")
    migrate_collection(db.banners, "image", "ban")
    migrate_collection(db.gallery, "url", "gal")
    
    print("Migration completed successfully!")

if __name__ == "__main__":
    run()
