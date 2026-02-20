//Get Main product categories
const getProductCategories = async (categoryId) => {
    try {
        const productCategories = await fetch("assets/json/product_categorys.json"); 
        let categories = await productCategories.json(); 
        if(categoryId){
            const singleCategory = categories.find((category)=>{  
                if ( categoryId==category.category_id ) {
                    post_interaction({category: category.category_name, category_id: category.category_id});
                    return true
                }
                return false
            }); 
            setProducts(singleCategory) 
        }else{
            setProductCategories(categories) 
        }
        if ( window.ui_loaded && typeof ( window.ui_loaded ) == 'function' ) {
            window.ui_loaded();
        }
    } catch (error) {
        console.log("Error : ", error);
    }
}

//Set category products
const setProducts = (category)=>{
    const products = category.products;
    const categoryName = category.category_name.toUpperCase();
    let singleProduct = "";
    $("#show").html(""); 
    $(".categoriesBtn").hide();  
    $(".productsBtn").show().html(`<i class="fa fa-chevron-left mr-10" aria-hidden="true"></i> ${categoryName}`).prop('title', categoryName);
    toTopCategories()
    window.p.focusOnMesh(category.category_id, sprites[category.category_id].position, sprites[category.category_id].target || sprites[category.category_id].surface_points);
    if(products){
        products.map((product)=>{
            if ( ( !product.available_in ) || product.available_in.indexOf(room_id) >= 0 ) { 
                singleProduct = $(`
                <a href="javascript:void(0)" class="product singleProduct gatrack" data-product_id="${product.product_id}" data-mesh_id="${product.mesh_id}" data-category_id="${category.category_id}" data-ga="${category.category_name}--${product.product_name}">
                    <div class="thumbnail-image thumbnail-image11 ${(product.product_price != 'none' || product.product_price != 'none') ? "thumbnail-image12" : "noibtn"}">
                        <div class="ibtn" style="${(product.product_price != 'none' || product.product_price != 'none') ? "" : "display:none;"}">
                            <s  data-toggle="modal" data-target="#proddesc"  data-price="${product.product_price}" data-whatever="${product.product_name}" data-sku="${product.product_sku}" data-ytlink="${product.product_yt}" data-amzlink="${product.product_amazon}" data-prodimg="${product.application_image}">
                                <img src="assets/img/newui/Group.svg" alt="slider-img">
                            </s>
                        </div>
                        <div class="thumbImg">
                            <img src="${product.application_image}" alt="slider-img">
                            
                        </div>
                        <span class="hovertohide">${product.product_name}</span>
                        <span class="hovertoshow" style="${(product.product_price != 'none' || product.product_price != 'none') ? "" : "display:none;"}">MRP: ₹ ${product.product_price}</span>
                        <span class="hovertoshow" style="${(product.product_sku !== undefined && product.product_price == 'none' && (product.product_sku != 'none' || product.product_price != 'none')) ? "" : "display:none;"}">SKU : ${product.product_sku}</span>
                    </div>
                </a>`);
                singleProduct.data('product', product);
                singleProduct.data('category', category);
                $("#show").append(singleProduct); 
            }
        });
    }
   

    $(".singleProduct").on("click", function(){
        const categoryId = $(this).data("category_id");
        const mesh_id = $(this).data("mesh_id");
        const category = $( this ).data('category');
        const product = $( this ).data('product');
        window.p.focusOnMesh(category.category_id, sprites[category.category_id].position, sprites[category.category_id].target || sprites[category.category_id].surface_points);
        p.switchMeshes(categoryId,categoryId+"/"+mesh_id, $(this).data('product'))
        post_interaction(product);
        $( "#share2" ).addClass('share-show');
        console.log(`${categoryId} ${mesh_id}`)
    });
    // Note to Aryan (for adding product to wishlist, here is how to do it)
    $( ".wishlist" ).on("click", function() {
        add_product_wishlist($( this ).parents(".singleProduct").data('product'));
    });
}


$('#proddesc').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var recipient = button.data('price')
    var prodimg = button.data('prodimg')
    var prodname = button.data('whatever')
    var sku = button.data('sku')

    var amzlink = button.data('amzlink') 
    var ytlink = button.data('ytlink') 

     // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    // modal.find('.itemname2').text(recipient + '- Video')
    // modal.find('.itemname').text(recipient)
    document.getElementById("prodpic").src = prodimg;
    // document.getElementById("prodpic2").src = prodimg;
    if (ytlink.startsWith('http') ) {
        document.getElementById("ytbtndiv").style.display = "";;

        document.getElementById("ytvid1").href = ytlink;
        document.getElementById("ytbtn").href = ytlink;

        $("#ytvid1").children().text('Watch Product Video')
    } else {
        document.getElementById("ytbtndiv").style.display = "none";;
        
        document.getElementById("ytvid1").href = "#";
        document.getElementById("ytbtn").href = "#";

        $("#ytvid1").children().text('Video Coming Soon..');
        $("#ytvid1").prop('target', '_self');
        $("#ytbtn").prop('target', '_self');
    }
    if (amzlink.startsWith('http') ) {
        document.getElementById("amzbtndiv").style.display = "";;

        document.getElementById("amzlink").href = amzlink;
        document.getElementById("amzbtn").href = amzlink;
        
        $("#amzlink").children().text('Buy on Amazon')

    } else {
        document.getElementById("amzbtndiv").style.display = "none";;

        $("#amzlink").children().text('Coming Soon')
        document.getElementById("amzlink").href = "#";
        document.getElementById("amzbtn").href = "#";

        $("#amzlink").prop('target', '_self');
        $("#amzbtn").prop('target', '_self');

    }

    // document.getElementById("ytvid1").href = ytlink;

    
    modal.find('.prodname').text(prodname)
    modal.find('.skuid').text('SKU:'+sku)
   
    modal.find('.amazonlink').text('MRP:₹'+recipient)
    // modal.find('.ytlink').text(ytlink)


    
  })


//Set Main product categories
const setProductCategories = (categories)=>{
    let singleCategory = "";
    $("#show").html("");
    $(".categoriesBtn").show();  
    $(".productsBtn").hide();
    toTopCategories()
    if(categories){
        categories.map((category)=>{
            if ( ( !category.available_in ) || category.available_in.indexOf(room_id) >= 0 ) { 
                singleCategory = $(`
            <a href="javascript:void(0)" class="mainCategory" data-category_id="${category.category_id}">
                <div class="thumbnail-image">
                    <div class="thumbImg">
                        <img src="${category.application_image}" alt="slider-img">
                    </div>
                    <span>${category.category_name.toUpperCase()}</span>
                </div>
            </a>`);
                singleCategory.data('category', category);
                $("#show").append(singleCategory);
            }
        }); 
    }

    //click  to get category products
    $(".mainCategory").on("click", function(){
        const categoryId = $(this).data("category_id");
        getProductCategories(categoryId)
    })  

    //Go back to categories 
    $(".productsBtn").on("click", function(){
        getProductCategories();
    }) 
}

//Scroll to(show div) top
const toTopCategories = ()=>{
    $('html, body').animate({ scrollTop: $("#show").offset().top }, 1);
}
  
$(()=>{ 
	getCookie('authentication') || signup(); 
    //call main categories
    getProductCategories();
    post_interaction();
})

$( window ).on('load', function() {
    /mobile/i.test(navigator.userAgent) && !location.hash && setTimeout(function() {
        console.log("Scrolling now");
        window.scrollTo(0, 1);
    }, 1000);
});




 

      











