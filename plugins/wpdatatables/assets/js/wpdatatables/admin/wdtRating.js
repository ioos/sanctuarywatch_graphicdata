(function ($) {
    $(function () {
        $('.wdt-dismiss').on("click", function (event) {
            event.preventDefault();
            $.ajax({
                url: ajaxurl,
                method: "POST",
                data: {
                    'action': 'wdtTempHideRating'
                },
                dataType: "json",
                async: !0,
                success: function (e) {
                    if (e == "success") {
                        $('.wdt-rating-notice').fadeTo(100, 0, function () {
                            $('.wdt-rating-notice').slideUp(100, function () {
                                this.remove();
                            });
                        });
                    }
                }

            });
        });

        $(document).on('click', '.wdt-hide-rating', function (e) {
            e.preventDefault();
            $.ajax({
                url: ajaxurl,
                method: "POST",
                data: {
                    'action': 'wdtHideRating'
                },
                dataType: "json",
                async: !0,
                success: function (e) {
                    if (e == "success") {
                        $('.wdt-rating-notice').slideUp('fast');
                    }
                }
            });
        })

        $('.wpdt-forminator-news-notice .notice-dismiss').on('click', function (e) {
            e.preventDefault();
            $.ajax({
                url: ajaxurl,
                method: "POST",
                data: {
                    'action': 'wdt_remove_forminator_notice'
                },
                dataType: "json",
                async: !0,
                success: function (e) {
                    if (e == "success") {
                        $('.wpdt-forminator-news-notice').slideUp('fast');
                    }
                }
            });
        })

        $('.wpdt-promo-notice .wpdt-icon-times-thin.wpdt-notice-dismiss').on('click', function (e) {
            e.preventDefault();
            $.ajax({
                url: ajaxurl,
                method: "POST",
                data: {
                    'action': 'wdt_remove_promo_notice'
                },
                dataType: "json",
                async: !0,
                success: function (e) {
                    if (e == "success") {
                        $('.wpdt-promo-notice').slideUp('fast');
                    }
                }
            });
        })
        
        $('.is-dismissible.wpdt-bundles-notice .wpdt-icon-times-thin.wpdt-notice-dismiss').on('click', function (e) {
            e.preventDefault();
            $.ajax({
                url: ajaxurl,
                method: "POST",
                data: {
                    'action': 'wdt_remove_bundles_notice'
                },
                dataType: "json",
                async: !0,
                success: function (e) {
                    if (e == "success") {
                        $('.wpdt-bundles-notice').slideUp('fast');
                    }
                }
            });
        })

    });
})(jQuery);