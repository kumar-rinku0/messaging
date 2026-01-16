import { Expo } from "expo-server-sdk";
import { Types } from "mongoose";
import User, { Session } from "@/models/user.model";
import { config } from "dotenv";
config();

const expo = new Expo({
  accessToken: process.env.MESSGING_ACCESS_TOKEN,
});

interface PushNotification {
  to: string;
  sound: "default" | "none";
  title: string;
  body: string;
  data: {
    chatId: Types.ObjectId | string;
    messageId: Types.ObjectId | string;
  };
}

interface MessagePayload {
  _id: Types.ObjectId | string;
  chat: Types.ObjectId | string;
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
  sender: string
) => {
  const notifications: PushNotification[] = [];

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
          title: sender,
          body: message.msg,
          data: {
            chatId: message.chat,
            messageId: message._id,
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
