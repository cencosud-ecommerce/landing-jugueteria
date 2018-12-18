require("./index.css");

$(function() {
  // Counter for load more products - Start with 20 by is the default render items
  var cont = 20;
  // The first button must have the collection attribute with numeric value to handle it
  var numberCollection = parseInt($(".search-filter:first-child").attr("collection"));

  $(".toys-brand").slick({
    infinite: true,
    slidesToShow: 8,
    slidesToScroll: 8,
    autoplay: true,
    autoplaySpeed: 2000,
    centerMode: true,
    responsive: [
      {
        breakpoint: 1300,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 6,
          infinite: true
        }
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
          infinite: true
        }
      },
      {
        breakpoint: 760,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
          infinite: true
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true
        }
      }
    ]
  });

  // Slider
  /*const $slider = $('.swiper-wrapper');

  if ($slider.is(':empty')) {
  	$slider.hide().parent().addClass('empty');
  } else if ($slider.children().length > 1) {
    $slider.bxSlider({
      prevText: '',
      nextText: '',
      auto: true
    });
  }*/

  var loader = $(elem.shelfLoader);
  loader.fadeIn(250);

  getCollectionByNumber(numberCollection, 20);

  $(document).on("click", elem.searchListFiltersSlideControls, function() {
    let t = $(this);
    let sliderWrapper = $(elem.searchListFilters);
    let slideScrollLeft = sliderWrapper.scrollLeft();
    let delta = 130;
    let newScrollLeft = 0;

    if (t.hasClass("prev")) {
      newScrollLeft = slideScrollLeft - delta;
    }
    if (t.hasClass("next")) {
      newScrollLeft = slideScrollLeft + delta;
    }

    sliderWrapper.animate({
      scrollLeft: newScrollLeft
    });
  });

  if (Aurora.isMobile()) {
    $(".search-list-filters").slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      centerMode: true
    });
  }

  

  $("#banner-with-popup-instructions .adaptive-image").on("click", function(e) {
    $("#instructions-to-buy").show();
  });

  $("#instructions-to-buy button").on("click", function(e) {
    $("#instructions-to-buy").hide();
  });

  // Handle events for Brands
  $(".container-brand-toys .slick-track").on("click", function(e) {
    var $element = $(e.target).closest("li");
    cont = 20;
    numberCollection = parseInt($element.attr("collection"));
    loader.fadeIn(250);
    $(".product-shelf").empty();
    getCollectionByNumber(numberCollection, 20);
  });

  // Handle events for categories
  $(".shelf-header .search-list-filters").on("click", function(e) {
    var $element = $(e.target).closest("button");
    cont = 20;
    numberCollection = parseInt($element.attr("collection"));
    $element
      .addClass("active")
      .siblings()
      .removeClass("active");
    loader.fadeIn(250);
    $(".product-shelf ul").empty();
    getCollectionByNumber(numberCollection, 20);
  });

  let $fValue;
  let productIdFiltered;
  function getCollectionByNumber(number, quantity) {
    //$(".product-shelf .product-prices__wrapper span.product-prices__value").hide();
    Aurora.getProductShelf(`fq=H:${number}`, 1, quantity, 20)
      .done(res => {
        if ( res != "" && !$.isEmptyObject(res) && typeof res.activeElement == "undefined") {
          
            // Find necessary html (product list)
            let products = $(res).find("> ul > li");
            //products.find(".product-prices__wrapper").css("opacity",0)
            
            // Append it into the ul tag
            $(elem.productShelf).find("ul:first").append(products);
            
            //$(".product-shelf").html(res);
            //$(".product-shelf .product-prices__price--former-price").hide();

            let defProductId = $(res).find("ul li .product-item");

            // let $priceCont = $(".product-shelf .product-prices__wrapper");

            // let $valuePrice = $priceCont.find(".product-prices__value").text().split("$");

            for(let i=0;i<defProductId.length;i++){
                productIdFiltered = defProductId.get( i ).getAttribute("data-id");

                getUnitMultiplier(productIdFiltered).done(res => {
                    let filterID = res[0].productId;
                    let bestPrice = res[0].items[0].sellers[0].commertialOffer.Price;
                    let regularPrice = res[0].items[0].sellers[0].commertialOffer.ListPrice;
                    let calcPrice = Math.trunc(bestPrice * res[0].items[0].unitMultiplier);
                    let calcRegPrice = Math.trunc(regularPrice * res[0].items[0].unitMultiplier);
                    let last3Digits;
                    let second3Digits;
                    let firstDigits;
                    let $best = $(`.product-item--${filterID}`).find("span.product-prices__value--best-price");
                    let $regular = $(`.product-item--${filterID}`).find(".product-prices__price--former-price span.product-prices__value")

                    if(calcRegPrice < 1000000){
                        last3Digits = String(calcPrice).slice(-3);
                        firstDigits = String(calcPrice).split(last3Digits)[0];

                        last3DigitsReg = String(calcRegPrice).slice(-3);
                        firstDigitsReg = String(calcRegPrice).split(last3DigitsReg)[0];

                        $best.text("$ " + firstDigits + "." + last3Digits);
                        $regular.text("$ " + firstDigitsReg + "." + last3DigitsReg);
                    }

                    products.find(".product-prices__wrapper").css("opacity",1);
                  
                });
            }

          // Add flags
          var flagDiscount = $(".discount-percent");

          for (var i = 0; i < flagDiscount.length; i++) {
            var discountPercent = parseFloat(flagDiscount[i].innerText);

            if (discountPercent >= 10) {
              flagDiscount[i].innerText = discountPercent + "%";
              flagDiscount[i].style.display = "flex";
            }
          }
          loader.fadeOut(250);
        }
      })
      .fail(er => console.log("error"));
  }

  function getUnitMultiplier(productId, xhr){
    if (!xhr){
        xhr = $.Deferred();
    }

    $.get("/api/catalog_system/pub/products/search?fq=productId:" + productId)
      .done(res => xhr.resolve(res))
      .fail(er => console.error(er))

      let promise = xhr.promise();

        promise.abort = function () {
            request.abort();
        }

        return promise;
  }

  
  $(window).scroll(function() {
    var reqAvailable = true;
    if(reqAvailable){
      if (( $(window).scrollTop() + $(window).height() > $(document).height() - 500 ) && $(".main .product-item").length >= 15) {
        reqAvailable = false;
        cont += 5;
        loader.fadeIn(250);
        getCollectionByNumber(numberCollection, cont);
      }else{
        reqAvailable = true;
      }
    }
  });
});
