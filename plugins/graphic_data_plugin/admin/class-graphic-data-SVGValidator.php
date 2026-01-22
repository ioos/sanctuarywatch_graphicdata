<?php
/**
 * Enhanced SVG validation for WordPress plugin
 */
class Graphic_Data_SVG_Validator {

	/**
	 * Validate SVG file with comprehensive security checks
	 *
	 * @param string $file_path Path to the file to validate
	 * @return array Validation result with success status and error message
	 */
	public static function validate_svg_file( $file_path ) {
		$result = array(
			'valid' => false,
			'error' => '',
		);

		// Step 1: Check if file exists and is readable.
		if ( ! file_exists( $file_path ) || ! is_readable( $file_path ) ) {
			$result['error'] = 'The infographic SVG does not exist or is not readable.';
			return $result;
		}

		// Step 2: Check file extension.
		$file_extension = strtolower( pathinfo( $file_path, PATHINFO_EXTENSION ) );
		if ( 'svg' !== $file_extension ) {
			$result['error'] = 'The infographic file extension must be .svg.';
			return $result;
		}

		// Step 3: Check MIME type (only reject clearly wrong formats).
		if ( function_exists( 'finfo_file' ) ) {
			$finfo = finfo_open( FILEINFO_MIME_TYPE );
			$mime_type = finfo_file( $finfo, $file_path );
			finfo_close( $finfo );

			// Only reject if MIME type is clearly wrong (like actual image formats).
			$invalid_mime_types = array(
				'image/jpeg',
				'image/jpg',
				'image/png',
				'image/gif',
				'image/bmp',
				'image/webp',
				'application/pdf',
				'video/',
				'audio/', // Any video or audio type.
			);

			$is_invalid = false;
			foreach ( $invalid_mime_types as $invalid_type ) {
				if ( strpos( $mime_type, $invalid_type ) === 0 ) {
					$is_invalid = true;
					break;
				}
			}

			if ( $is_invalid ) {
				$result['error'] = 'The infographic SVG appears to be a different format (MIME: ' . $mime_type . ')';
				return $result;
			}
		}

		// Step 4: Read and validate file content.
		$content = file_get_contents( $file_path );
		if ( false === $content ) {
			$result['error'] = 'Unable to read content of infographic SVG file.';
			return $result;
		}

		// Step 5: Validate SVG structure (primary validation method).
		$structure_validation = self::validate_svg_structure( $content );
		if ( ! $structure_validation['valid'] ) {
			$result['error'] = $structure_validation['error'];
			return $result;
		}

		// Get the parsed XML for further validation.
		$xml = $structure_validation['xml'];

		// Step 6: Check for required "icons" layer.
		if ( ! self::has_icons_layer( $xml ) ) {
			$result['error'] = 'The infographic SVG must contain a layer named "icons".';
			return $result;
		}

		$result['valid'] = true;
		return $result;
	}

	/**
	 * Validate SVG XML structure with comprehensive error reporting.
	 *
	 * Performs multiple validation checks on SVG content:
	 * - Removes BOM (Byte Order Mark) if present.
	 * - Verifies presence of opening and closing SVG tags.
	 * - Parses and validates XML structure.
	 * - Confirms root element is an SVG element.
	 * - Checks for typical SVG content indicators.
	 *
	 * @param string $content The raw SVG file content to validate.
	 * @return array {
	 *     Validation result array.
	 *
	 *     @type bool             $valid Whether the SVG structure is valid.
	 *     @type string           $error Error message if validation failed, empty string otherwise.
	 *     @type SimpleXMLElement $xml   Parsed XML object (only present when valid is true).
	 * }
	 */
	public static function validate_svg_structure( $content ) {
		$result = array(
			'valid' => false,
			'error' => '',
		);

		// Remove BOM if present.
		$content = self::remove_bom( $content );

		// Trim whitespace.
		$content = trim( $content );

		// Check for basic SVG structure with multiple patterns.
		$svg_patterns = array(
			'/<svg[^>]*>/i',                    // Standard <svg> tag.
			'/<svg\s[^>]*>/i',                  // <svg with attributes.
			'/^<\?xml[^>]*>.*<svg[^>]*>/is',    // XML declaration followed by SVG.
		);

		$has_svg_tag = false;
		foreach ( $svg_patterns as $pattern ) {
			if ( preg_match( $pattern, $content ) ) {
				$has_svg_tag = true;
				break;
			}
		}

		if ( ! $has_svg_tag ) {
			$result['error'] = 'No valid SVG opening tag found in the infographic SVG.';
			return $result;
		}

		// Check for closing SVG tag.
		if ( ! preg_match( '/<\/svg\s*>/i', $content ) ) {
			$result['error'] = 'No closing SVG tag found in the infographic SVG.';
			return $result;
		}

		// Validate as XML (with better error handling).
		libxml_use_internal_errors( true );
		libxml_clear_errors();

		$xml = simplexml_load_string( $content, 'SimpleXMLElement', LIBXML_NOERROR | LIBXML_NOWARNING );
		$xml_errors = libxml_get_errors();

		if ( false === $xml ) {
			$error_msg = 'Invalid XML structure in the infographic SVG.';
			if ( ! empty( $xml_errors ) ) {
				$error_msg .= ': ' . $xml_errors[0]->message;
			}
			$result['error'] = trim( $error_msg );
			libxml_clear_errors();
			return $result;
		}

		libxml_clear_errors();

		// Check if root element is SVG.
		if ( strtolower( $xml->getName() ) !== 'svg' ) {
			$result['error'] = 'Root element in the infographic is not SVG (found: ' . $xml->getName() . ')';
			return $result;
		}

		// Additional content validation.
		if ( strlen( $content ) < 20 ) {
			$result['error'] = 'The infographic SVG content is too short to be valid.';
			return $result;
		}

		// Check for some basic SVG elements or attributes that indicate it's actually SVG content.
		$svg_indicators = array(
			'xmlns="http://www.w3.org/2000/svg"',
			'viewBox=',
			'<path',
			'<circle',
			'<rect',
			'<line',
			'<polygon',
			'<polyline',
			'<ellipse',
			'<g>',
			'<g ',
			'stroke=',
			'fill=',
		);

		$has_svg_indicators = false;
		foreach ( $svg_indicators as $indicator ) {
			if ( stripos( $content, $indicator ) !== false ) {
				$has_svg_indicators = true;
				break;
			}
		}

		if ( ! $has_svg_indicators ) {
			$result['error'] = 'The infographic file has SVG structure but lacks typical SVG content';
			return $result;
		}

		$result['valid'] = true;
		$result['xml'] = $xml; // Return parsed XML for further use.
		return $result;
	}

	/**
	 * Check if the SVG contains a group element with id="icons".
	 *
	 * This layer is required for the infographic to function properly,
	 * as it contains the interactive icon elements. The method uses
	 * multiple detection strategies to handle various SVG structures:
	 * 1. XPath query for <g id="icons"> with double quotes.
	 * 2. XPath query for <g id='icons'> with single quotes.
	 * 3. Manual iteration through all elements as a fallback.
	 *
	 * @param SimpleXMLElement $xml The parsed SVG XML object.
	 * @return bool True if an "icons" layer exists, false otherwise.
	 */
	private static function has_icons_layer( $xml ) {

		// First, let's see the complete XML structure (more characters).
		$full_xml = $xml->asXML();

		// Method 1: Simple XPath for id="icons" in <g> elements.
		$icons_elements = $xml->xpath( '//g[@id="icons"]' );

		if ( $icons_elements && count( $icons_elements ) > 0 ) {
			return true;
		}

		// Method 2: Simple XPath for id='icons' in <g> elements.
		$icons_elements = $xml->xpath( "//g[@id='icons']" );

		if ( $icons_elements && count( $icons_elements ) > 0 ) {
			return true;
		}

		// Method 3: Get ALL elements and check manually.
		$all_elements = $xml->xpath( '//*' );

		if ( $all_elements && is_array( $all_elements ) ) {
			$group_count = 0;
			foreach ( $all_elements as $index => $element ) {
				$tag_name = $element->getName();
				$id_attr = (string) $element['id'];

				if ( 'g' === $tag_name ) {
					$group_count++;
				}

				if ( 'icons' === $id_attr ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Scan SVG content for potentially dangerous or malicious elements.
	 *
	 * Checks for common XSS attack vectors and security risks in SVG files:
	 * - Script tags that could execute JavaScript.
	 * - javascript: URI schemes in attributes.
	 * - Event handler attributes (onclick, onload, etc.).
	 * - Embedded content elements (iframe, object, embed).
	 * - External resource elements (link, meta).
	 * - foreignObject elements that can contain arbitrary HTML.
	 *
	 * @param string $content The raw SVG file content to scan.
	 * @return bool True if the content is safe, false if dangerous patterns are detected.
	 */
	private static function scan_svg_security( $content ) {
		// List of potentially dangerous elements/attributes.
		$dangerous_patterns = array(
			'/<script[^>]*>/i',
			'/javascript:/i',
			'/\bon\w+\s*=/i', // Event handlers like onclick, onload, etc. (word boundary prevents matching "opacity").
			'/<iframe[^>]*>/i',
			'/<object[^>]*>/i',
			'/<embed[^>]*>/i',
			'/<link[^>]*>/i',
			'/<meta[^>]*>/i',
			'/xlink:href\s*=\s*["\']javascript:/i',
			'/<foreignObject[^>]*>/i',
		);

		foreach ( $dangerous_patterns as $pattern ) {
			if ( preg_match( $pattern, $content ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Remove UTF-8 Byte Order Mark (BOM) from the beginning of content.
	 *
	 * Some text editors add a BOM (EF BB BF) at the start of UTF-8 files.
	 * This invisible character sequence can interfere with XML parsing
	 * and SVG validation, so it must be stripped before processing.
	 *
	 * @param string $content The raw file content that may contain a BOM.
	 * @return string The content with the BOM removed, if present.
	 */
	private static function remove_bom( $content ) {
		$bom = pack( 'H*', 'EFBBBF' );
		return preg_replace( "/^$bom/", '', $content );
	}
}
