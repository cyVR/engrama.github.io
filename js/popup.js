window.FRPopup = (function (window, $) {
    'use strict';
    var self;


    function FRPopup(config) {
        self = this;
        self.config = $.extend(self.defaults, config);
        self.popup = $.magnificPopup.instance;

        self.init();
    }


    FRPopup.prototype = {

        defaults: {
            selector: '.fr-popup-anchor'
        },


        init: function () {
            // Clear previous events if any
            if (self.$popupEls) {
                self.$popupEls.off('click', self._showPopup);
            }
            self.$popupEls = $(self.config.selector);
            self._attachPopup();
        },


        destroy: function () {
            self.$popupEls.off('click', self._showPopup);
            self.popup.close();
        },


        _attachPopup: function () {
            self.$popupEls.on('click', self._showPopup);
        },


        _recalculateSwiperSlideshow: function (el) {
            var slideshows = el.find('.swiper-container');

            if (el.get(0).classList.contains('swiper-container')) {
                slideshows = slideshows.addBack(el);
            }

            slideshows.each(function() {
                var swiper = window.swiperSlideshows && window.swiperSlideshows[this.id];
                if (swiper) {
                    swiper.resizeFix();
                }
            });
        },


        _showPopup: function (e) {
            e.preventDefault();

            var el = $(this),
                href = el.attr('href'),
                isDisplayingImage = false,
                isGallery = false,
                target,
                items;

            self.showThumbs = false;

            // if target is gallery widget then show images popup
            if (e.currentTarget.classList.contains('fr-popup-gallery')) {
                isGallery = true;
                items = [];

                if (e.currentTarget.hasAttribute('data-gallery-show-thumbs')) {
                    self.showThumbs = true;
                }

                try {
                    items = JSON.parse(e.currentTarget.dataset.galleryImages);
                    items = items.map(function (item) {
                        return {
                            type: 'image',
                            src: item.src,
                            title: item.title
                        };
                    });
                }
                catch (e) {
                    return;
                }

                $(e.currentTarget).find('.fr-popup-gallery-images-container img').each(function () {
                    items.push({
                        type: 'image',
                        src: this.src, // data attr because can be bg img?
                        title: this.title
                    });
                });
            }

            else if (href) {
                target = $(href);
                if (!target) { return; }

                items = {type: 'inline', src: target};

                // if target is image widget then show image popup
                if (target.hasClass('fr-img')) {
                    var img = target.find('img').first();

                    if (img) {
                        isDisplayingImage = true;
                        items = {type: 'image', src: img.attr('src')};
                    }
                }

                // if target widget is container and has no children find background image and show it in popup
                else if (target.hasClass('fr-container')) {
                    var childWidgets = target.find('.fr-widget');
                    if (!childWidgets.length) {
                        var backgroundImage = target.css('background-image').match(/url\(['"]?([^'"]+)['"]?\)/);

                        if (backgroundImage) {
                            isDisplayingImage = true;
                            items = {type: 'image', src: backgroundImage[1]};
                        }
                    }
                }
            }

            if (!items || isGallery && !items.length) { return; }

            self.popup.open({
                items: items,
                removalDelay: 300,
                mainClass: self.showThumbs ? 'mfp-gallery-with-thumbs' : '',
                callbacks: {
                    beforeOpen: self._attachThumbnails,
                    open: function () {
                        if (!isDisplayingImage && !isGallery) {
                            target.show();
                        }

                        if (target) {
                            // Recalculate Swiper slideshows when open in popup
                            self._recalculateSwiperSlideshow(target);
                        }
                    },
                    markupParse: function(template, values, item) {
                        self._setActiveThumb(item.index);
                    },
                    beforeClose: self._detachThumbnails,
                    afterClose: function () {
                        if (target) {
                            target.removeClass('mfp-hide').css('display', '');
                            // Recalculate Swiper slideshows when returned to DOM
                            self._recalculateSwiperSlideshow(target);
                        }
                    }
                },
                gallery: {
                    enabled: isGallery
                }
            });
        },


        _attachThumbnails: function() {
            if (!self.showThumbs) {
                return;
            }

            var mp = $.magnificPopup.instance;
            var html = '';

            html += '<div class="mfp-thumbs-wrap"> <ul class="mfp-thumbs mfp-prevent-close" data-thumbs-count="' + mp.items.length + '"">';

            mp.items.forEach(function (item, index) {
                html += '<li onclick="javascript:$.magnificPopup.instance.goTo(' + index + ');return false;"';
                html += ' style="background-image: url(' + item.src + ')" class="mfp-prevent-close';
                if (item.index === mp.index) {
                    html += ' active';
                }
                html += '" data-index="' + index + '"> </li>';
            });
            html += '</ul> </div>';

            mp.pager = $(html);
            mp.container.append(mp.pager);
        },


        _setActiveThumb: function (index) {
            if (!self.showThumbs) {
                return;
            }

            var mp = $.magnificPopup.instance;
            mp.pager.find('li').removeClass('active');
            mp.pager.find('[data-index="' + index + '"]').addClass('active');
        },


        _detachThumbnails: function () {
            if (!self.showThumbs) {
                return;
            }

            var mp = $.magnificPopup.instance;
            if (mp.pager) {
                mp.pager.remove();
            }
        }
    };

    return FRPopup;

})(window, $);
