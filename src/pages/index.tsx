import React from "react";
import { NextSeo } from "next-seo";
import { VscChevronLeft, VscChevronRight } from "react-icons/vsc";

import { Slide } from "react-awesome-reveal";

const Home: React.FC = () => {
    return (
        <>
            <NextSeo title="Home" />
            <div className="flex min-h-screen flex-grow items-center">
                <div className="-ml-24 mt-20 flex w-full justify-center">
                    <Slide cascade triggerOnce direction="left">
                        <div className="relative flex items-center gap-4">
                            <button className="cursor-pointer rounded-full bg-gray-100 p-4 duration-150 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500">
                                <VscChevronLeft size={30} />
                            </button>
                            <div className="w-[70%] duration-150 hover:shadow-xl">
                                <div className="h-26 absolute bottom-0 w-[70%] rounded-br-md rounded-bl-md bg-gray-900 bg-opacity-70 py-2 px-4 text-lg text-white">
                                    <h1 className="line-clamp-3">
                                        <span className="text-2xl font-bold">
                                            BREAKING NEWS:
                                        </span>{" "}
                                        Lorem ipsum dolor sit amet, consectetur
                                        adipiscing elit. Suspendisse euismod
                                        tristique velit id facilisis.
                                        Suspendisse potenti. Nunc blandit orci
                                        sit amet posuere consequat. Quisque nisl
                                        est, mattis at nunc sit amet, tempor
                                        ornare tortor.
                                    </h1>
                                </div>
                                <img
                                    src="/kings-alicante-1.jpg"
                                    className="aspect-[14/9] rounded-md object-cover"
                                />
                            </div>
                            <button className="cursor-pointer rounded-full bg-gray-100 p-4 duration-150 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500">
                                <VscChevronRight size={30} />
                            </button>
                        </div>
                    </Slide>
                    <Slide cascade triggerOnce direction="down">
                        <div className="mt-6 text-center">
                            <h1 className="text-4xl font-medium">
                                Latest Posts:
                            </h1>
                        </div>
                    </Slide>
                </div>
            </div>
        </>
    );
};

export default Home;
