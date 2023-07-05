export default class Helper {
    static nicedate(id) {
        console.log ("Helper.nicedate: ",id)
        const dt = new Date(parseInt(id));
        return dt.toUTCString()
    }
}