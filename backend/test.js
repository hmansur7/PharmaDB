try {
  const oracledb = require("oracledb");
  console.log(
    "OracleDB library is installed. Version:",
    oracledb.versionString
  );
} catch (err) {
  console.error(
    "OracleDB library is not installed or not accessible:",
    err.message
  );
}
