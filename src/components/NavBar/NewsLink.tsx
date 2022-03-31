import React from "react";
import { Menu } from "@headlessui/react";

import { Category, Locations } from "../../lib/categories";
import DropdownElement from "../../ui/DropdownElement";
import NextLink from "../../ui/NextLink";

interface Props {
   location: Locations;
   category: Category;
}

const NewsLink: React.FC<Props> = ({ location, category }) => (
   <Menu.Item as={NextLink} href={`/${location}?category=${category.id}`}>
      <DropdownElement>{category.name}</DropdownElement>
   </Menu.Item>
);

export default NewsLink;
