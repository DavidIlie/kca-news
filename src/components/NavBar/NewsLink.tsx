import React from "react";
import { AiOutlineArrowDown, AiOutlineArrowUp } from "react-icons/ai";
import { Menu } from "@headlessui/react";
import { Category } from "../../lib/categories";

import NextLink from "../../ui/NextLink";
import DropdownElement from "../../ui/DropdownElement";

interface Props {
    name: "News" | "Entertainment" | "Sport" | "Lifestyle";
    categories: Category[];
}

const NewsLink: React.FC<Props> = ({ name, categories }) => {
    return (
        <Menu as="div" className="relative inline-flex">
            <Menu.Button
                as="div"
                className="flex cursor-pointer items-center gap-1 rounded-md border-2 border-gray-200 bg-gray-100 px-2 py-1 duration-150 hover:bg-gray-200 hover:text-gray-900"
            >
                {({ open }) => (
                    <>
                        {name}
                        {open ? (
                            <AiOutlineArrowUp className="-mr-1" />
                        ) : (
                            <AiOutlineArrowDown className="-mr-1" />
                        )}
                    </>
                )}
            </Menu.Button>
            <Menu.Items className="absolute z-10 mt-12 w-36 rounded-md border border-gray-200 bg-gray-50 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {categories.map((news, index) => (
                    <Menu.Item
                        as={NextLink}
                        href={
                            news.url
                                ? news.url
                                : `/${name.toLowerCase()}?filter=${news.id}`
                        }
                        key={index}
                    >
                        <DropdownElement>{news.name}</DropdownElement>
                    </Menu.Item>
                ))}
            </Menu.Items>
        </Menu>
    );
};

export default NewsLink;
