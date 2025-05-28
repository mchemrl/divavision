import React, { useEffect } from "react";

export default function GoogleRedirect() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("t");
    const username = url.searchParams.get("u");

    if (token) {
      localStorage.setItem("access_token", token);
      localStorage.setItem("username", username);
      window.opener?.localStorage.setItem("access_token", token);
    }
    window.close();
  }, []);

  return <p>Finishing sign-in…</p>;
}
