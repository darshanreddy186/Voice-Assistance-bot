import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

def create_order(customer_name: str, phone: str, order_details: str, language: str) -> dict:
    result = supabase.table("orders").insert({
        "customer_name": customer_name,
        "phone": phone,
        "order_details": order_details,
        "language": language,
        "status": "pending"
    }).execute()
    return result.data[0]

def get_all_orders() -> list:
    result = supabase.table("orders").select("*").order("created_at", desc=True).execute()
    return result.data

def get_order_by_id(order_id: str) -> dict:
    result = supabase.table("orders").select("*").eq("id", order_id).execute()
    return result.data[0] if result.data else None

def update_order_status(order_id: str, status: str) -> dict:
    result = supabase.table("orders").update({"status": status}).eq("id", order_id).execute()
    return result.data[0] if result.data else None
