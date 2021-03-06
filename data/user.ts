import useSWR, { mutate } from "swr";
import fetcher from "./fetcher";
import { createContext, useContext, useMemo, useState } from "react";
import { isAAAAdmin, UserType } from "./use-get-users";
import useGetTenants from "./use-get-tenants";
import { post } from "./requests";

const WHO_AM_I_PATHNAME = "/management/user/whoami";

export const defaultUserContext: UserType = {
  rec_id: "",
  email: "",
  enabled: false,
  suspended: false,
  last_seen: "",
  last_login: "",
  enabled_2fa: false,
  access_token: "",
  refresh_token: ""
};
export const UserContext = createContext(defaultUserContext);
UserContext.displayName = "UserContext";

export const useUser = () => {
  const user = useContext(UserContext);

  return user;
};

export const useWhoAmI = () => {
  const [slowLoading, setSlowLoading] = useState(false);
  const { data: whoamiData, error: whoamiError } = useSWR(
    WHO_AM_I_PATHNAME,
    (url) => fetcher(url, null, null),
    {
      refreshInterval: 4 * 60 * 1000,
      errorRetryInterval: 10000,
      errorRetryCount: 3,
      loadingTimeout: 2000,
      refreshWhenHidden: true,
      onLoadingSlow: () => {
        console.log("loading slow");
        setSlowLoading(true);
      },
      onSuccess: () => {
        setSlowLoading(false);
      },
      onError: () => {
        setSlowLoading(false);
      }
    }
  );

  const whoamiLoading = !whoamiError && !whoamiData;

  const {
    data: tenantsData,
    loading: tenantsLoading,
    error: tenantsError
  } = useGetTenants({
    page_no: 1,
    page_size: 1000, // assuming tenant counts will never reach 1000
    order_by: "name",
    sort: "ASC"
  });

  const data = useMemo(() => {
    if (whoamiData?.data && tenantsData) {
      const domains = [
        ...whoamiData.data.roles.map((role) => role.role_domain),
        ...whoamiData.data.groups.map((group) => group.group_domain)
      ];

      const hansipItem = tenantsData.tenants.find(
        (item) => item.domain === process.env.NEXT_PUBLIC_HANSIP_DOMAIN
      );
      let tenants = tenantsData.tenants.filter((tenant) => tenant.domain !== process.env.NEXT_PUBLIC_HANSIP_DOMAIN)
      tenants.unshift(hansipItem)

      if (!isAAAAdmin(whoamiData.data)) {
        tenants = tenantsData.tenants.filter((tenant) =>
          domains.includes(tenant.domain)
        );
      }

      return Object.assign({}, whoamiData.data, { tenants });
    } else {
      return null;
    }
  }, [whoamiData?.data, tenantsData]);

  // refresh the token if needed
  const token = getSavedTokens();
  if ((whoamiData && whoamiData["status"] === "FAIL") || whoamiError) {
    if (token.refresh_token) {
      refreshSavedToken(token.refresh_token);
      return {
        data: null,
        loading: true,
        error: null
      };
    } else {
      setTokenFromResponse(null);
    }
  }

  return {
    data,
    loading: whoamiLoading || tenantsLoading,
    error: whoamiError || tenantsError,
    slowLoading
  };
};

export const refreshSavedToken = (refreshToken: string) => {
  return post(`/auth/refresh`, {}, refreshToken, null, refreshToken, true).then(
    (res) => {
      if (res["status"] === "SUCCESS") {
        setTokenFromResponse(res, refreshToken);
      } else {
        setTokenFromResponse(null);
      }
    }
  );
};

export const refreshMe = () => {
  mutate(WHO_AM_I_PATHNAME);
};

export const setTokenFromResponse = (
  response: {
    data: { access_token: string; refresh_token: string };
  },
  refreshToken?: string
) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!response) {
    window.localStorage.removeItem("at");
    window.localStorage.removeItem("rt");
  } else {
    const {
      data: { access_token, refresh_token: refreshTokenFromResponse }
    } = response;
    if (access_token) {
      window.localStorage.setItem("at", access_token);
      if (refreshTokenFromResponse) {
        window.localStorage.setItem("rt", refreshTokenFromResponse);
      } else if (refreshToken) {
        window.localStorage.setItem("rt", refreshToken);
      }
    } else {
      window.localStorage.removeItem("at");
      window.localStorage.removeItem("rt");
    }
  }

  refreshMe();
};

export const getSavedTokens = () => {
  if (typeof window === "undefined") {
    return {
      access_token: "",
      refresh_token: ""
    };
  }
  return {
    access_token: window.localStorage.getItem("at"),
    refresh_token: window.localStorage.getItem("rt")
  };
};

export const generateRandomPassword = () => {
  const length = 4;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var words = [];
  const numOfWords = 3;

  for (let word = 0; word < numOfWords; word++) {
    let theWord = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      theWord += charset.charAt(Math.floor(Math.random() * n));
    }
    words.push(theWord);
  }

  return words.join(" ");
};
