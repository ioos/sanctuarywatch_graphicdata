(function ($) {

    $(function () {

        /**
         * Apply colorpicker
         */
        $(".color-picker").each(function () {
            wdtApplyColorPicker(this);
        });

        jQuery(document).on('focus', '.wdt-add-picker', function (e) {
            wdtApplyColorPicker(this)
        })
    });

})(jQuery);

/**
 * Replace input with Colorpicker layout
 */
var wdtInputToColorpicker = function (selecter) {
    var colorPickerHtml = jQuery('#wdt-color-picker-template').html(),
        val = jQuery(selecter).val(),
        classes = jQuery(selecter).prop('class'),
        $newEl = jQuery(colorPickerHtml);
    jQuery(selecter).replaceWith($newEl);
    $newEl.find('input').val(val).addClass(classes);
    jQuery('.wdt-conditional-formatting-rules-container .wdt-add-picker').each(function (i, obj) {
        jQuery(this).attr('id', 'condition' + i)
    });
    wdtApplyColorPicker($newEl.find('.wdt-add-picker'));
};

/**
 * Apply Colorpicker
 */
var wdtApplyColorPicker = function (selecter) {
    jQuery(selecter).addClass('pickr');
    jQuery('.pcr-app').remove();
    var inputElement = '#' + jQuery(selecter)[0].id,
        defoult = jQuery(inputElement).val() == "" ? '#FFFFFF' : jQuery(inputElement).val(),
        isChart = !jQuery(selecter).hasClass('series-color'),
        isColumnColor = inputElement === '#wdt-column-color';
    ;
    const pickr = new Pickr({
        el: inputElement,
        useAsButton: true,
        default: defoult,
        theme: 'classic',
        autoReposition: true,
        position: 'bottom-end',
        swatches: [
            'rgba(244, 67, 54, 1)',
            'rgba(233, 30, 99, 1)',
            'rgba(156, 39, 176, 1)',
            'rgba(103, 58, 183, 1)',
            'rgba(63, 81, 181, 1)',
            'rgba(33, 150, 243, 1)',
            'rgba(3, 169, 244, 1)',
            'rgba(0, 188, 212, 1)',
            'rgba(0, 150, 136, 1)',
            'rgba(76, 175, 80, 1)',
            'rgba(139, 195, 74, 1)',
            'rgba(205, 220, 57, 1)',
            'rgba(255, 235, 59, 1)',
            'rgba(255, 193, 7, 1)'
        ],

        components: {
            preview: true,
            opacity: isChart,
            hue: true,

            interaction: {
                hex: isChart,
                rgba: isChart,
                hsla: isChart,
                hsva: false,
                cmyk: false,
                clear: true,
                input: true,
                save: true
            }
        }
    }).on('init', pickr => {
        if (pickr.isOpen()) {
            pickr.hide();
        } else {
            var colorRepresentation = pickr.getColorRepresentation();
            colorRepresentationSwitch(colorRepresentation, pickr, inputElement)
        }
        if (isColumnColor) {
            jQuery('.wpdt-column-settings-card').css('min-height', '700px');
            jQuery(".column-settings-panel").animate({
                scrollTop: jQuery(
                    '.column-settings-panel').get(0).scrollHeight
            }, 1000);
        }
    }).on('save', color => {
        if (color != null) {
            var colorRepresentation = pickr.getColorRepresentation()
            colorSwitch(colorRepresentation, color, inputElement)
        } else {
            jQuery(inputElement).val('');
            jQuery(inputElement).parent().find('.wpcolorpicker-icon i').css("background-color", "none");
        }
        pickr.hide();
        if (isColumnColor) jQuery('.wpdt-column-settings-card').css('min-height','auto');

    }).on('change', color => {
        var colorRepresentation = pickr.getColorRepresentation()
        colorSwitch(colorRepresentation, color, inputElement)
        jQuery(inputElement).change()
        if (isColumnColor) {
            jQuery('.wpdt-column-settings-card').css('min-height', '700px');
            jQuery(".column-settings-panel").animate({
                scrollTop: jQuery(
                    '.column-settings-panel').get(0).scrollHeight
            }, 1000);
        }
    }).on('clear', color => {
        jQuery(inputElement).val('');
        jQuery(inputElement).change();
        jQuery(inputElement).closest('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", 'none');
    }).on('hide', color => {
        if (isColumnColor) jQuery('.wpdt-column-settings-card').css('min-height','auto');
    })
};

/**
 * Replace colorpicker with input
 */
var wdtColorPickerToInput = function (selecter) {
    var val = jQuery(selecter).val();
    var classes = jQuery(selecter).prop('class');
    var $newEl = jQuery('<input />');
    jQuery(selecter).closest('div.cp-container').replaceWith($newEl);
    $newEl.val(val).addClass(classes);
};


var colorRepresentationSwitch = function (colorRepresentation, element, inputElement) {
    switch (colorRepresentation) {
        case 'HEXA':
            jQuery(inputElement).closest('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", element.getColor().toHEXA().toString(0));
            break;
        case 'RGBA':
            jQuery(inputElement).closest('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", element.getColor().toRGBA().toString(0));
            break;
        case 'HSLA':
            jQuery(inputElement).closest('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", element.getColor().toHSLA().toString(0));
            break;
        default:
            jQuery(inputElement).closest('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", element.getColor().toRGBA().toString(0));
    }
}
var colorSwitch = function (colorRepresentation, element, inputElement) {
    switch (colorRepresentation) {
        case 'HEXA':
            jQuery(inputElement).val(element.toHEXA().toString(0));
            jQuery(inputElement).closest('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", element.toHEXA().toString(0));
            break;
        case 'RGBA':
            jQuery(inputElement).val(element.toRGBA().toString(0));
            jQuery(inputElement).closest('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", element.toRGBA().toString(0));
            break;
        case 'HSLA':
            jQuery(inputElement).val(element.toHSLA().toString(0));
            jQuery(inputElement).closest('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", element.toHSLA().toString(0));
            break;
        default:
            jQuery(inputElement).val(element.toRGBA().toString(0));
            jQuery(inputElement).closest('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", element.toRGBA().toString(0));
    }
}
