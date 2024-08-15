import Home from "@/components/main";
import { getAuth } from "@/utils/get-auth";
import React from "react";

const Page = async () => {
  const auth = await getAuth();
  return (
    <div>
      <Home auth={auth} />
    </div>
  );
};

export default Page;
