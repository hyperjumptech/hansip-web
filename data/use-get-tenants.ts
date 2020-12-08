import useSWR from "swr";
import fetcher, { DataPagingType, DataPagingQueryType } from "./fetcher";
import { UserFormInitialData } from "../components/resources/form/user";

export interface TenantType {
  rec_id: string;
  name: string;
  description: string;
  domain: string;
}

export const EmptyTenant: TenantType = {
  rec_id: "",
  name: "",
  description: "",
  domain: ""
};

export interface GetTenantsResult {
  data: null | {
    tenants: Array<TenantType>;
    page: DataPagingType;
  };
  loading: boolean;
  error: Error;
}

const USE_DUMMY_DATA = process.env.NEXT_PUBLIC_USE_DUMMY_DATA;

const sampleTenants = (page: number) => {
  if (USE_DUMMY_DATA !== "true") {
    return null;
  }
  const jsons = [
    require("./samples/api/management/tenants-1.json"),
    require("./samples/api/management/tenants-2.json")
  ];

  return jsons[page - 1];
};

const sampleTenant = () => {
  if (USE_DUMMY_DATA !== "true") {
    return null;
  }
  return require("./samples/api/management/tenant-1.json");
};

const useGetTenants = ({
  page_no,
  page_size,
  order_by,
  sort
}: DataPagingQueryType): GetTenantsResult => {
  const { data, error } = useSWR(
    ["/management/tenants", page_no, page_size, order_by, sort],
    (url, page_no, page_size, order_by, sort) => {
      return fetcher(
        url,
        { page_no, page_size, order_by, sort },
        sampleTenants(page_no)
      );
    }
  );

  return {
    data: data ? data.data : null,
    loading: !error && !data,
    error
  };
};

export interface GetTenantResult {
  data: null | UserFormInitialData;
  loading: boolean;
  error: Error;
}

export const useGetTenant = (tenantId: string): GetTenantResult => {
  const { data, error } = useSWR(`/management/tenant/${tenantId}`, (url) => {
    return fetcher(url, null, sampleTenant());
  });

  return {
    data: data ? data.data : null,
    loading: !error && !data,
    error
  };
};

export default useGetTenants;
