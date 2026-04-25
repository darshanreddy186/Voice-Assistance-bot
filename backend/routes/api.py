import os
import asyncio
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import Response, FileResponse
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

from services.db_handler import *
from services.twilio_handler_v2 import generate_initial_greeting, generate_conversational_response
from services.ai_handler_v2 import process_voice_input, detect_language
from services.call_scheduler import schedule_call_after_order, handle_call_status

router = APIRouter()

# ============ PYDANTIC MODELS ============
class UserSignup(BaseModel):
    first_name: str
    last_name: str
    phone: str
    address: str

class UserLogin(BaseModel):
    phone: str

class AddToCartRequest(BaseModel):
    user_id: str
    product_id: str
    quantity: int = 1

class PlaceOrderRequest(BaseModel):
    user_id: str
    delivery_datetime: str
    language: str = "en-US"

# ============ USER ENDPOINTS ============
@router.post("/signup")
def signup(user: UserSignup):
    try:
        existing = get_user_by_phone(user.phone)
        if existing:
            raise HTTPException(status_code=400, detail="Phone number already registered")
        
        new_user = create_user(user.first_name, user.last_name, user.phone, user.address)
        return {"success": True, "user": new_user}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
def login(credentials: UserLogin):
    try:
        user = get_user_by_phone(credentials.phone)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"success": True, "user": user}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ PRODUCT ENDPOINTS ============
@router.get("/products")
def get_products():
    try:
        products = get_all_products()
        return {"products": products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ CART ENDPOINTS ============
@router.post("/cart/add")
def add_cart_item(req: AddToCartRequest):
    try:
        item = add_to_cart(req.user_id, req.product_id, req.quantity)
        return {"success": True, "item": item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/cart/{user_id}")
def get_user_cart(user_id: str):
    try:
        cart = get_cart(user_id)
        return {"cart": cart}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/cart/{user_id}/{product_id}")
def remove_cart_item(user_id: str, product_id: str):
    try:
        remove_from_cart(user_id, product_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ ORDER ENDPOINTS ============
@router.post("/place-order")
async def place_order(req: PlaceOrderRequest):
    try:
        user = get_user_by_id(req.user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        cart = get_cart(req.user_id)
        if not cart:
            raise HTTPException(status_code=400, detail="Cart is empty")
        
        # Calculate total
        total = sum(item["quantity"] * item["products"]["price"] for item in cart)
        
        # Create order
        order = create_order(
            user_id=req.user_id,
            customer_name=f"{user['first_name']} {user['last_name']}",
            phone=user["phone"],
            address=user["address"],
            delivery_datetime=req.delivery_datetime,
            language=req.language,
            total_amount=total
        )
        
        # Add order items
        items = [{
            "product_id": item["product_id"],
            "product_name": item["products"]["name"],
            "quantity": item["quantity"],
            "price": item["products"]["price"]
        } for item in cart]
        
        add_order_items(order["id"], items)
        
        # Clear cart
        clear_cart(req.user_id)
        
        # Schedule call after 30 seconds
        asyncio.create_task(schedule_call_after_order(order["id"], delay_seconds=5))
        
        return {"success": True, "order": order}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders")
def get_orders_list():
    try:
        orders = get_all_orders()
        return {"orders": orders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/order/{order_id}")
def get_order_details(order_id: str):
    try:
        order = get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Get additional data
        modifications = get_modifications(order_id)
        call_logs = get_call_logs(order_id)
        conversation = get_conversation_history(order_id)
        
        return {
            "order": order,
            "modifications": modifications,
            "call_logs": call_logs,
            "conversation": conversation
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ TWILIO WEBHOOKS ============
@router.post("/voice")
async def voice_webhook(request: Request, order_id: str):
    try:
        print(f"\n=== Voice Webhook Called ===")
        print(f"Order ID: {order_id}")
        
        order = get_order_by_id(order_id)
        if not order:
            return Response(content="<Response><Say>Order not found.</Say></Response>", media_type="application/xml")
        
        callback_url = os.getenv("CALLBACK_URL")
        twiml = generate_initial_greeting(order, callback_url)
        
        print(f"TwiML Generated:\n{twiml}\n")
        return Response(content=twiml, media_type="application/xml")
        
    except Exception as e:
        print(f"ERROR in voice_webhook: {e}")
        return Response(content="<Response><Say>An error occurred.</Say></Response>", media_type="application/xml")

@router.post("/process-speech")
async def process_speech(request: Request, order_id: str, turn: int = 1):
    try:
        form_data = await request.form()
        
        print(f"\n=== Speech Processing (Turn {turn}) ===")
        print(f"Order ID: {order_id}")
        print(f"Form data: {dict(form_data)}")
        
        # Get speech result or digits
        speech_result = form_data.get("SpeechResult", "")
        digits = form_data.get("Digits", "")
        call_sid = form_data.get("CallSid", "")
        
        user_input = speech_result if speech_result else ("confirm" if digits == "1" else "cancel" if digits == "2" else "")
        
        print(f"User input: '{user_input}'")
        print(f"Speech result: '{speech_result}'")
        print(f"Digits: '{digits}'")
        
        if not user_input:
            return Response(content="<Response><Say>I didn't hear anything. Goodbye.</Say></Response>", media_type="application/xml")
        
        # Get order and conversation history (current call only)
        order = get_order_by_id(order_id)
        all_conversation = get_conversation_history(order_id)
        
        # Filter to only turns from the current call_sid to avoid
        # old call history making has_confirmed=True on a fresh call
        if call_sid:
            conversation = [t for t in all_conversation if t.get("call_sid") == call_sid]
        else:
            # Fallback: only use turns before current turn number
            conversation = [t for t in all_conversation if t.get("turn_number", 0) < turn]
        
        # Process with AI
        ai_result = process_voice_input(user_input, order, conversation)
        
        print(f"AI Result: {ai_result}")
        
        # Save conversation turn
        add_conversation_turn(
            order_id=order_id,
            call_sid=call_sid,
            turn_number=turn,
            user_input=user_input,
            detected_language=ai_result["detected_language"],
            ai_intent=ai_result["intent"],
            ai_response=ai_result["response_text"]
        )
        
        # Handle intent
        if ai_result["intent"] == "confirm":
            update_order_status(order_id, "confirmed")
            
        elif ai_result["intent"] == "cancel":
            update_order_status(order_id, "cancelled")
            
        elif ai_result["intent"] == "keep_order":
            # User wants to keep order as is
            update_order_status(order_id, "confirmed")
            
        elif ai_result["intent"] == "no_query":
            # User has no more questions - end call gracefully
            update_order_status(order_id, "confirmed")
            
        elif ai_result["intent"] in ["query_location", "query_time", "query"]:
            # These are queries, don't change status yet
            pass
            
        elif ai_result["intent"] == "modify_time":
            mods = ai_result["modifications"]
            
            if mods.get("time_change_approved"):
                # Time change approved by AI, but we need to validate
                new_time_str = mods.get("delivery_time")
                if new_time_str:
                    # Parse the new time
                    new_time = parse_delivery_time_from_text(new_time_str, order["delivery_datetime"])
                    
                    # Validate time change (0-5 hours later)
                    is_valid, hours_diff = validate_time_change(new_time, order["delivery_datetime"])
                    
                    if is_valid:
                        # Update delivery time
                        update_order_delivery(order_id, new_time)
                        add_modification(order_id, "delivery_time", order["delivery_datetime"], 
                                       new_time, user_input, ai_result["response_text"], ai_result["detected_language"])
                        update_order_status(order_id, "confirmed")
                    else:
                        # Time change rejected - AI should have already sent rejection message
                        # Just log it
                        print(f"[API] Time change rejected: {hours_diff:.1f} hours difference (valid range: 0-5 hours later)")
            else:
                # Time change rejected by AI, keep conversation open
                pass
            
        elif ai_result["intent"] == "modify":
            # Legacy modify intent
            mods = ai_result["modifications"]
            
            if mods.get("delivery_time"):
                new_time = parse_delivery_time(mods["delivery_time"], order["delivery_datetime"])
                update_order_delivery(order_id, new_time)
                add_modification(order_id, "delivery_time", order["delivery_datetime"], 
                               new_time, user_input, ai_result["response_text"], ai_result["detected_language"])
            
            if mods.get("address"):
                update_order_address(order_id, mods["address"])
                add_modification(order_id, "address", order["address"], 
                               mods["address"], user_input, ai_result["response_text"], ai_result["detected_language"])
        
        # Generate response
        if ai_result["continue_conversation"]:
            callback_url = os.getenv("CALLBACK_URL")
            # Map detected language back to full code
            lang_map = {"en": "en-US", "hi": "hi-IN", "kn": "kn-IN", "mr": "mr-IN"}
            full_lang_code = lang_map.get(ai_result["detected_language"], order["language"])
            
            twiml = generate_conversational_response(
                message=ai_result["response_text"],
                language=full_lang_code,
                callback_url=callback_url,
                order_id=order_id,
                turn_number=turn + 1
            )
        else:
            # End conversation - generate final response with proper TTS
            from services.tts_handler import get_voice_config
            from services.audio_generator import generate_audio, get_audio_url
            from twilio.twiml.voice_response import VoiceResponse
            
            lang_map = {"en": "en-US", "hi": "hi-IN", "kn": "kn-IN", "mr": "mr-IN"}
            full_lang_code = lang_map.get(ai_result["detected_language"], order["language"])
            config = get_voice_config(full_lang_code)
            
            response = VoiceResponse()
            
            if config.get("use_gtts"):
                # Generate audio for Kannada/Marathi
                audio_file = generate_audio(ai_result["response_text"], full_lang_code, f"final_{order_id}_{turn}")
                if audio_file:
                    callback_url = os.getenv("CALLBACK_URL")
                    audio_url = get_audio_url(f"final_{order_id}_{turn}", callback_url)
                    response.play(audio_url)
                else:
                    response.say(ai_result["response_text"], voice="Polly.Aditi", language="hi-IN")
            else:
                # Use Polly for English/Hindi
                response.say(ai_result["response_text"], voice=config["voice"], language=config["language"])
            
            twiml = str(response)
        
        print(f"Response TwiML:\n{twiml}\n")
        return Response(content=twiml, media_type="application/xml")
        
    except Exception as e:
        print(f"ERROR in process_speech: {e}")
        import traceback
        traceback.print_exc()
        return Response(content="<Response><Say>An error occurred.</Say></Response>", media_type="application/xml")

@router.post("/call-status")
async def call_status_webhook(request: Request, order_id: str):
    try:
        form_data = await request.form()
        call_status = form_data.get("CallStatus", "")
        call_sid = form_data.get("CallSid", "")
        call_duration = form_data.get("CallDuration", 0)
        
        print(f"\n=== Call Status Update ===")
        print(f"Order: {order_id}, Status: {call_status}, SID: {call_sid}")
        
        # Update call log
        update_call_log(call_sid, call_status, int(call_duration))
        
        # Handle retry logic
        call_logs = get_call_logs(order_id)
        attempt_number = len(call_logs)
        handle_call_status(order_id, call_status, call_sid, attempt_number)
        
        return {"success": True}
        
    except Exception as e:
        print(f"ERROR in call_status_webhook: {e}")
        return {"success": False}

@router.get("/audio/{filename}")
def serve_audio(filename: str):
    audio_path = Path("audio_files") / filename
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(audio_path, media_type="audio/mpeg")

# ============ HELPER FUNCTIONS ============
def parse_delivery_time(time_str: str, current_delivery: str) -> str:
    """
    Parse natural language time into ISO datetime.
    Simplified version - enhance for production.
    """
    current = datetime.fromisoformat(current_delivery.replace('Z', '+00:00'))
    
    if "tomorrow" in time_str.lower():
        new_time = current + timedelta(days=1)
    elif "evening" in time_str.lower():
        new_time = current.replace(hour=18, minute=0)
    elif "morning" in time_str.lower():
        new_time = current.replace(hour=9, minute=0)
    else:
        new_time = current
    
    return new_time.isoformat()

def parse_delivery_time_from_text(time_text: str, current_delivery: str) -> str:
    """
    Parse time from user input like "8 PM", "20:00", "8:30 PM" etc.
    """
    import re
    from datetime import datetime, timedelta
    
    current = datetime.fromisoformat(current_delivery.replace('Z', '+00:00'))
    
    # Try to extract time patterns
    # Pattern 1: "8 PM", "8PM", "8 pm"
    match = re.search(r'(\d{1,2})\s*(pm|am|PM|AM)', time_text)
    if match:
        hour = int(match.group(1))
        meridiem = match.group(2).upper()
        
        if meridiem == "PM" and hour != 12:
            hour += 12
        elif meridiem == "AM" and hour == 12:
            hour = 0
            
        new_time = current.replace(hour=hour, minute=0, second=0)
        return new_time.isoformat()
    
    # Pattern 2: "20:00", "08:30"
    match = re.search(r'(\d{1,2}):(\d{2})', time_text)
    if match:
        hour = int(match.group(1))
        minute = int(match.group(2))
        new_time = current.replace(hour=hour, minute=minute, second=0)
        return new_time.isoformat()
    
    # Pattern 3: Just number like "8", "20"
    match = re.search(r'\b(\d{1,2})\b', time_text)
    if match:
        hour = int(match.group(1))
        # Assume PM if hour is less than 12 and current time is afternoon
        if hour < 12 and current.hour >= 12:
            hour += 12
        new_time = current.replace(hour=hour, minute=0, second=0)
        return new_time.isoformat()
    
    # Default: return current time
    return current.isoformat()

def validate_time_change(new_time_str: str, original_time_str: str) -> tuple[bool, float]:
    """
    Validate if time change is within 0-5 hours LATER than original time.
    Returns: (is_valid, hours_difference)
    """
    from datetime import datetime
    
    original = datetime.fromisoformat(original_time_str.replace('Z', '+00:00'))
    new_time = datetime.fromisoformat(new_time_str.replace('Z', '+00:00'))
    
    # Calculate difference in hours
    diff = (new_time - original).total_seconds() / 3600
    
    # Valid if 0 <= diff <= 5 (0 to 5 hours later)
    is_valid = 0 <= diff <= 5
    
    return is_valid, diff
