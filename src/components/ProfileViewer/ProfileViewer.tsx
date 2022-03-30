import React from "react";
import { Tooltip } from "@mantine/core";

import { User } from "../../types/User";
import { computeKCAName } from "../../lib/computeKCAName";
import { formatDistance } from "date-fns";
import ProfileTags from "../ProfileTags";
import { Button } from "../../ui/Button";

interface ProfileViewerProps {
   user: User;
   editable?: boolean;
}

const ProfileViewer: React.FC<ProfileViewerProps> = ({
   user,
   editable = false,
}) => {
   return (
      <div className="container max-w-5xl border-2 border-gray-200 bg-white">
         <div className="h-full w-1/4 border-r-2 border-gray-200">
            <div className="h-1/2 px-6 pt-4">
               <Tooltip
                  label="This can be changed by changing your Google profile picture."
                  disabled={!editable}
                  className="mb-2 flex w-full justify-center"
               >
                  <img
                     src={user.image.split("=")[0] || user.image}
                     className="w-40 cursor-pointer rounded-full"
                  />
               </Tooltip>
               <div className="pb-4 text-center">
                  <h1 className="text-lg font-semibold">
                     {computeKCAName(user)}
                  </h1>
                  <p>
                     Joined{" "}
                     {formatDistance(new Date(user.joinedAt), Date.now(), {
                        addSuffix: true,
                     })}
                  </p>
                  <div className="mt-2 flex justify-center">
                     <ProfileTags
                        tags={user.tags}
                        isAdmin={user.isAdmin}
                        isWriter={user.isWriter}
                        isReviewer={user.isReviewer}
                     />
                  </div>
               </div>
            </div>
            <div className="h-1/2 border-t-2 py-4 px-6">
               <div className="mb-2">
                  <h1 className="text-lg font-semibold">Description</h1>
                  <h1>{user.description || "No description..."}</h1>
               </div>
               <div className="mb-2">
                  <h1 className="text-lg font-semibold">Year Group</h1>
                  <h1>{user.showYear ? user.year : "Redacted"}</h1>
               </div>
               <div className="mb-4">
                  <h1 className="text-lg font-semibold">Status</h1>
                  <h1>{user.status || "No status..."}</h1>
               </div>
               <Button className={`w-full ${!editable && "invisible"}`}>
                  Save
               </Button>
            </div>
         </div>
         <div className="w-3/4"></div>
      </div>
   );
};

export default ProfileViewer;
