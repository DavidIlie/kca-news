import React from "react";
import { NextSeo } from "next-seo";

const OurTeam: React.FC = () => {
    return (
        <>
            <NextSeo title="About" />
            <div className="flex min-h-screen flex-grow px-4 sm:pt-24 lg:px-0">
                <div className="container mx-auto mt-10 max-w-7xl">
                    <h1 className="mb-2 text-5xl font-medium">
                        What is KCA News?
                    </h1>
                    <p className="text-justify">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Donec auctor magna semper tortor finibus gravida. Donec
                        libero ante, dapibus ut orci sit amet, volutpat
                        facilisis massa. Aenean sed nulla ac nunc pharetra
                        porttitor. Nullam viverra nibh lectus. Pellentesque nisl
                        felis, suscipit id leo sed, accumsan accumsan mi. Mauris
                        a lacus vehicula, ullamcorper odio ut, venenatis dolor.
                        Vivamus vel nisi ex. Integer tempus turpis pellentesque
                        nibh imperdiet, sed molestie enim consequat.
                    </p>
                    <div className="py-4" />
                    <div className="justify-evenly gap-12 sm:flex">
                        <div>
                            <h1 className="mb-2 text-5xl font-medium">
                                Welcome from the editor
                            </h1>
                            <p className="text-justify">
                                Lorem ipsum dolor sit amet, consectetur
                                adipiscing elit. Donec auctor magna semper
                                tortor finibus gravida. Donec libero ante,
                                dapibus ut orci sit amet, volutpat facilisis
                                massa. Aenean sed nulla ac nunc pharetra
                                porttitor. Nullam viverra nibh lectus.
                                Pellentesque nisl felis, suscipit id leo sed,
                                accumsan accumsan mi. Mauris a lacus vehicula,
                                ullamcorper odio ut, venenatis dolor. Vivamus
                                vel nisi ex. Integer tempus turpis pellentesque
                                nibh imperdiet, sed molestie enim consequat.
                            </p>
                        </div>
                        <div className="mt-4 object-cover sm:mt-0 sm:w-[200%]">
                            <img
                                src="./kings-alicante-1.jpg"
                                className="rounded-xl duration-150 hover:shadow-md"
                            />
                            <h1 className="mt-1 text-center text-lg font-semibold">
                                Name
                            </h1>
                        </div>
                    </div>
                    <h1 className="mt-16 text-center text-5xl font-medium">
                        The Team
                    </h1>
                    <div className="grid grid-cols-4 gap-12">
                        <img
                            src="/no-pfp.jpg"
                            className="w-2/3 rounded-full ring-2 ring-gray-800 duration-150 hover:shadow-2xl hover:ring-[3px]"
                        />
                        <img
                            src="/no-pfp.jpg"
                            className="w-2/3 rounded-full ring-2 ring-gray-800 duration-150 hover:shadow-2xl hover:ring-[3px]"
                        />
                        <img
                            src="/no-pfp.jpg"
                            className="w-2/3 rounded-full ring-2 ring-gray-800 duration-150 hover:shadow-2xl hover:ring-[3px]"
                        />
                        <img
                            src="/no-pfp.jpg"
                            className="w-2/3 rounded-full ring-2 ring-gray-800 duration-150 hover:shadow-2xl hover:ring-[3px]"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default OurTeam;
