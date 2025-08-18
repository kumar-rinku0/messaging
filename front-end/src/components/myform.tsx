import React, { useState } from "react";
import { socket } from "../socket";

export function MyForm() {
  const [value, setValue] = useState("");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    socket.emit("create-something", value, (response: any) => {
      console.log("Response from server:", response);
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={value} onChange={(e) => setValue(e.target.value)} />

      <button type="submit">
        Submit
      </button>
    </form>
  );
}
