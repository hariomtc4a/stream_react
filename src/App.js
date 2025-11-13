import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SpeakerJoin from "./pages/SpeakerJoin.js";
import PlayStream from "./pages/PlayStream";
import Rooms from "./pages/host/Room";
import RoomDetails from "./pages/host/RoomDetails.js";
import "./css/style.css";

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
  {
    path: "/play-stream",
    element: <PlayStream />,
    loader: async ({ request }) => {
      const url = new URL(request.url);
      const p_id = url.searchParams.get("p_id");
      return {p_id};
    },

  },

  {
    path: "/host-panel/rooms",
    element: <Rooms />
  },  
  {
    path: "/host-panel/room/:roomId",
    element: <RoomDetails />,
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
