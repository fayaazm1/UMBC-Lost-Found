from datetime import datetime
from typing import Dict, Any

class Message:
    def __init__(self, data: Dict[str, Any]):
        self.content = data.get("message", "")
        self.sender_id = data.get("from")
        self.receiver_id = data.get("to")
        self.post_id = data.get("postId")
        self.timestamp = datetime.now()
        self.read_status = False

    def dict(self) -> Dict[str, Any]:
        return {
            "content": self.content,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "post_id": self.post_id,
            "timestamp": self.timestamp.isoformat(),
            "read_status": self.read_status
        }
