<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WPDataTablesFeedback{
    public static $wdt_api_feedback_url = 'https://wpreportbuilder.com/wp-json/wpreportbuilder/v1/form-submissions';
    public static function wdtSendFeedback($reason, $reason_caption){
        $response = wp_remote_post(self::$wdt_api_feedback_url, [
            'body' => [
                'api_version' => get_option('wdtVersion'),
                'feedback_key' => $reason,
                'feedback' => $reason_caption,
            ],
        ]);

        return $response;
    }
}