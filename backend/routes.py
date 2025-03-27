from fastapi import APIRouter, HTTPException, Body
from database import messages_collection, mongo_db, get_mysql_connection, MYSQL_CONFIG
from models import Message, Notification
from firebase import send_firebase_notification
import mysql.connector
from bson import ObjectId

router = APIRouter()


# 🔹 Get Firebase Token (from MySQL)
def get_user_firebase_token(user_id):
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT firebase_token FROM users WHERE id = %s", (user_id,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result["firebase_token"] if result else None
    except Exception as e:
        print(f"🔥 Error fetching Firebase token: {e}")
        return None


# 🔹 Save Firebase Token (MySQL)
@router.post("/save_firebase_token/")
def save_firebase_token(user_id: int = Body(...), token: str = Body(...)):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET firebase_token = %s WHERE id = %s", (token, user_id))
        conn.commit()
        return {"status": "success", "message": "Token saved!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# 🔹 Send Message (MongoDB)
@router.post("/send_message/")
def send_message(message: Message):
    try:
        messages_collection.insert_one(message.dict())
        return {"status": "success", "message": "Message saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🔹 Get Messages for a user (MongoDB)
@router.get("/get_messages/{user_id}")
def get_messages(user_id: str):
    try:
        # Returns both sent and received messages
        messages = list(messages_collection.find({
            "$or": [{"sender_id": user_id}, {"receiver_id": user_id}]
        }, {"_id": 0}))
        return {"messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🔹 Mark message as read
@router.put("/mark_message_read/{message_id}")
def mark_message_read(message_id: str):
    try:
        messages_collection.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"status": "read"}}
        )
        return {"status": "success", "message": "Marked as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🔹 Create Notification (MySQL)
@router.post("/create_notification/")
def create_notification(notification: Notification):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO notifications (user_id, message, is_read) VALUES (%s, %s, %s)",
            (notification.user_id, notification.message, notification.is_read or False)
        )
        conn.commit()

        token = get_user_firebase_token(notification.user_id)
        if token:
            send_firebase_notification(token, "New Notification", notification.message)

        return {"status": "success", "message": "Notification created"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# 🔹 Get unread notifications
@router.get("/get_notifications/{user_id}")
def get_notifications(user_id: int):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM notifications WHERE user_id = %s AND is_read = FALSE", (user_id,))
        return {"notifications": cursor.fetchall()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# 🔹 Mark notification as read
@router.put("/mark_notification_read/{notification_id}")
def mark_notification_read(notification_id: int):
    try:
        conn = get_mysql_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = TRUE WHERE id = %s", (notification_id,))
        conn.commit()
        return {"status": "success", "message": "Marked as read"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# 🔹 Get all users (MongoDB)
@router.get("/users/")
def get_users():
    try:
        users_collection = mongo_db["users"]
        users = list(users_collection.find({}, {"_id": 1, "username": 1}))
        formatted_users = [{"_id": str(user["_id"]), "username": user["username"]} for user in users]
        return {"users": formatted_users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
