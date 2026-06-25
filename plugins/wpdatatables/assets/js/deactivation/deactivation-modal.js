(function ($) {
    $(function () {
        // Intercept the click event on the deactivate button
        $(document).on('click', '#deactivate-wpdatatables-tables-table-charts,  #deactivate-wpdatatables-lite\\\/wpdatatables\\.php', function (e) {
            e.preventDefault();

            // Create your modal dynamically
            var backdrop = $('<div>').addClass('wdt-deactivation-backdrop');

            // Create the modal and its elements dynamically
            var modal = $('<div>').attr('id', 'wdt-deactivation-modal');
            var modalHeader = $('<div>').attr('id', 'wdt-deactivation-modal-header');
            var closeBtn = $('<div>').addClass('wdt-deactivation-modal-close').text('x').html('x <i class="wpdt-icon-times-full"></i>');
            var title = $('<h2>').addClass('wdt-deactivation-modal-title').text(wpdatatables_deactivate_info.titleDeactivation);
            var caption = $('<div>').addClass('wdt-deactivation-feedback-dialog-form-caption').text(wpdatatables_deactivate_info.captionDeactivation);
            var logo = $('<div>').addClass('wpdt-deactivation-modal-logo');


            var updateList = constructDeactivationReasons(wpdatatables_deactivate_info);
            var modalOptions = $('<div>').attr('id', 'wdt-deactivation-modal-options');

            var improveTitle = $('<div>').text('How could we improve?').addClass('wdt-textarea-description');
            var textarea = $('<textarea>').addClass('wdt-textarea');
            var wdtNonce = wpdatatables_deactivate_info.wdt_nonce;
            var modalTicket = $('<div>').attr('id', 'wdt-deactivation-modal-ticket');
            var ticksyText = $('<div>').text('Have you reached out to our support team? ').addClass('wdt-ticksy-description');
            var ticksyLink = $('<a>').text('Submit ticket').attr('href', 'https://tmsplugins.ticksy.com/submit/#100004195').attr('target', '_blank').addClass('wdt-submit-ticket');

            var modalFooter = $('<div>').attr('id', 'wdt-deactivation-modal-footer');
            var submitButton = $('<a class="btn btn-primary wdt-submit">').text('Submit & Deactivate');
            var closeButton = $('<a class="btn btn-primary wdt-close">').text('Skip & Deactivate');

            // Append elements to the modal
            modalHeader.append(logo, title, closeBtn);
            modalFooter.append(submitButton, closeButton);
            modalOptions.append(updateList);
            ticksyText.append(ticksyLink)
            modalTicket.append(ticksyText);
            modal.append(modalHeader, caption, modalOptions, modalTicket, improveTitle, textarea, modalFooter);
            backdrop.append(wdtNonce);
            // Append the modal to the body
            $('body').append(backdrop, modal);

            // Show the modal
            backdrop.show();
            modal.show();

            ticksyText.hide()
            ticksyLink.hide();
            textarea.hide();
            improveTitle.hide();

            function constructDeactivationReasons(updateData) {
                var html = '<ul>';

                html += generateUpdateList('', updateData.deactivate_reasons);
                html += '</ul>';

                return html;
            }
            function generateUpdateList(type, data) {
                var listHtml = '';

                if (data) {
                    data.forEach(function (item) {
                        listHtml += '<li><input type="radio" id="' + item.id + '">' + item.title ;
                        listHtml += '</li>';
                    });
                    listHtml += '</ul></li>';
                }

                return listHtml;
            }

            // Add click event for the close button
            $('#wdt-deactivation-modal .wdt-deactivation-modal-close').on('click', function () {
                // Hide the modal
                modal.hide();
                backdrop.hide();
            });

            // Add click event for the submit button
            $('#wdt-deactivation-modal .wdt-submit').on('click', function () {

                if ($('#wdt-deactivation-modal-options input:checked').length === 0) {
                    location.href = $('#the-list').find('[data-slug="wpdatatables-tables-table-charts"] span.deactivate a').attr('href') === undefined ?
                        $('#the-list').find('[data-plugin="wpdatatables-lite\\/wpdatatables\\.php"] span.deactivate a').attr('href') : $('#the-list').find('[data-slug="wpdatatables-tables-table-charts"] span.deactivate a').attr('href');
                    return;
                }

                var choice = $('#wdt-deactivation-modal-options input:checked')[0].id;
                var textareaDescription = textarea.val();

                $.ajax({
                    url: ajaxurl,
                    method: "POST",
                    data: {
                        'action': 'wdtSaveDeactivationinfo',
                        'choice' : choice,
                        'textareaDescription' : textareaDescription,
                        'wdtNonce' : $(wdtNonce).val()
                    },
                    success: function (e) {
                        backdrop.hide();
                        modal.hide();
                        location.href = $('#the-list').find('[data-slug="wpdatatables-tables-table-charts"] span.deactivate a').attr('href') === undefined ?
                            $('#the-list').find('[data-plugin="wpdatatables-lite\\/wpdatatables\\.php"] span.deactivate a').attr('href') : $('#the-list').find('[data-slug="wpdatatables-tables-table-charts"] span.deactivate a').attr('href');
                    }
                });
            });
            $('#wdt-deactivation-modal .wdt-close').on('click', function () {
                modal.hide();
                backdrop.hide();
                location.href = $('#the-list').find('[data-slug="wpdatatables-tables-table-charts"] span.deactivate a').attr('href') === undefined ?
                    $('#the-list').find('[data-plugin="wpdatatables-lite\\/wpdatatables\\.php"] span.deactivate a').attr('href') : $('#the-list').find('[data-slug="wpdatatables-tables-table-charts"] span.deactivate a').attr('href');

            });

            $('#wdt-deactivation-modal input[type="radio"]').on('click', function () {
                $('input[type="radio"]').prop('checked', false);
                $(this).prop('checked', true);
                var $option = $('#wdt-deactivation-modal-options input:checked')[0].id;
                var $data = wpdatatables_deactivate_info;
                ticksyText.hide()
                ticksyLink.hide();
                textarea.hide();
                improveTitle.hide();

                if ($data.deactivate_reasons) {``
                    $data.deactivate_reasons.forEach(function (item){
                        if(item.id === $option){
                            if(item.input_placeholder != '') {
                                textarea.show();
                                improveTitle.show();
                                improveTitle[0].innerText = item.input_placeholder;
                            }
                            if(item.alert != '') {
                                ticksyText.show()
                                ticksyLink.show();
                                improveTitle[0].innerText = item.input_placeholder;
                            }
                        }

                    });
                }
            });
        });
    })
})(jQuery);