import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SpeakerJoin from "./pages/SpeakerJoin";
import Rooms from "./pages/host/Room";
// import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/speaker-join",
    element: <SpeakerJoin />,
    loader: async ({ request }) => {
      const url = new URL(request.url);
      const s_id = url.searchParams.get("s_id");
      return {s_id};
    },

  },
  // {
  //   path: "/mod-join",
  //   element: <SpeakerJoin />,
  //   loader: async ({ request }) => {
  //     const url = new URL(request.url);
  //     const s_id = url.searchParams.get("s_id");
  //     return {s_id};
  //   },

  // },

  {
    path: "/host-panel/rooms",
    element: <Rooms />
  },
]);

function App() {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
