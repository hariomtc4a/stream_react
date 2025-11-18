import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SpeakerJoin from "./pages/SpeakerJoin.js";
import PlayStream from "./pages/PlayStream";
import Rooms from "./pages/host/Room";
import RoomDetails from "./pages/host/RoomDetails.js";
import LoginPage from "./pages/host/LoginPage.js";
import useHostAuth from "./hooks/useHostAuth";
import { Navigate } from "react-router-dom";

function HostDashboardRoute({ children }) {
  const { loading, authenticated } = useHostAuth();

  if (loading) return <div>Checking authentication...</div>;

  if (!authenticated) return <Navigate to="/host/login" replace />;

  return children;
}

function HostLoginRoute({ children }) {
  const { loading, authenticated } = useHostAuth();

  if (loading) return <div>Checking authentication...</div>;

  if (authenticated) return <Navigate to="/host/rooms" replace />;

  return children;
}

const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },

  {
    path: "/speaker-join",
    element: <SpeakerJoin />,
    loader: ({ request }) => {
      const url = new URL(request.url);
      return { s_id: url.searchParams.get("s_id") };
    },
  },

  {
    path: "/play-stream",
    element: <PlayStream />,
    loader: ({ request }) => {
      const url = new URL(request.url);
      return { p_id: url.searchParams.get("p_id") };
    },
  },

  {
    path: "/host/login",
    element: (
      <HostLoginRoute>
        <LoginPage />
      </HostLoginRoute>
    ),
  },

  {
    path: "/host/rooms",
    element: (
      <HostDashboardRoute>
        <Rooms />
      </HostDashboardRoute>
    ),
  },

  {
    path: "/host/room/:roomId",
    element: (
      <HostDashboardRoute>
        <RoomDetails />
      </HostDashboardRoute>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;