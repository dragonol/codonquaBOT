module.exports = {
    validURL: function (str) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '(m\\.)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

        return {
            valid: !!pattern.test(str),
            domain: RegExp.$3
        }
    },

    copyOneLayer: function (des, src) {
        // check if des is null
        if (des === null || des === undefined) {
            des = {};
        }

        // copy
        for (var key in src) {
            des[key] = src[key];
        }
    },

    isEmpty: function (obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
}