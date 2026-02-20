// Store finder demo data
// NOTE: All store data below is sample/demo data for portfolio purposes only.
var jsonStr = [
    {
        "post_title": "DEMO BATH STUDIO - SOUTH",
        "dealer_type": null,
        "latitude": "28.52",
        "longitude": "77.21",
        "email": "demo-south@example.com",
        "contact_no": "9000000001",
        "address": "123, Main Market Road, Demo Nagar",
        "state": "DEMO STATE",
        "city": "DEMO CITY",
        "alternate_no": "",
        "has_sanitaryware": "Y",
        "has_faucets": "Y",
        "pincode": "110001",
        "is_dealer": "N",
        "is_brand": "Y"
    },
    {
        "post_title": "SAMPLE SANITARY HOUSE",
        "dealer_type": null,
        "latitude": "19.08",
        "longitude": "72.88",
        "email": "demo-west@example.com",
        "contact_no": "9000000002",
        "address": "456, Station Road, Sample Town",
        "state": "DEMO STATE",
        "city": "SAMPLE CITY",
        "alternate_no": "9000000003",
        "has_sanitaryware": "Y",
        "has_faucets": "Y",
        "pincode": "400001",
        "is_dealer": "Y",
        "is_brand": "Y"
    },
    {
        "post_title": "EXAMPLE TILES & FITTINGS",
        "dealer_type": null,
        "latitude": "13.08",
        "longitude": "80.27",
        "email": "demo-east@example.com",
        "contact_no": "9000000004",
        "address": "789, Industrial Area, Example District",
        "state": "DEMO STATE",
        "city": "EXAMPLE CITY",
        "alternate_no": "",
        "has_sanitaryware": "Y",
        "has_faucets": "Y",
        "pincode": "600001",
        "is_dealer": "N",
        "is_brand": "Y"
    },
    {
        "post_title": "TEST BATH WORLD",
        "dealer_type": null,
        "latitude": "22.57",
        "longitude": "88.36",
        "email": "demo-north@example.com",
        "contact_no": "9000000005",
        "address": "101, Park Street, Test Colony",
        "state": "DEMO STATE",
        "city": "TEST CITY",
        "alternate_no": "",
        "has_sanitaryware": "Y",
        "has_faucets": "Y",
        "pincode": "700001",
        "is_dealer": "N",
        "is_brand": "Y"
    },
    {
        "post_title": "PLACEHOLDER MARBLE & SANITARY",
        "dealer_type": null,
        "latitude": "26.85",
        "longitude": "80.95",
        "email": "demo-central@example.com",
        "contact_no": "9000000006",
        "address": "202, Ring Road, Placeholder Nagar",
        "state": "DEMO STATE",
        "city": "PLACEHOLDER CITY",
        "alternate_no": "9000000007",
        "has_sanitaryware": "Y",
        "has_faucets": "Y",
        "pincode": "226001",
        "is_dealer": "Y",
        "is_brand": "Y"
    }
];


var jsonobj = jsonStr;
function filterpincodecityData(pincode, city) {
    if (pincode != '' && (city != '' && city != 'city')) {
        var data = jsonobj.filter(function (item) {
            return (item["pincode"].toLowerCase().indexOf(pincode.toLowerCase()) != -1 && item["city"].toLowerCase().indexOf(city.toLowerCase()) != -1)
        });
    } else if (pincode != '' && city == 'city') {
        var data = jsonobj.filter(function (item) {
            return item["pincode"].toLowerCase().indexOf(pincode.toLowerCase()) != -1
        });
    } else if (pincode == '' && (city != '' && city != 'city')) {
        var data = jsonobj.filter(function (item) {
            return item["city"].toLowerCase().indexOf(city.toLowerCase()) != -1
        });
    }

    return data;
}


function getFiltercityJson() {

    var inputStr = document.getElementById("pincode").value;
    var e = document.getElementById("city");
    var cityStr = e.options[e.selectedIndex].text;

    if ((inputStr == '' || inputStr == 'Enter pincode') && (cityStr == '' || cityStr == 'city')) {
        alert("Please enter pincode ");
        document.getElementById("filter_data_div").innerHTML = "";
        document.getElementById("pincode").focus();
        return false;
    }

    var filterObjs = filterpincodecityData(inputStr, cityStr);
    var text = "";
    for (var i = 0; i < filterObjs.length; i++) {
        text += ' <div id="filter_data" class="storefilter"><div><h3>' + filterObjs[i].post_title + '</h3>';
        text += '<span>' + filterObjs[i].address + ',' + filterObjs[i].pincode + ',<br>Contact:' + filterObjs[i].contact_no + '</span><hr style="height: 1px;background: #e1c167;width: 70%;border-radius: 60px;"></div></div>';
    }
    if (filterObjs.length === 0) { document.getElementById("filter_data_div").innerHTML = '<div id="filter_data"><div><h3>No store found.</h3></div></div>'; } else
        document.getElementById("filter_data_div").innerHTML = text;

}

window.onload = function () {
    getcitys();
}

function getcitys() {
    for (var i = 0; i < jsonobj.length; i++) {
        var option = document.createElement("option");
        option.text = jsonobj[i].city;
        option.value = i;
        var daySelect = document.getElementById('city');
        daySelect.appendChild(option);
    }
}
