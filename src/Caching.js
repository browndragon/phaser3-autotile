/**
 * Wraps each call to `someFunction` in a cache lookup.
 * The cache key is just the array concatenation of the parameters, so this is pretty dumb.
 */
function caching(someFunction, maxSize=1000) {
    if (maxSize === 0) {
        return someFunction;
    }
    if (maxSize < 0) {
        maxSize = null;
    }
    let cache = new Map();
    return (...rest) => {
        let entry = cache.get('' + rest);
        if (entry != undefined) {
            return entry;
        }
        entry = someFunction(...rest);
        cache.put('' + rest, entry);
        if (maxSize && cache.length > maxSize) {
            const delkey = cache.keys().next().value;
            cache.delete(delkey);
        }
        return entry;
    };
}
export default caching;