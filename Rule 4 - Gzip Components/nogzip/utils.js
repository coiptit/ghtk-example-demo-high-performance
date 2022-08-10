// Install an event handler.
// Make sure NOT to overwrite any existing handlers.
function rti_addHandler(elem, sType, fn, capture) {
    capture = (capture) ? true : false;

    if (elem.addEventListener) {
        elem.addEventListener(sType, fn, capture);
    }
    else if (elem.attachEvent) {
        elem.attachEvent("on" + sType, fn);
    }
    else {
        // Netscape 4
        if ( elem["on" + sType] ) {
            // Do nothing - we don't want to overwrite an existing handler.
        }
        else {
            elem["on" + sType] = fn;
        }
    }
}


// Get a cookie.
function rt_getCk(name) {
    name = ' ' + name + '=';

    var i, cookies;
    cookies = ' ' + document.cookie + ';';
    if ( (i=cookies.indexOf(name)) >= 0 ) {
        i += name.length;
        cookies = cookies.substring(i, cookies.indexOf(';', i));
        return cookies;
    }

    return "";
}


// Get a subvalue within a cookie.
function rt_getSCk(name, subname) {
    subname = '&' + subname + '=';        // prepend with '&' to avoid confusing "foo" and "afoo"

    var i, subcookie;
    subcookie = rt_getCk(name);
    subcookie = '&' + subcookie + '&';
    if ( (i=subcookie.indexOf(subname)) >= 0 ) {
        subcookie = subcookie.substring(i + subname.length, subcookie.indexOf('&', i + subname.length));
        return subcookie;
    }

    return "";
}


// Set a cookie.
function rt_setCk(name, value, exp, path, domain, sec) {
    var nameval = name + "=" + value;
    var str = nameval +
        ((exp) ? "; expires=" + exp : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((sec) ? "; secure" : "");

    if ( (name.length > 0) && (nameval.length < 4000) ) {
        document.cookie = str;
        return ( value == rt_getCk(name) );    // confirm it was set (could be blocked by user's settings, etc.)
    }

    return 0;
}


// Remove a cookie.
function rt_rmCk(name, domain) {
    var exp = new Date(90, 1, 1);
    return rt_setCk(name, "", exp.toGMTString(), "/", domain);
}


