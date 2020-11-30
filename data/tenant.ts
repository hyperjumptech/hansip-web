import { createContext, useContext } from "react";

export const defaultTenantContext = {
  tenants: [],
  selected: null,
  updateTenant: (id: string): void => {}
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
