(function ($) {
    'use strict';

    $(function () {
        var submitting = false;


        function collectData (form) {
            if (submitting) {
              return false;
            }

            submitting = true;

            $.ajax({
                type: 'POST',
                url: form.getAttribute('action'),
                data: new FormData(form),
                processData: false,
                contentType: false,
                success: function(response) {
                    $.magnificPopup.open({
                        items: {
                            src: form.querySelector('.fr-success-form-submit'),
                            type: 'inline'
                        }
                    }, 0);

                    form.reset();
                },
                complete: function () {
                    submitting = false;
                }
            });
        }


        function onFormSubmit (event) {
            if (this.hasAttribute('data-fr-collect-data')) {
                event.preventDefault();
                collectData(this);
                return;
            }
        }


        function submitClosestForm (event) {
            if (event.type === 'click') {
                event.preventDefault()
            }

            // Submit on Enter key
            var key = event.which || event.keyCode;
            if (event.type === 'keydown' && key !== 13) {
               return;
            }

            var $form = $(this).closest('form')
            var $submitBtn = $form.find('[type="submit"]').first();
            $submitBtn.trigger("click");
        }


        $('.fr-form').on('submit', onFormSubmit);
        $('.fr-linktype-submit').on('click keydown', submitClosestForm);
    });

})(window.jQuery);
