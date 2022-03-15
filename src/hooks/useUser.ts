import { useSession } from "next-auth/react";

import type { User } from "../types/User";

export default function useUser() {
    const { data, status } = useSession();

    const isLoading = status === "loading";

    return { user: data?.user as User, isLoading };
}
