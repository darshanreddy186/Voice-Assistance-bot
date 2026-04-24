import asyncio
import os
from datetime import datetime
from services.db_handler import get_order_by_id, create_call_log, schedule_retry
from services.twilio_handler_v2 import initiate_call
from dotenv import load_dotenv

load_dotenv()

CALLBACK_URL = os.getenv("CALLBACK_URL")
MAX_RETRY_ATTEMPTS = 3

async def schedule_call_after_order(order_id: str, delay_seconds: int = 30):
    """
    Schedule a call to be made after specified delay.
    Default: 30 seconds after order placement.
    """
    print(f"⏰ Call scheduled for order {order_id} in {delay_seconds} seconds")
    
    await asyncio.sleep(delay_seconds)
    
    # Get order details
    order = get_order_by_id(order_id)
    if not order:
        print(f"❌ Order {order_id} not found")
        return
    
    # Check if order is still pending
    if order["status"] != "pending":
        print(f"⚠️ Order {order_id} status is {order['status']}, skipping call")
        return
    
    # Initiate call
    try:
        call_sid = initiate_call(
            to_phone=order["phone"],
            order_id=order_id,
            callback_url=CALLBACK_URL
        )
        
        # Log the call
        create_call_log(
            order_id=order_id,
            call_sid=call_sid,
            status="initiated",
            attempt_number=1
        )
        
        print(f"📞 Call initiated for order {order_id}, SID: {call_sid}")
        
    except Exception as e:
        print(f"❌ Failed to initiate call for order {order_id}: {e}")
        create_call_log(
            order_id=order_id,
            call_sid="",
            status="failed",
            attempt_number=1
        )

def handle_call_status(order_id: str, call_status: str, call_sid: str, attempt_number: int = 1):
    """
    Handle call status callbacks and implement retry logic.
    """
    print(f"📊 Call status for order {order_id}: {call_status}")
    
    if call_status == "completed":
        # Call was successful
        return
    
    elif call_status == "no-answer":
        if attempt_number < MAX_RETRY_ATTEMPTS:
            # Retry after 1 minute
            print(f"🔄 Scheduling retry #{attempt_number + 1} for order {order_id} (no answer)")
            schedule_retry(order_id, minutes=1)
            # In production, use a background task queue like Celery
            asyncio.create_task(retry_call(order_id, attempt_number + 1, delay_seconds=60))
    
    elif call_status == "busy":
        if attempt_number < MAX_RETRY_ATTEMPTS:
            # Retry after 2 minutes
            print(f"🔄 Scheduling retry #{attempt_number + 1} for order {order_id} (busy)")
            schedule_retry(order_id, minutes=2)
            asyncio.create_task(retry_call(order_id, attempt_number + 1, delay_seconds=120))
    
    elif call_status == "failed":
        print(f"❌ Call failed for order {order_id}")

async def retry_call(order_id: str, attempt_number: int, delay_seconds: int):
    """
    Retry a failed call after specified delay.
    """
    await asyncio.sleep(delay_seconds)
    
    order = get_order_by_id(order_id)
    if not order or order["status"] != "pending":
        return
    
    try:
        call_sid = initiate_call(
            to_phone=order["phone"],
            order_id=order_id,
            callback_url=CALLBACK_URL
        )
        
        create_call_log(
            order_id=order_id,
            call_sid=call_sid,
            status="initiated",
            attempt_number=attempt_number
        )
        
        print(f"📞 Retry call #{attempt_number} initiated for order {order_id}")
        
    except Exception as e:
        print(f"❌ Retry call failed for order {order_id}: {e}")
