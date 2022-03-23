import React from "react";
import { NextApiResponse } from "next";

import ErrorPage from "../components/ErrorPage";

interface Props {
   statusCode: number;
}

const Error: React.FC<Props> = ({ statusCode }) => {
   return <ErrorPage statusCode={statusCode} />;
};

export const getInitialProps = ({
   res,
   err,
}: {
   res: NextApiResponse;
   err: { statusCode: number };
}) => {
   const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
   return { statusCode };
};

export default Error;
