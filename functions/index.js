const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendTodoNotification = functions.firestore
  .onDocumentCreated("todos/{todoId}", async (event) => {
    const snapshot = event.data;
    const todo = snapshot.data();

    // Notification payload for FCM
    const payload = {
      notification: {
        title: "Yeni Görev Eklendi!",
        body: todo.text,
      },
    };

    try {
      // Send notification to all devices subscribed to 'todos' topic
      const response = await admin.messaging().sendToTopic("todos", payload);
      console.log("Bildirim başarıyla gönderildi:", response);
      return null;
    } catch (error) {
      console.error("Bildirim gönderilirken hata oluştu:", error);
      return null;
    }
  });