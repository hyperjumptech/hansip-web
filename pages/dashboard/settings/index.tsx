import React from "react";
import { SettingsButtons } from "..";
import DashboardLayout from "../../../components/dashboard-layout";
import { useLocale } from "../../../components/locales";
import { PageTitle } from "../../../components/page";
import { useUser } from "../../../data/user";

const SettingsPage = () => {
  const { strings } = useLocale();
  const user = useUser();
  return (
    <DashboardLayout>
      <PageTitle title={strings(`settings`)} />
      <SettingsButtons user={user} />
    </DashboardLayout>
  );
};

export default SettingsPage;
