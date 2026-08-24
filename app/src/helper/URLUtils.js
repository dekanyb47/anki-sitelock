
const URLUtils = {
  getURLHostname (url) {
    // hostname string saved to storage does not contain www. in it.
    const re = /^(https:\/\/|http:\/\/)?(www\.)?(?<hostname>[a-z0-9-.]+\.[a-z0-9]+)(\/.*)?$/;

    const match = url.match(re)
    if (!match) return null;

    return match.groups.hostname;
  }
}