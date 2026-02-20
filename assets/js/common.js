let opened_filters = [];
let opened_modal = [];
let dave_url = "https://api.example.com";
let enterprise_id = "demo_enterprise";
let signup_api_key = "DEMO_SIGNUP_API_KEY";
// device detection
let is_iPad = navigator.userAgent.match(/iPad/i) != null;
let is_IE = navigator.userAgent.match(/MSIE/i) != null;

function getCookie(key, dflt) {
    if (dflt === undefined) {
        dflt = null;
    }
    let result = window.localStorage.getItem(key);
    if (result === null || result === undefined) {
        return dflt;
    }
    try {
        r = JSON.parse(result);
    } catch (err) {
        if (result) {
            r = result;
        }
    }
    return r;
}

function setCookie(key, value, hoursExpire) {
    if (hoursExpire === undefined) {
        hoursExpire = 24;
    }
    if (value === null || value === undefined) {
        return;
    }
    if (typeof value == "object") {
        value = JSON.stringify(value);
    }
    if (hoursExpire < 0) {
        window.localStorage.removeItem(key);
    } else {
        window.localStorage.setItem(key, value);
    }
}

function clearCookie(key) {
    setCookie(key, "", -24);
}

function signup(data, postfunc, errorFunc) {
    data = data || {};
    var signupurl = dave_url + "/customer-signup/customer";
    //Password string generator
    let params = get_url_params();
    if (params.customer_id) {
        params.customer_id = makeSingle(params.customer_id);
    }
    let customer_id = params.customer_id || getCookie("customer_id") || data.customer_id || ("demo_" + generate_random_string(8));
    let ddata = {
        "name": "anonymous",
        "customer_id": customer_id,
        "email": "demo+" + generate_random_string(8) + "@example.com",
        "validated": true,
        "password": generate_random_string(8)
    };
    for (let k in ddata) {
        if (!data[k]) {
            data[k] = ddata[k];
        }
    }
    data["browser"] = "{agent_info.browser}";
    data["os"] = "{agent_info.os}";
    data["device_type"] = "{agent_info.device}";
    for (k of ["utm_source", "utm_medium", "utm_campaign", "utm_term"]) {
        if (params[k]) {
            data[k] = params[k];
        }
    }

    // Fallback function: creates demo headers so the app works without a backend
    function createDemoFallback() {
        console.warn("[Demo Mode] Backend API unavailable. Using demo authentication.");
        var demoData = {
            customer_id: customer_id,
            api_key: "DEMO_API_KEY_" + generate_random_string(12)
        };
        HEADERS = {
            "Content-Type": "application/json",
            "X-I2CE-ENTERPRISE-ID": enterprise_id,
            "X-I2CE-USER-ID": demoData.customer_id,
            "X-I2CE-API-KEY": demoData.api_key
        };
        setCookie("customer_id", demoData.customer_id);
        setCookie("authentication", JSON.stringify(HEADERS), 24);
        $("#loader").hide();
        if (postfunc && typeof (postfunc) == "function") {
            postfunc(demoData);
        }
    }

    $.ajax({
        url: signupurl,
        method: "POST",
        dataType: "json",
        contentType: "json",
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
            "X-I2CE-ENTERPRISE-ID": enterprise_id,
            "X-I2CE-SIGNUP-API-KEY": signup_api_key
        },
        data: JSON.stringify(data),
        success: function (data) {
            HEADERS = {
                "Content-Type": "application/json",
                "X-I2CE-ENTERPRISE-ID": enterprise_id,
                "X-I2CE-USER-ID": data.customer_id,
                "X-I2CE-API-KEY": data.api_key
            };
            setCookie("customer_id", data.customer_id);
            setCookie("authentication", JSON.stringify(HEADERS), 24);
        },
        error: function (r, e) {
            console.warn("[Demo Mode] Signup API error:", e);
            createDemoFallback();
        }
    }).done(function (data) {
        HEADERS = {
            "Content-Type": "application/json",
            "X-I2CE-ENTERPRISE-ID": enterprise_id,
            "X-I2CE-USER-ID": data.customer_id,
            "X-I2CE-API-KEY": data.api_key
        };
        setCookie("customer_id", data.customer_id);
        setCookie("authentication", JSON.stringify(HEADERS), 24);
        $("#loader").hide();
        if (postfunc && typeof (postfunc) == "function") {
            postfunc(data);
        }
    });
    return true;
}

function login(user_name, password, callbackFunc, errorFunc, unauthorized) {
    let params = {};
    params["user_id"] = user_name;
    params["password"] = password;
    params["roles"] = "admin";
    params["attrs"] = ["user_id", "email"];
    params["enterprise_id"] = enterprise_id;
    ajaxRequestWithData(
        dave_url + "/dave/oauth",
        "POST",
        {
            "Content-Type": "application/json",
        },
        JSON.stringify(params),
        function (data) {
            let HEADERS = {
                "Content-Type": "application/json",
                "X-I2CE-ENTERPRISE-ID": enterprise_id,
                "X-I2CE-USER-ID": data.user_id,
                "X-I2CE-API-KEY": data.api_key,
            };
            setCookie("authentication", JSON.stringify(HEADERS), 24);
            setCookie("logged_in", true);
            clearCookie("customer_id");
            logged_in = true;
            if (callbackFunc && typeof (callbackFunc) == 'function') {
                callbackFunc(data);
            }
        },
        errorFunc,
        unauthorized || errorFunc
    );
}


function upload_file(data, name, callbackFunc, errorFunc, headersfromcookie) {
    headersfromcookie = headersfromcookie || getCookie('authentication')
    var formData = new FormData();
    formData.append('file', data, name);
    $.ajax({
        url: dave_url + "/upload_file?large_file=true",
        type: "POST",
        dataType: "json",
        contentType: false,
        processData: false,
        headers: {
            "X-I2CE-ENTERPRISE-ID": enterprise_id,
            "X-I2CE-USER-ID": headersfromcookie["X-I2CE-USER-ID"],
            "X-I2CE-API-KEY": headersfromcookie["X-I2CE-API-KEY"]
        },
        data: formData,
        statusCode: {
            401: signup
        }
    }).done(function (data) {
        if (callbackFunc) {
            callbackFunc(data);
        }
    }).fail(function (err) {
        if (errorFunc) {
            errorFunc(err)
        }
    });
}

function ajaxRequestSync(URL, METHOD, HEADERS, callbackFunc, errorFunc, async, timeout) {
    timeout = timeout || 600000;
    $.ajax({
        url: URL,
        method: METHOD,
        dataType: "json",
        contentType: "json",
        async: async || false,
        timeout: timeout,
        headers: {
            "Content-Type": "application/json",
            "X-I2CE-ENTERPRISE-ID": enterprise_id,
            "X-I2CE-USER-ID": HEADERS['X-I2CE-USER-ID'],
            "X-I2CE-API-KEY": HEADERS['X-I2CE-API-KEY']
        },
        statusCode: {
            401: signup,
            504: errorFunc
        }
    }).done(function (data) {
        result = data;
        if (callbackFunc) {
            callbackFunc(data);
        }
    }).fail(function (err) {
        if (errorFunc) {
            errorFunc(err)
        }
    });
}
function ajaxRequest(URL, METHOD, HEADERS, callbackFunc, errorFunc, timeout) {
    return ajaxRequestSync(URL, METHOD, HEADERS, callbackFunc, errorFunc, true, timeout);
}

function merge_arrays(array1, array2) {
    if (!array1) {
        array1 = [];
    }
    if (!array2) {
        array2 = [];
    }
    for (var i = 0; i < array2.length; i++) {
        if (array1.indexOf(array2[i]) === -1) {
            array1.push(array2[i]);
        }
    }
    return array1
}

function ajaxRequestWithData(URL, METHOD, HEADERS, DATA, callbackFunc, errorFunc, unauthorized) {
    var defaultData = "";
    if (DATA) {
        defaultData = DATA;
    }
    if (!unauthorized) {
        unauthorized = signup
    }
    $.ajax({
        url: URL,
        method: METHOD,
        dataType: "json",
        contentType: "application/json",
        headers: {
            "Content-Type": "application/json",
            "X-I2CE-ENTERPRISE-ID": enterprise_id,
            "X-I2CE-USER-ID": HEADERS['X-I2CE-USER-ID'],
            "X-I2CE-API-KEY": HEADERS['X-I2CE-API-KEY']
        },
        data: defaultData,
        statusCode: {
            401: unauthorized,
            404: unauthorized,
        }
    }).done(function (data) {
        if (callbackFunc) {
            callbackFunc(data);
        }
    }).fail(function (err) {
        if (errorFunc) {
            errorFunc(err)
        }
    });
}

function generate_random_string(string_length) {
    let random_string = '';
    let random_ascii;
    for (let i = 0; i < string_length; i++) {
        random_ascii = Math.floor((Math.random() * 25) + 97);
        random_string += String.fromCharCode(random_ascii);
    }
    return random_string;
}

function generate_random_otp(string_length) {
    string_length = string_length || 4;
    let random_string = '';
    let random_ascii;
    for (let i = 0; i < string_length; i++) {
        random_ascii = Math.floor((Math.random() * 10) + 48);
        random_string += String.fromCharCode(random_ascii);
    }
    return random_string;
}

function Trim(strValue) {
    return strValue.replace(/^\s+|\s+$/g, '');
}

// String manipulations
function toTitleCase(str) {
    if (typeof (str) != 'string') {
        return str;
    }
    return str.replace(/_/g, ' ').replace(/(?:^|\s)\w/g, function (match) {
        return match.toUpperCase();
    });
}
function toIdType(str, to_lower) {
    let r = (str || '').replace(/\+/g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/\s/g, '_');
    if (to_lower) {
        return r.toLowerCase();
    }
    return r;
}
function toFinishType(str) {
    if (typeof (str) != 'string') {
        return str;
    }
    return (str || '').replace(/\//g, '_');
}
function toUrlType(str) {
    if (typeof (str) != 'string') {
        return str;
    }
    return (str || '').replace(/\+/g, '%2B');
}
function toQueryType(str) {
    str = str || '';
    if (typeof (str) != 'string') {
        return str;
    }
    if (str.includes('+')) {
        str = '~' + str.slice(0, str.indexOf('+'));
    }
    if (str.includes(',')) {
        return $.map(str.split(','), function (v) { return v.trim() })
    }
    return str;
}
// String manipulations

function get_url_params(qd) {
    qd = qd || {};
    if (location.search) location.search.substr(1).split("&").forEach(function (item) {
        var s = item.split("="),
            k = s[0],
            v = s[1] && decodeURIComponent(s[1]); //  null-coalescing / short-circuit
        //(k in qd) ? qd[k].push(v) : qd[k] = [v]
        (qd[k] = qd[k] || []).push(v) // null-coalescing / short-circuit
    })
    qc = getCookie('url_params', {});
    for (const [k, v] of Object.entries(qc)) {
        if (qd[k] == null || qd[k] == undefined) {
            qd[k] = v;
        }
    }
    return qd;
}

function today() {
    var fullDate = new Date();
    console.log(fullDate);
    var twoDigitMonth = ("0" + (fullDate.getMonth() + 1)).slice(-2);
    var twoDigitDate = ("0" + fullDate.getDate()).slice(-2);
    return fullDate.getFullYear() + "-" + twoDigitMonth + '-' + twoDigitDate;
}

function one_week_ago(num) {
    num = num || 1;
    var fullDate = new Date();
    fullDate.setDate(fullDate.getDate() - num * 7);
    var twoDigitMonth = ("0" + (fullDate.getMonth() + 1)).slice(-2);
    var twoDigitDate = ("0" + fullDate.getDate()).slice(-2);
    return fullDate.getFullYear() + "-" + twoDigitMonth + '-' + twoDigitDate;
}

function one_month_ago(num) {
    num = num || 1;
    var fullDate = new Date();
    fullDate.setDate(fullDate.getDate() - num * 30);
    var twoDigitMonth = ("0" + (fullDate.getMonth() + 1)).slice(-2);
    var twoDigitDate = ("0" + fullDate.getDate()).slice(-2);
    return fullDate.getFullYear() + "-" + twoDigitMonth + '-' + twoDigitDate;
}

function one_year_ago(num) {
    num = num || 1;
    var fullDate = new Date();
    fullDate.setDate(fullDate.getDate() - num * 365);
    var twoDigitMonth = ("0" + (fullDate.getMonth() + 1)).slice(-2);
    var twoDigitDate = ("0" + fullDate.getDate()).slice(-2);
    return fullDate.getFullYear() + "-" + twoDigitMonth + '-' + twoDigitDate;
}

function this_quarter(quarters) {
    function dm(m) {
        let y = fullDate.getFullYear()
        while (m < 0) {
            m = m + 12;
            y = y - 1;
        }
        while (m >= 12) {
            m = m - 12;
            y = y + 1
        }
        m = 1 + (parseInt(m / 3) * 3);
        m = ("0" + m).slice(-2);
        return y + "-" + m + "-01"
    }
    quarters = quarters || 0;
    let fullDate = new Date();
    let m1 = fullDate.getMonth() - (quarters * 3);
    let m2 = m1 + 4;
    return dm(m1) + "," + dm(m2);
}

function of_month(month) {
    let fullDate = new Date();
    let y1 = fullDate.getFullYear();
    while (month < 0) {
        month = month + 12;
        y1 = y1 - 1;
    }
    while (month >= 12) {
        month = month - 12;
        y1 = y1 + 1;
    }
    if (month > fullDate.getMonth()) {
        y1 = y1 - 1;
    }
    let y2 = y1;
    let m1 = ("0" + (month + 1)).slice(-2);
    let m2 = ("0" + (month + 2)).slice(-2);
    if (month == 11) {
        y2 = y1 + 1;
        m2 = "01"
    }
    return y1 + "-" + m1 + '-01,' + y2 + "-" + m2 + '-01'
}

function do_download(image_url) {
    var link = document.createElement('a');
    link.download = `${opts['name']}.jpg`;
    link.href = data;
    link.click();
    link.remove();
}

function alphanumeric(inputtxt) {
    var letterNumber = /^[0-9a-zA-Z_-]+$/;
    if (inputtxt.match(letterNumber)) {
        return true;
    } else {
        return false;
    }
}

function validate_email(v) {
    let emailReg = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i;
    return emailReg.test(v)
}

function getDataUrl(img, canvas) {
    if (img.width <= 0 || img.height <= 0) {
        return null;
    }
    // Create canvas
    canvas = canvas || document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    // Set width and height
    canvas.width = img.width;
    canvas.height = img.height;
    // Draw the image
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg');
}


function validateNumber(evt) {
    var e = evt || window.event;
    var key = e.keyCode || e.which;

    if (!e.shiftKey && !e.altKey && !e.ctrlKey &&
        // numbers   
        key >= 48 && key <= 57 ||
        // Numeric keypad
        key >= 96 && key <= 105 ||
        // + symbol
        key == 107 || key == 43 ||
        // Backspace and Tab and Enter
        key == 8 || key == 9 || key == 13 ||
        // Home and End
        key == 35 || key == 36 ||
        // left and right arrows
        key == 37 || key == 39 ||
        // Del and Ins
        key == 46 || key == 45) {
        // input is VALID
    }
    else {
        // input is INVALID
        e.returnValue = false;
        if (e.preventDefault) e.preventDefault();
    }
}
function once(el, type, fn) {
    function handler(event) {
        el.removeEventListener(type, handler);
        fn(event);
    }
    el.addEventListener(type, handler);
}
function go_back() {
    history.back();
}

function makeSingle(inp, def) {
    if (inp == undefined || inp == null) {
        return def;
    }
    if (Array.isArray(inp)) {
        if (inp.length == 0) {
            return def
        }
        return inp[0];
    }
    return inp
}
$.fn.ForcePhoneNumbersOnly = function (disallow_plus) {
    return this.each(function () {
        let that = this;
        $(this).keydown(function (e) {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
            // home, end, period, and numpad decimal
            if (!disallow_plus) {
                if (e.shiftKey && key == 187 && that.value.length < 1) {
                    return true;
                }
                if (e.shiftKey && key != 187) {
                    return false;
                }
                if (that.value[0] == '+' && that.value.length > 13) {
                    return (
                        key == 8 ||
                        key == 9 ||
                        key == 13 ||
                        key == 46 ||
                        key == 110 ||
                        key == 190 ||
                        (key >= 35 && key <= 40) ||
                        key == 61
                    );
                }
                if (that.value[0] != '+' && that.value.length > 10) {
                    return (
                        key == 8 ||
                        key == 9 ||
                        key == 13 ||
                        key == 46 ||
                        key == 110 ||
                        key == 190 ||
                        (key >= 35 && key <= 40) ||
                        key == 61
                    );
                }
            }
            return (
                key == 8 ||
                key == 9 ||
                key == 13 ||
                key == 46 ||
                key == 110 ||
                key == 190 ||
                (key >= 35 && key <= 40) ||
                (key >= 48 && key <= 57) ||
                (key >= 96 && key <= 105) ||
                key == 61 || key == 107
            );
        });
    });
};
$.fn.setMaxLength = function (length) {
    length = length || 40
    return this.each(function () {
        let that = this;
        $(this).keydown(function (e) {
            var key = e.charCode || e.keyCode || 0;
            // allow backspace, tab, delete, enter, arrows, numbers and keypad numbers ONLY
            // home, end, period, and numpad decimal
            if (that.value.length >= length) {
                return (
                    key == 8 ||
                    key == 9 ||
                    key == 13 ||
                    key == 46 ||
                    key == 110 ||
                    key == 190 ||
                    (key >= 35 && key <= 40) ||
                    key == 61
                );
            }
            return true
        });
    });
};
