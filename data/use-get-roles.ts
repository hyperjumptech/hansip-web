import useSWR from "swr";
import fetcher, { DataPagingType, DataPagingQueryType } from "./fetcher";
import { useTenant } from "./tenant";

export interface RoleType {
  rec_id: string;
  role_name: string;
  description?: string;
  role_domain: string;
}

export const EmptyRole: RoleType = {
  rec_id: "",
  role_name: "",
  description: "",
  role_domain: ""
};

export interface GetRolesResult {
  data: null | {
    roles: Array<RoleType>;
    page: DataPagingType;
  };
  loading: boolean;
  error: Error;
}

const USE_DUMMY_DATA = process.env.NEXT_PUBLIC_USE_DUMMY_DATA;

const sampleRoles = (page: number) => {
  if (USE_DUMMY_DATA !== "true") {
    return null;
  }
  const jsons = [
    require("./samples/api/management/roles-1.json"),
    require("./samples/api/management/roles-2.json")
  ];

  return jsons[page - 1];
};

const sampleRole = () => {
  if (USE_DUMMY_DATA !== "true") {
    return null;
  }
  return require("./samples/api/management/role-1.json");
};

const useGetRoles = ({
  page_no,
  page_size,
  order_by,
  sort
}: DataPagingQueryType): GetRolesResult => {
  const { selectedTenant } = useTenant();

  const { data, error } = useSWR(
    [
      selectedTenant ? `/management/tenant/${selectedTenant?.rec_id}/roles` : null,
      page_no,
      page_size,
      order_by,
      sort
    ],
    (url, page_no, page_size, order_by, sort) => {
      return fetcher(
        url,
        {
          page_no,
          page_size,
          order_by,
          sort
        },
        sampleRoles(page_no)
      );
    }
  );

  return {
    data: data ? data.data : null,
    loading: !error && !data,
    error
  };
};

export interface GetRoleResult {
  data: null | RoleType;
  loading: boolean;
  error: Error;
}
export const useGetRole = (roleId: string): GetRoleResult => {
  const { data, error } = useSWR(`/management/role/${roleId}`, (url) =>
    fetcher(url, null, sampleRole())
  );
  return {
    data: data ? data.data : null,
    loading: !error && !data,
    error
  };
};

export default useGetRoles;
