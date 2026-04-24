import os
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# USER OPERATIONS
def create_user(first_name: str, last_name: str, phone: str, address: str):
    result = supabase.table("users").insert({
        "first_name": first_name,
        "last_name": last_name,
        "phone": phone,
        "address": address
    }).execute()
    return result.data[0] if result.data else None

def get_user_by_phone(phone: str):
    result = supabase.table("users").select("*").eq("phone", phone).execute()
    return result.data[0] if result.data else None

def get_user_by_id(user_id: str):
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    return result.data[0] if result.data else None

# PRODUCT OPERATIONS
def get_all_products():
    result = supabase.table("products").select("*").execute()
    return result.data

# CART OPERATIONS
def add_to_cart(user_id: str, product_id: str, quantity: int = 1):
    result = supabase.table("cart").upsert({
        "user_id": user_id,
        "product_id": product_id,
        "quantity": quantity
    }).execute()
    return result.data[0] if result.data else None

def get_cart(user_id: str):
    result = supabase.table("cart").select("*, products(*)").eq("user_id", user_id).execute()
    return result.data

def remove_from_cart(user_id: str, product_id: str):
    supabase.table("cart").delete().eq("user_id", user_id).eq("product_id", product_id).execute()

def clear_cart(user_id: str):
    supabase.table("cart").delete().eq("user_id", user_id).execute()

# ORDER OPERATIONS
def create_order(user_id: str, customer_name: str, phone: str, address: str, 
                 delivery_datetime: str, language: str, total_amount: float):
    result = supabase.table("orders").insert({
        "user_id": user_id,
        "customer_name": customer_name,
        "phone": phone,
        "address": address,
        "delivery_datetime": delivery_datetime,
        "language": language,
        "total_amount": total_amount,
        "status": "pending"
    }).execute()
    return result.data[0] if result.data else None

def add_order_items(order_id: str, items: list):
    order_items = [{
        "order_id": order_id,
        "product_id": item.get("product_id"),
        "product_name": item.get("product_name"),
        "quantity": item.get("quantity"),
        "price": item.get("price")
    } for item in items]
    result = supabase.table("order_items").insert(order_items).execute()
    return result.data

def get_order_by_id(order_id: str):
    result = supabase.table("orders").select("*, order_items(*)").eq("id", order_id).execute()
    return result.data[0] if result.data else None

def get_all_orders():
    result = supabase.table("orders").select("*, order_items(*), users(*)").order("created_at", desc=True).execute()
    return result.data

def update_order_status(order_id: str, status: str):
    result = supabase.table("orders").update({
        "status": status,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", order_id).execute()
    return result.data[0] if result.data else None

def update_order_delivery(order_id: str, delivery_datetime: str):
    result = supabase.table("orders").update({
        "delivery_datetime": delivery_datetime,
        "status": "modified",
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", order_id).execute()
    return result.data[0] if result.data else None

def update_order_address(order_id: str, address: str):
    result = supabase.table("orders").update({
        "address": address,
        "status": "modified",
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", order_id).execute()
    return result.data[0] if result.data else None

# CALL LOG OPERATIONS
def create_call_log(order_id: str, call_sid: str, status: str, attempt_number: int):
    result = supabase.table("call_logs").insert({
        "order_id": order_id,
        "call_sid": call_sid,
        "status": status,
        "attempt_number": attempt_number
    }).execute()
    return result.data[0] if result.data else None

def update_call_log(call_sid: str, status: str, duration: int = None):
    data = {"status": status}
    if duration:
        data["duration"] = duration
    result = supabase.table("call_logs").update(data).eq("call_sid", call_sid).execute()
    return result.data[0] if result.data else None

def schedule_retry(order_id: str, minutes: int):
    retry_time = datetime.utcnow() + timedelta(minutes=minutes)
    result = supabase.table("call_logs").update({
        "retry_scheduled_at": retry_time.isoformat()
    }).eq("order_id", order_id).execute()
    return result.data[0] if result.data else None

def get_call_logs(order_id: str):
    result = supabase.table("call_logs").select("*").eq("order_id", order_id).order("created_at", desc=True).execute()
    return result.data

# ORDER MODIFICATION OPERATIONS
def add_modification(order_id: str, modification_type: str, old_value: str, 
                     new_value: str, user_input: str, ai_response: str, language: str):
    result = supabase.table("order_modifications").insert({
        "order_id": order_id,
        "modification_type": modification_type,
        "old_value": old_value,
        "new_value": new_value,
        "user_input": user_input,
        "ai_response": ai_response,
        "language": language
    }).execute()
    return result.data[0] if result.data else None

def get_modifications(order_id: str):
    result = supabase.table("order_modifications").select("*").eq("order_id", order_id).order("created_at", desc=False).execute()
    return result.data

# CONVERSATION HISTORY OPERATIONS
def add_conversation_turn(order_id: str, call_sid: str, turn_number: int, 
                          user_input: str, detected_language: str, 
                          ai_intent: str, ai_response: str):
    result = supabase.table("conversation_history").insert({
        "order_id": order_id,
        "call_sid": call_sid,
        "turn_number": turn_number,
        "user_input": user_input,
        "detected_language": detected_language,
        "ai_intent": ai_intent,
        "ai_response": ai_response
    }).execute()
    return result.data[0] if result.data else None

def get_conversation_history(order_id: str):
    result = supabase.table("conversation_history").select("*").eq("order_id", order_id).order("turn_number", desc=False).execute()
    return result.data
