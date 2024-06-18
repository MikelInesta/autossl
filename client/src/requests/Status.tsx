const updateCsrStatus = async (domainId: string, status: string) => {
  console.log("Updating csr status");
  try {
    const data = {
      newStatus: status,
    };

    const jsonData = JSON.stringify(data);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/domains/update-csr-status/${domainId}`,
      {
        method: "POST",
        body: jsonData,
        headers: {
          "content-type": "application/json",
        },
      }
    );
    if (response.status != 200) {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error("Error updating csr status:", error);
  }
};

const updateInstallStatus = async (domainId: string, status: string) => {
  console.log("Updating install status");
  try {
    const data = {
      newStatus: status,
    };

    const jsonData = JSON.stringify(data);

    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/domains/update-install-status/${domainId}`,
      {
        method: "POST",
        body: jsonData,
        headers: {
          "content-type": "application/json",
        },
      }
    );
    if (response.status != 200) {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error("Error updating install status:", error);
  }
};

const updateRollbackStatus = async (domainId: string, status: string) => {
  console.log("Updating rollback status");
  try {
    const data = {
      newStatus: status,
    };

    const jsonData = JSON.stringify(data);

    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL
      }/domains/update-rollback-status/${domainId}`,
      {
        method: "POST",
        body: jsonData,
        headers: {
          "content-type": "application/json",
        },
      }
    );
    if (response.status != 200) {
      throw new Error(response.statusText);
    }
  } catch (error) {
    console.error("Error updating rollback status:", error);
  }
};

export { updateCsrStatus, updateInstallStatus, updateRollbackStatus };
