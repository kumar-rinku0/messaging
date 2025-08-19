import { useState, useEffect } from "react";
import { socket } from "./socket";
import { ConnectionState } from "./components/connection-state";
import { ConnectionManager } from "./components/connection.maneger";
import { Events } from "./components/event";
import { MyForm } from "./components/myform";

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState<any[]>([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value: any) {
      console.log("Received foo event:", value);
      // chrome notification on foo event
      if (Notification.permission !== "granted") {
        Notification.requestPermission();
      }
      if (Notification.permission === "granted") {
        new Notification("Foo Event", {
          body: `Received foo event: ${value}`,
        });
      }
      setFooEvents((previous) => [...previous, value]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("foo", onFooEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("foo", onFooEvent);
    };
  }, []);

  return (
    <div className="App">
      <ConnectionState isConnected={isConnected} />
      <Events events={fooEvents} />
      <ConnectionManager />
      <MyForm />
    </div>
  );
}
