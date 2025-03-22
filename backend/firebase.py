import firebase_admin
from firebase_admin import credentials, messaging

# Load Firebase credentials
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)

def send_firebase_notification(user_token, title, body):
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body
        ),
        token=user_token,
    )
    response = messaging.send(message)
    print("✅ Notification sent successfully:", response)
