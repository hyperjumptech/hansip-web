import React, { useState, FormEvent } from "react";
import { useLocale } from "../../locales";
import { TenantType, EmptyTenant } from "../../../data/use-get-tenants";
import { LabelInput } from "../../label-input";
import { useRouter } from "next/router";
import { post } from "../../../data/requests";
import SaveDeleteButtons from "./components/save-delete-buttons";

interface TenantFormViewProps {
  tenant: TenantType;
  onChange: (key: string, value: any) => void;
  onSubmit: (e: FormEvent) => void;
  onDelete: (e: FormEvent) => void;
  error?: string;
  isLoading: boolean;
  isEdit?: boolean;
}
const TenantFormView = ({
  tenant,
  isLoading,
  onChange,
  onSubmit,
  error,
  isEdit,
  onDelete
}: TenantFormViewProps) => {
  const { strings } = useLocale();
  return (
    <form onSubmit={onSubmit} className="resource-form">
      {error && <div className="error-box">{error}</div>}

      <LabelInput
        id="name"
        disabled={isLoading}
        value={tenant?.name || ""}
        inputType="text"
        labelText={strings("tenant_name")}
        placeholder="Tenant #1"
        onChange={(e) => onChange("name", e.target.value)}
      />

      <LabelInput
        value={tenant?.domain || ""}
        id="domain"
        disabled={isLoading}
        inputType="text"
        labelText={strings("domain")}
        placeholder="Domain"
        onChange={(e) => onChange("domain", e.target.value)}
      />

      <LabelInput
        value={tenant?.description || ""}
        id="description"
        disabled={isLoading}
        inputType="text"
        labelText={strings("description")}
        placeholder="Description"
        onChange={(e) => onChange("description", e.target.value)}
      />

      <SaveDeleteButtons showDelete={isEdit} onDelete={onDelete} />
    </form>
  );
};

interface TenantFormProps {
  initialData: typeof EmptyTenant;
  isEdit?: boolean;
}
const TenantForm = ({ initialData = EmptyTenant, isEdit }: TenantFormProps) => {
  const [tenant, setTenant] = useState(initialData);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { strings } = useLocale();

  const onChange = (key: string, value: any) => {
    setTenant((u) => ({
      ...u,
      [key]: value
    }));
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    post(
      isEdit ? `/management/tenant/${tenant.rec_id}` : "/management/tenant",
      {
        name: tenant.name,
        domain: tenant.domain,
        description: tenant.description
      },
      null,
      isEdit ? "PUT" : "POST"
    ).then((response) => {
      if (!response) {
        setIsLoading(false);
      } else {
        if (response.status === "SUCCESS") {
          router.push("/dashboard/tenants/list");
        } else {
          setIsLoading(false);
          setError(response.message);
        }
      }
    });
  };
  const onDelete = (e) => {
    e.preventDefault();

    if (confirm(strings("confirm-delete-tenant"))) {
      setIsLoading(true);

      post(`/management/tenant/${tenant.rec_id}`, {}, null, "DELETE").then(
        (response) => {
          if (response.status === "SUCCESS") {
            router.push("/dashboard/tenants/list");
          } else {
            setError(response.message);
            setIsLoading(false);
          }
        }
      );
    }
  };

  return (
    <TenantFormView
      tenant={tenant}
      isEdit={isEdit}
      onDelete={onDelete}
      isLoading={isLoading}
      error={error}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
};

export default TenantForm;
