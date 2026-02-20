
const sections = document.querySelectorAll(".room-container[id]");


window.addEventListener("scroll", navHighlighter);

function navHighlighter() {
  
 
  let scrollY = window.pageYOffset;
  
  sections.forEach(current => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 50;
    sectionId = current.getAttribute("id");
    
   
    if (
      scrollY > sectionTop &&
      scrollY <= sectionTop + sectionHeight
    ){
      document.querySelector(".navigation a[href*=" + sectionId + "]").classList.add("active");
    } else {
      document.querySelector(".navigation a[href*=" + sectionId + "]").classList.remove("active");
    }
  });
}
$(document).ready(function(){
	$('a[href^="#"]').on('click',function (e) {
	    e.preventDefault();
	    var target = this.hash;
	    var $target = $(target);
	    $('html, body').stop().animate({
	        'scrollTop': $target.offset().top
	    }, 900, 'swing', function () {
	        // window.location.hash = target;
	    });
	});
});

function onScroll(event) {
    var scrollPos = $(document).scrollTop();
    $('.navbar-nav li a').each(function () {
        var currLink = $(this);
        var refElement = $(currLink.attr("href"));
        if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
            $('.navbar2-nav li a').removeClass("active");
            currLink.addClass("active");
        }
        else {
            currLink.removeClass("active");
        }
    });
}

function fixDiv() {
    var $div = $("#stickynav");
    if ($(window).scrollTop() > $div.data("top")-40) { 
        $('#stickynav').css({'position': 'fixed', 'top': '50px', 'width': '100%'}); 
    }
    else {
        $('#stickynav').css({'position': 'static', 'top': 'auto', 'width': '100%'});
    }
}

$("#stickynav").data("top", $("#stickynav").offset().top); // set original position on load
$(window).scroll(fixDiv);