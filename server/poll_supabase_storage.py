import os
import uuid
from supabase import create_client
from parser import parse_replay
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
bucket = os.getenv("SUPABASE_BUCKET")

supabase = create_client(url, key)
processed_file = "processed_files.json"

def get_processed():
    if os.path.exists(processed_file):
        return set(json.load(open(processed_file)))
    return set()

def save_processed(keys):
    json.dump(list(keys), open(processed_file, "w"))

def poll_and_process():
    processed = get_processed()
    all_files = supabase.storage.from_(bucket).list()

    for file in all_files:
        key = file["name"]
        if not key.endswith(".replay") or key in processed:
            continue

        print(f"Processing: {key}")
        download = supabase.storage.from_(bucket).download(key)
        local_path = f"./tmp/{key.replace('/', '_')}"
        with open(local_path, "wb") as f:
            f.write(download)

        try:
            match_data = parse_replay(local_path)
            match_id = str(uuid.uuid4())

            supabase.table("matches").insert({
                "id": match_id,
                "storage_path": key,
                "map": match_data.map,
                "date": match_data.date,
            }).execute()

            for player in match_data.players:
                supabase.table("player_stats").insert({
                    "id": str(uuid.uuid4()),
                    "match_id": match_id,
                    "player_name": player.name,
                    "team": int(player.team),
                    "goals": player.goals,
                    "assists": player.assists,
                    "saves": player.saves,
                    "shots": player.shots,
                    "score": player.score,
                }).execute()

            processed.add(key)
            save_processed(processed)

        except Exception as e:
            print(f"Failed to process {key}: {e}")
