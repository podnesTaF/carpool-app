import { auth0 } from "@/lib/auth0";
import { SessionData } from "@auth0/nextjs-auth0/types";
import { redirect } from "next/navigation";
import type { JSX } from "react";

type ComponentWithSession<T extends {}> = (
  props: T & { session: SessionData }
) => Promise<JSX.Element>;

const WithPageAuthRequired = <T extends {}>(
  Component: ComponentWithSession<T>
) => {
  return async function WrappedComponent(props: T) {
    const session = await auth0.getSession();
    if (!session) {
      redirect("/");
    }

    return <Component {...props} session={session} />;
  };
};

export default WithPageAuthRequired;
