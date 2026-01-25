import { config } from "dotenv";
config();
import { Expo } from "expo-server-sdk";
import { Types } from "mongoose";
import { Session } from "@/models/user.model";
import { getChat } from "./type-fix";

const expo = new Expo({
  accessToken: process.env.MESSGING_ACCESS_TOKEN,
});

interface PushNotification {
  to: string;
  sound: "default" | "none";
  title: string;
  body: string;
  channelId?: string;
  badge?: number;
  data: {
    chatId: Types.ObjectId | string;
    messageId: Types.ObjectId | string;
    message: MessagePayload;
  };
}

interface MessagePayload {
  _id: Types.ObjectId | string;
  chatId: Types.ObjectId | string;
  sender: Types.ObjectId | string; // sender name
  msg: string;
}

/**
 * Sends Expo push notifications to all sessions of given members
 * @param members Array of user IDs
 * @param message The message object
 */

export const createNotifications = async (
  members: Types.ObjectId[],
  message: MessagePayload,
  senderName: string,
) => {
  const notifications: PushNotification[] = [];
  const chat = await getChat(message.chatId.toString());
  const messageBody =
    chat?.type === "group" ? `${chat.name} : ${message.msg}` : message.msg;
  // Loop sequentially over members
  for (const m of members) {
    const sessions = await Session.find({
      userId: m,
      token: { $exists: true, $ne: null },
    }).select("os token");
    const notificationCount = chat?.notification.find(
      (n: any) => n.userId.toString() === m.toString(),
    )?.count;
    for (const session of sessions) {
      if (!!session.token && Expo.isExpoPushToken(session.token)) {
        notifications.push({
          to: session.token,
          sound: "default",
          title: senderName,
          body: messageBody,
          channelId: "chat-message",
          badge: notificationCount ? notificationCount : 0,
          data: {
            chatId: message.chatId,
            messageId: message._id,
            message: message,
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
