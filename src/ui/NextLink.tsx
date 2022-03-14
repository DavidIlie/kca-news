import React from "react";
import Link from "next/link";

interface Props extends Partial<typeof Link> {
    href: string;
    children: React.ReactNode | React.ReactNode[];
}

const NextLink: React.FC<Props> = ({ href, children, ...rest }) => {
    return (
        <Link href={href}>
            <a {...rest}>{children}</a>
        </Link>
    );
};

export default NextLink;
