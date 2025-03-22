from fastapi import APIRouter, HTTPException
from database import messages_collection, get_mysql_connection
from models import Message, Notification
from firebase import send_firebase_notification  # Import Firebase function
import mysql.connector
from database import MYSQL_CONFIG
from fastapi import Body

from bson import ObjectId  # Needed for MongoDB ObjectId

router = APIRouter()

def get_user_firebase_token(user_id):
    """Fetch Firebase token for a user from the database."""
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        query = "SELECT firebase_token FROM users WHERE id = %s"
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        
        cursor.close()
        connection.close()
        
        if result:
            return result["firebase_token"]
        return None
    except Exception as e:
        print(f"🔥 Error fetching Firebase token: {e}")
        return None
    
    
@router.post("/save_firebase_token/")
def save_firebase_token(user_id: int = Body(...), token: str = Body(...)):
    try:
        connection = get_mysql_connection()
        cursor = connection.cursor()
        query = "UPDATE users SET firebase_token = %s WHERE id = %s"
        cursor.execute(query, (token, user_id))
        connection.commit()
        return {"status": "success", "message": "Token saved!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        connection.close()

# ✅ Send a Message (MongoDB)
@router.post("/send_message/")
def send_message(message: Message):
    message_data = message.dict()
    messages_collection.insert_one(message_data)
    return {"status": "success", "message": "Message sent!"}

# ✅ Get Messages (MongoDB)
@router.get("/get_messages/{user_id}")
def get_messages(user_id: str):
    messages = list(messages_collection.find({"receiver_id": user_id}, {"_id": 0}))
    return {"messages": messages}

# ✅ Mark Message as Read (MongoDB) (Fix: Convert `message_id` to ObjectId)
@router.put("/mark_message_read/{message_id}")
def mark_message_read(message_id: str):
    try:
        messages_collection.update_one({"_id": ObjectId(message_id)}, {"$set": {"status": "read"}})
        return {"status": "success", "message": "Message marked as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ✅ Create Notification (MySQL) + Send Firebase Push Notification
@router.post("/create_notification/")
def create_notification(notification: Notification):
    connection = get_mysql_connection()
    cursor = connection.cursor()

    try:
        # Fix: Ensure user_id is an integer in the request
        if not isinstance(notification.user_id, int):
            raise HTTPException(status_code=400, detail="Invalid user_id. It must be an integer.")

        # Fix: Ensure is_read has a default value
        query = "INSERT INTO notifications (user_id, message, is_read) VALUES (%s, %s, %s)"
        cursor.execute(query, (notification.user_id, notification.message, notification.is_read or False))
        connection.commit()

        # Fix: Fetch the actual user Firebase token from the DB
        user_token = get_user_firebase_token(notification.user_id)  # Implement this function in database.py

        # Send Firebase Notification
        if user_token:
            send_firebase_notification(user_token, "New Notification", notification.message)

        return {"status": "success", "message": "Notification created & Firebase notification sent"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        connection.close()

# ✅ Get Unread Notifications (MySQL)
@router.get("/get_notifications/{user_id}")
def get_notifications(user_id: int):  # Fix: Ensure user_id is an int
    connection = get_mysql_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = "SELECT * FROM notifications WHERE user_id = %s AND is_read = FALSE"
        cursor.execute(query, (user_id,))
        notifications = cursor.fetchall()
        return {"notifications": notifications}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        connection.close()

# ✅ Mark Notification as Read (MySQL)
@router.put("/mark_notification_read/{notification_id}")
def mark_notification_read(notification_id: int):
    connection = get_mysql_connection()
    cursor = connection.cursor()

    try:
        query = "UPDATE notifications SET is_read = TRUE WHERE id = %s"
        cursor.execute(query, (notification_id,))
        connection.commit()
        return {"status": "success", "message": "Notification marked as read"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cursor.close()
        connection.close()
