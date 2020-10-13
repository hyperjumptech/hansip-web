import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import CenteredLayout from "./centered-layout";

const Error = ({ message }) => {
  return (
    <CenteredLayout>
      <div className="flex flex-col space-y-2 items-center">
        <div className="text-3xl">
          <FontAwesomeIcon icon={faExclamationTriangle} className="my-4 " />
        </div>
        {message}
      </div>
    </CenteredLayout>
  );
};

export default Error;
