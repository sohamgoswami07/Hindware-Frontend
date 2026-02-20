$('.slider-nav').slick({
    slidesToShow: 4,
    slidesToScroll: 1,
    vertical: true,
    infinite: true,

    dots: false,
    focusOnSelect: true,
    verticalSwiping: true,
    responsive: [{
        breakpoint: 992,
        settings: {
            vertical: true,
        }
    },
    {
        breakpoint: 768,
        settings: {
            vertical: true,
        }
    },
    {
        breakpoint: 580,
        settings: {
            vertical: true,
            slidesToShow: 3,
        }
    },
    {
        breakpoint: 380,
        settings: {
            vertical: true,
            slidesToShow: 2,
        }
    }
    ]
});

let options = [{
    "category": "SHOWER",
    "name": "shower 1",
    "img": "assets/img/shower1.png",
    "id": "shower-option"

},
{
    "category": "SHOWER",
    "name": "shower 2",
    "img": "assets/img/shower2.png",
    "id": "shower-option"

},
{
    "category": "SHOWER",
    "name": "shower 3",
    "img": "assets/img/shower3.png",
    "id": "shower-option"

},
{
    "category": "SHOWER",
    "name": "shower 4",
    "img": "assets/img/shower4.png",
    "id": "shower-option"

},
    // {
    //   "category": "shower",
    //   "name": "shower 5",
    //   "img": "assets/img/Icons/commode.svg",
    //   "id": "shower-option"

    // },
    // {
    //   "category": "shower",
    //   "name": "shower 5",
    //   "img": "assets/img/Icons/commode.svg",
    //   "id": "shower-option"

    // },{
    //   "category": "shower",
    //   "name": "shower 5",
    //   "img": "assets/img/Icons/commode.svg",
    //   "id": "shower-option"

    // },
]

function catclick(data) {

    var optionSelected = data;
    var item = '';

    for (var i = 0; i < options.length; i++) {

        if (optionSelected == options[i].category) {

            item += `<div class="thumbnail-image " >
                        <div class="thumbImg">
                            <img src="${options[i].img}" alt="slider-img">
                        </div>
                        <span>${options[i].name} </span>
                    </div>`

            document.getElementById('show').innerHTML = item;
            // var element = document.getElementById("page3");
            //  element.classList.add("navchild");

            //  var element = document.getElementById("show");
            //  element.classList.add("hidea");
            var text = `<label onclick="backa()" style="
                margin-left: -30px;
                "><i class="fa fa-chevron-left" aria-hidden="true" style="
                font-size: 17px;
                margin-right: 4px;
                padding: 6px;
                "></i>
                ${options[i].category}</label>`
            document.getElementById('cattext').innerHTML = text;
            // console.log(text);
            //  document.getElementById('show2').innerHTML =` <label for="" id="show3" onclick="backa()" >Main Menu</label>
            //  ` ;
        }
    }
}

function backa() {

    // var element = document.getElementById("page3");
    // element.classList.add("hidea");

    // var element = document.getElementById("page3");
    // element.classList.remove("navchild");

    // document.getElementById('page3').innerHTML =`  ` ;
    // var element = document.getElementById("page3");
    // element.classList.remove("hidea");

    // var element = document.getElementById("show");
    // element.classList.remove("hidea");

    var main = ` 
  <div class="thumbnail-image " id="SHOWER" onclick="catclick(this.id)">

  <div class="thumbImg">
      <img src="assets/img/Icons/shower.svg" alt="slider-img">
  </div>
  <span>SHOWER</span>
</div>

<div class="thumbnail-image" id="SHOWER" onclick="catclick(this.id)">
  <div class="thumbImg">
      <img src="assets/img/Icons/commode.svg" alt="slider-img">
  </div>
  <span>COMMODE</span>
</div>
<div class="thumbnail-image" id="SHOWER" onclick="catclick(this.id)">
  <div class="thumbImg">
      <img src="assets/img/Icons/water-faucet.svg" alt="slider-img">
  </div>
  <span>WATER FAUCET</span>
</div>
<div class="thumbnail-image" id="SHOWER" onclick="catclick(this.id)">
  <div class="thumbImg">
      <img src="assets/img/Icons/wash-basin.svg" alt="slider-img">
  </div>
  <span>WASH BASIN</span>
</div>
<div class="thumbnail-image" id="SHOWER" onclick="catclick(this.id)">
  <div class="thumbImg">
      <img src="assets/img/Icons/water-faucet.svg" alt="slider-img">
  </div>
  <span>WATER FAUCET 2</span>
</div>
  `
    //document.getElementById('show').innerHTML = main;
    // console.log(main); 
    //document.getElementById('cattext').innerHTML = ` <label for=""  >CATEGORIES</label>`;
}

function slide(direction) {
    var container = document.getElementById('show');
    scrollCompleted = 0;
    var slideVar = setInterval(function () {
        if (direction == 'left') {
            container.scrollBy(0, 10);
        } else {
            container.scrollLeft += 10;
        }
        scrollCompleted += 10;
        if (scrollCompleted >= 100) {
            window.clearInterval(slideVar);
        }
    }, 50);
}



var elem = document.documentElement;

function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
        var text2 = `
    <button onclick="closeFullscreen();">
     <div class="rbtns ">
         
         <img src="assets/img/Icons/Minimize.svg"  alt="">
     </div>
   
   </button> 
   <button>
                <div class="rbtns" onclick="window.p.startAutoRotate()">
                    <img src="assets/img/Icons/360-degrees.svg" alt=""> 
                </div>
            </button>
            <button>
                <div class="rbtns" onclick="window.p.resetCamera()">
                    <img src="assets/img/Icons/Reset.svg" alt=""> 
                </div>
            </button>
            <button   onclick="myFunction()">
            <div class="rbtns"  >
                <img src="assets/img/Icons/Share.svg" alt=""  >
            </div>
        </button>
     
     `;
        document.getElementById('resize').innerHTML = text2;
        var element = document.getElementById("leftcarousel");
        element.classList.add("nav-open");
    } else if (elem.webkitRequestFullscreen) {
        /* Safari */
        elem.webkitRequestFullscreen();
        var text2 = `
    <button onclick="closeFullscreen();">
     <div class="rbtns ">
         
         <img src="assets/img/Icons/Minimize.svg"  alt="">
     </div>
   
   </button> 
   <button>
                <div class="rbtns" onclick="window.p.startAutoRotate()">
                    <img src="assets/img/Icons/360-degrees.svg" alt=""> 
                </div>
            </button>
            <button>
                <div class="rbtns" onclick="window.p.resetCamera()">
                    <img src="assets/img/Icons/Reset.svg" alt=""> 
                </div>
            </button>
            <button   onclick="myFunction()">
            <div class="rbtns"  >
                <img src="assets/img/Icons/Share.svg" alt=""  >
            </div>
        </button>
     
     `;
        document.getElementById('resize').innerHTML = text2;
        var element = document.getElementById("leftcarousel");
        element.classList.add("nav-open");
    } else if (elem.msRequestFullscreen) {
        /* IE11 */
        elem.msRequestFullscreen();
        var text2 = `
    <button onclick="closeFullscreen();">
     <div class="rbtns ">
         
         <img src="assets/img/Icons/Minimize.svg"  alt="">
     </div>
   
   </button> 
   <button>
                <div class="rbtns" onclick="window.p.startAutoRotate()">
                    <img src="assets/img/Icons/360-degrees.svg" alt=""> 
                </div>
            </button>
            <button>
                <div class="rbtns" onclick="window.p.resetCamera()">
                    <img src="assets/img/Icons/Reset.svg" alt=""> 
                </div>
            </button>
            <button   onclick="myFunction()">
            <div class="rbtns"  >
                <img src="assets/img/Icons/Share.svg" alt=""  >
            </div>
        </button>
           
     
     `;
        document.getElementById('resize').innerHTML = text2;

        var element = document.getElementById("leftcarousel");
        element.classList.add("nav-open");
    }
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
        var text2 = `
    <button onclick="openFullscreen();">
                <div class="rbtns  ">
                    <img src="assets/img/Icons/Maximize.svg" alt="">

                </div>

            </button> 
            <button>
            <div class="rbtns" onclick="window.p.startAutoRotate()">
                <img src="assets/img/Icons/360-degrees.svg" alt=""> 
            </div>
        </button>
        <button>
            <div class="rbtns" onclick="window.p.resetCamera()">
                <img src="assets/img/Icons/Reset.svg" alt=""> 
            </div>
        </button>
   <button   onclick="myFunction()">
                <div class="rbtns"  >
                    <img src="assets/img/Icons/Share.svg" alt=""  >
                </div>
            </button>
     
     `;
        document.getElementById('resize').innerHTML = text2;
        var element = document.getElementById("leftcarousel");
        element.classList.remove("nav-open");
    } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
        var text2 = `
    <button onclick="openFullscreen();">
                <div class="rbtns  ">
                    <img src="assets/img/Icons/Maximize.svg" alt="">

                </div>

            </button>
            <button>
            <div class="rbtns" onclick="window.p.startAutoRotate()">
                <img src="assets/img/Icons/360-degrees.svg" alt=""> 
            </div>
        </button>
        <button>
            <div class="rbtns" onclick="window.p.resetCamera()">
                <img src="assets/img/Icons/Reset.svg" alt=""> 
            </div>
        </button>
   <button   onclick="myFunction()">
                <div class="rbtns"  >
                    <img src="assets/img/Icons/Share.svg" alt=""  >
                </div>
            </button>
     
     `;
        document.getElementById('resize').innerHTML = text2;
        var element = document.getElementById("leftcarousel");
        element.classList.remove("nav-open");
    } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
        var text2 = `
    <button onclick="openFullscreen();">
                <div class="rbtns  ">
                    <img src="assets/img/Icons/Maximize.svg" alt="">

                </div>

            </button>
            <button>
            <div class="rbtns" onclick="window.p.startAutoRotate()">
                <img src="assets/img/Icons/360-degrees.svg" alt=""> 
            </div>
        </button>
        <button>
            <div class="rbtns" onclick="window.p.resetCamera()">
                <img src="assets/img/Icons/Reset.svg" alt=""> 
            </div>
        </button>
   <button   onclick="myFunction()">
                <div class="rbtns"  >
                    <img src="assets/img/Icons/Share.svg" alt=""  >
                </div>
            </button>
     
     `;
        document.getElementById('resize').innerHTML = text2;
        var element = document.getElementById("leftcarousel");
        element.classList.remove("nav-open");
    }
}


$(function () {

    $('#nav-toggle').on('click', function () {
        $('#leftcarousel').toggleClass('nav-open');
    });

});