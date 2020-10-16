import React, { useEffect, useRef } from "react";
import "../styles/index.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import the CSS
import {
  LanguageContext,
  defaultLanguageContext,
  useLocale
} from "../components/locales";
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above
import { useState, useCallback } from "react";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { UserContext, defaultUserContext, useWhoAmI } from "../data/user";
import { useRouter } from "next/router";
import Error from "../components/error";
import { apiURL } from "../data/requests";
dayjs.extend(localizedFormat);

const publicPages = ["/", "/activate", "/recover"];
const isPrivatePage = (pathname: string): boolean => {
  return publicPages.indexOf(pathname) === -1;
};

interface MainAppProps {
  Component: React.ElementType;
  pageProps: any;
}

// Fetch the API prefix from hansip API first before showing the main component
const Root = (props: MainAppProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${apiURL}/docs/spec/hansip-api.json`)
      .then((r) => r.json())
      .then((spec) => {
        if (spec.basePath) {
          window.localStorage.setItem("api_prefix", spec.basePath);
          setIsLoading(false);
        } else {
          setError(true);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        setError(true);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return null;
  }

  if (error) {
    return <div>Cannot get API prefix from API server</div>;
  }

  return <MainApp {...props} />;
};

// The main component of the app
function MainApp({ Component, pageProps }: MainAppProps) {
  const [langContext, setLangContext] = useState(defaultLanguageContext);
  const [currentUser, setCurrentUser] = useState(null);
  const { strings } = useLocale();
  const updateLanguage = useCallback(
    (selectedLanguage) => {
      setLangContext({
        ...langContext,
        selected: selectedLanguage
      });
    },
    [langContext]
  );

  const { data: user, loading, error, slowLoading } = useWhoAmI();
  const router = useRouter();
  const pathname = router.pathname;

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (!isPrivatePage(pathname) && !user) {
      return;
    }

    if (loading) {
      return;
    }

    if (user) {
      if (pathname === "/") {
        router.replace("/dashboard/users/list");
        return;
      }
    } else {
      router.replace("/");
      setCurrentUser(null);
      return;
    }

    if (error) {
      router.replace("/");
    }
  }, [user, loading, error, pathname]);

  const showLoading =
    (loading && !currentUser) ||
    (isPrivatePage(pathname) && !currentUser) ||
    (pathname === "/" && currentUser);

  return (
    <LanguageContext.Provider value={{ ...langContext, updateLanguage }}>
      <UserContext.Provider value={currentUser}>
        <div className="bg-gray-100 font-family-karla flex">
          {(error || slowLoading) && (
            <Error message={strings("error-connect")} />
          )}
          {!error && !showLoading && <Component {...pageProps} />}
        </div>
      </UserContext.Provider>
    </LanguageContext.Provider>
  );
}

export default Root;
