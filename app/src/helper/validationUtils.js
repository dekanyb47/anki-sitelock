const validationUtils = {
  isValidNumber(value) {
    if (typeof value !== "number" || !isFinite(value)) return false;
    return true;
  },

  isValidArray(arr) {
    if (!Array.isArray(arr)) return false;
    return true;
  },

  isValidString(str) {
    if (typeof str === "string" || str instanceof String) return true;
    return false;
  }
}