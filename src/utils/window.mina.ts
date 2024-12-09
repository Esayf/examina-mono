export async function getAccounts() {
  const accounts =
    window?.mina === undefined
      ? []
      : window?.mina?.isPallad
        ? (
          await window.mina?.request({
            method: "mina_accounts",
          })
        ).result
        : await window.mina?.getAccounts();
  return accounts;
}
