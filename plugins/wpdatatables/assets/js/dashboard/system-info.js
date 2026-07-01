(function ($) {
    $(function () {
        const btnCopyTable = $('#wdt-copy-table');

        const elTablesContainer = document.querySelector('#wdt-system-info-tables');

        const copyEl = (elToBeCopied) => {
            let range, sel;

            // Ensure that range and selection are supported by the browsers
            if (document.createRange && window.getSelection) {

                range = document.createRange();
                sel = window.getSelection();
                // unselect any element in the page
                sel.removeAllRanges();

                try {
                    range.selectNodeContents(elToBeCopied);
                    sel.addRange(range);
                } catch (e) {
                    range.selectNode(elToBeCopied);
                    sel.addRange(range);
                }

                document.execCommand('copy');
                wdtNotify(
                    wpdatatables_edit_strings.success,
                    wpdatatables_edit_strings.systemInfoSaved,
                    'success'
                );
            }
            sel.removeAllRanges();
        };
        btnCopyTable.on('click', () => copyEl(elTablesContainer));
    })
})(jQuery);