const sendPost = async (url: string, body: any, form?: boolean) => {
   const r = await fetch(`${url}`, {
      method: "POST",
      headers: form
         ? {
              Accept: "application/json",
           }
         : {
              Accept: "application/json",
              "Content-Type": "application/json",
           },
      credentials: "include",
      body: form ? body : JSON.stringify(body),
   });

   let response = {};
   try {
      response = await r.json();
   } catch {}

   return {
      request: r,
      response: response as any,
      statusCode: r.status,
   };
};

export default sendPost;
