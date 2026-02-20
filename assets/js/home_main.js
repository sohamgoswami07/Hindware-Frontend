$("#roomlist").on('click', 'li', function () {
    $("#roomlist li.activetile").removeClass("activetile");
    // adding classname 'active' to current click li 
    $(this).addClass("activetile");
});