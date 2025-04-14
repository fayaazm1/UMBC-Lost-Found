const messageSound = new Audio('/sounds/message.mp3');
const notificationSound = new Audio('/sounds/notification.mp3');

export const playMessageSound = () => {
  const promise = messageSound.play();
  if (promise !== undefined) {
    promise.catch(error => {
      console.log("Audio play failed:", error);
    });
  }
};

export const playNotificationSound = () => {
  const promise = notificationSound.play();
  if (promise !== undefined) {
    promise.catch(error => {
      console.log("Audio play failed:", error);
    });
  }
};
