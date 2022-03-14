import React from "react";

const NavBar: React.FC = () => {
    return (
        <div className="w-full bg-sky-500">
            <div className="container mx-auto flex w-full items-center justify-evenly gap-12 py-4">
                <div>
                    <img src="https://via.placeholder.com/200" />
                </div>
                <div className="text-center">
                    <h1 className="text-6xl font-bold">KCA News</h1>
                    <h1 className="text-lg font-medium italic text-sky-900">
                        Make the school cool
                    </h1>
                </div>
                <div className="flex">
                    <input></input>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
