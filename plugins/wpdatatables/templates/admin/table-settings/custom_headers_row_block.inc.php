<?php defined('ABSPATH') or die('Access denied.'); ?>

<script type="text/x-template" id="wdt-nested-json-custom-headers-template">

	<div class="row wdt-custom-headers-row-rule">
		<div class="col-sm-6 wdt-custom-header-key-name">
			<div class="form-group m-b-10">
				<input placeholder="<?php esc_attr_e('Insert key name', 'wpdatatables'); ?>"
				       type="text"
				       class="form-control input-sm custom-header-key-name-value"
				       value="">
			</div>
		</div>
		<div class="col-sm-5-3 p-r-0 wdt-custom-header-key-value">
			<div class="form-group m-b-10">
                <textarea placeholder="<?php esc_attr_e('Insert key value', 'wpdatatables'); ?>"
                          type="text"
                          class="form-control input-sm custom-header-key-value-value"
                          value="">
                </textarea>
			</div>
		</div>
		<div class="col-sm-1-2 p-0 wdt-delete-custom-headers-wrapper">
			<button class="btn wdt-delete-custom-headers-row-rule"
			        title="<?php esc_attr_e('Remove row', 'wpdatatables'); ?>"
			        data-toggle="tooltip"><i
					class="wpdt-icon-trash"></i>
			</button>
		</div>
	</div>

</script>
