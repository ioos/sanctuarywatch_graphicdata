(function ($) {
    $(function () {

        if (navigator.userAgent.match(/Tablet|Mobile|Mobi/i))
        {
            $('.wpdtSimpleTable').each(function (i){
                var tempID ='#' + $(this)[0].id,
                    tempResp =$(this).data('responsive'),
                    parentWidth = $(tempID).parent().width();
                if (tempResp && parentWidth < 1024){
                    $(tempID).basictable({
                        containerBreakpoint:1024,
                        tableWrap: true,
                        showEmptyCells: true,
                        header: !!$(tempID + ' thead').length
                    });
                } else if (tempResp && parentWidth > 1024){
                    $(tempID).basictable('destroy');
                }
            })
        }
    });
})(jQuery);