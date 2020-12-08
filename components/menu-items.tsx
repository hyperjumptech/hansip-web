import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStore,
  faUser,
  faUserFriends,
  faUserTie
} from "@fortawesome/free-solid-svg-icons";
import { RowItem } from "./sidebar";
import { isAAAAdmin, UserType } from "../data/use-get-users";

export const getSidebarItems = (user: UserType): Array<RowItem> => {
  const isSuperAdmin = isAAAAdmin(user);

  return [
    {
      href: "/dashboard/[resource]/list",
      as: "/dashboard/users/list",
      title: "users",
      icon: <FontAwesomeIcon icon={faUser} fixedWidth />
    },
    {
      href: "/dashboard/[resource]/list",
      as: "/dashboard/groups/list",
      title: "groups",
      icon: <FontAwesomeIcon icon={faUserFriends} fixedWidth />
    },
    {
      href: "/dashboard/[resource]/list",
      as: "/dashboard/roles/list",
      title: "roles",
      icon: <FontAwesomeIcon icon={faUserTie} fixedWidth />
    },
    ...(isSuperAdmin
      ? [
          {
            href: "/dashboard/[resource]/list",
            as: "/dashboard/tenants/list",
            title: "tenants",
            icon: <FontAwesomeIcon icon={faStore} fixedWidth />
          }
        ]
      : [])
  ];
};
