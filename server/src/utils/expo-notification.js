import { config } from "dotenv";
config();
import { Expo } from "expo-server-sdk";
import { Session } from "../models/user.model.js";
import { getChat } from "../utils/type-fix.js";

const expo = new Expo({
  accessToken: process.env.MESSGING_ACCESS_TOKEN,
});

export const createNotifications = async (members, message, senderName) => {
  const notifications = [];
  const chat = await getChat(message.chatId.toString());
  if (!chat) return;
  // Loop sequentially over members
  for (const m of members) {
    const sessions = await Session.find({
      userId: m,
      token: { $exists: true, $ne: null },
    }).select("os token");
    for (const session of sessions) {
      if (!!session.token && Expo.isExpoPushToken(session.token)) {
        notifications.push({
          to: session.token,
          sound: "default",
          title: senderName,
          body: message.msg,
          channelId: "chat-message",
          threadId: message.chatId.toString(),
          collapseId: message.chatId.toString(),
          data: {
            chatType: chat.type,
            chatId: message.chatId,
            messageId: message._id,
            senderId: message.sender,
            senderName: senderName,
          },
        });
      }
    }
  }

  if (notifications.length > 0) {
    const chunks = expo.chunkPushNotifications(notifications);
    for (const chunk of chunks) {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      console.log("Push receipts:", receipts);
    }
  }
};

// If you want faster execution instead of sequential:

// await Promise.all(
//   members.map(async (m) => {
//     const sessions = await Session.find({
//       userId: m,
//       token: { $exists: true, $ne: null },
//     }).select("os token");

//     sessions.forEach((session) => {
//       if (!!session.token && Expo.isExpoPushToken(session.token)) {
//         notifications.push({
//           to: session.token,
//           sound: "default",
//           title: message.sender,
//           body: message.msg,
//           data: { chatId: message.chat, messageId: message._id },
//         });
//       }
//     });
//   })
// );
