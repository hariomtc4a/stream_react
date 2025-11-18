import { useEffect, useState } from "react";

export default function useHostAuth() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/authCheck`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        setAuthenticated(data.success === true);
      } catch {
        setAuthenticated(false);
      }

      setLoading(false);
    }

    check();
  }, []);

  return { loading, authenticated };
}
