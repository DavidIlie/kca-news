import React from "react";
import { DefaultSeo } from "next-seo";

const Profile: React.FC = () => {
    return (
        <>
            <DefaultSeo title="Profile" />
            <div className="mb-20 flex min-h-screen flex-grow px-4 sm:pt-24 lg:px-0"></div>
        </>
    );
};

export default Profile;
