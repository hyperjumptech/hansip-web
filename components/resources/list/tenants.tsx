import React from "react";
import { useLocale } from "../../locales";
import { PageBody } from "../../page";
import { ResourcesListProps } from "..";
import Table from "../../table";
import { TenantType } from "../../../data/use-get-tenants";
import Link from "next/link";

const headers = ["tenant_name", "description", "domain"];

interface TenantsPageViewProps {
  tenants: Array<TenantType>;
}

export const TenantsPageView = ({ tenants }: TenantsPageViewProps) => {
  return (
    <PageBody>
      <TenantsList headers={headers} rows={tenants} />
    </PageBody>
  );
};

export const TenantsList = ({
  headers,
  rows: tenants,
  onChangeRow
}: ResourcesListProps<TenantType>) => {
  const { strings } = useLocale();
  return (
    <Table
      headers={headers.map((h) => ({
        title: strings(h),
        key: h
      }))}
      rows={tenants}
      colFunc={(row, col, rowObj, headerObj) => {
        let key = headerObj.key;
        if (key === "tenant_name") key = "name";
        return (
          <Link href={`/dashboard/tenants/${rowObj["rec_id"]}/edit`}>
            <a>{rowObj[key]}</a>
          </Link>
        );
      }}
    />
  );
};
