"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { setUser, clearUser } from "@/redux/slices/authSlice";

export default function AuthSync() {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (session?.user) {
      dispatch(
        setUser({
          id: Number(session.user.id),
          email: session.user.email,
        })
      );
    } else {
      dispatch(clearUser());
    }
  }, [session, dispatch]);

  return null;
}
