import { createContext, useContext } from "react";
import { TenantType } from "./use-get-tenants";

export const defaultTenantContext = {
  tenants: [],
  selected: null,
  updateTenant: (tenant: TenantType): void => {}
};

export const TenantContext = createContext(defaultTenantContext);
TenantContext.displayName = "TenantContext";

export const useTenant = () => {
  const tenant = useContext(TenantContext);

  return {
    selectedTenant: tenant.selected,
    tenant: tenant.tenants
  };
};
