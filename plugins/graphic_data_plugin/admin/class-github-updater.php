<?php
/**
 * GitHub Updater - Optimized Version
 * 
 * Enables WordPress plugins and themes to update from GitHub, including pre-releases.
 * Optimized to reduce API calls and prevent GitHub rate limiting.
 */
class GitHub_Updater {
    /**
    * The slug of the plugin or theme.
    * For plugins, it's plugin_basename($file). For themes, it's the theme directory name.
    * @var string
    */
    private $slug;
    /**
     * Stores plugin or theme data retrieved from WordPress.
     * @var array|null
     */
    private $plugin_data;
    /**
     * The GitHub username or organization name.
     * @var string
     */
    private $username;
    /**
     * The GitHub repository name.
     * @var string
     */
    private $repository;
    /**
     * Stores the response from the GitHub API (latest release or commit data).
     * @var array|null
     */
    private $github_response;
    /**
     * The main plugin file path. Only used if $is_theme is false.
     * @var string|null
     */
    private $plugin_file;
    /**
     * Flag indicating if the current instance is for a theme.
     * @var bool
     */
    private $is_theme = false;
    /**
     * The path to the plugin/theme within the GitHub repository, if it's in a subdirectory.
     * @var string
     */
    private $subdir_path;
    
    /**
     * Cache duration in seconds (24 hours by default)
     * @var int
     */
    private $cache_duration = DAY_IN_SECONDS;
    
    /**
     * Flag to track if we've already checked for updates in this request
     * @var bool
     */
    private $update_checked = false;
    
    /**
     * Constructor.
     *
     * Sets up hooks for plugin or theme updates.
     *
     * @param string $file            The main plugin file path or theme directory path.
     * @param string $github_username The GitHub username or organization.
     * @param string $github_repo     The GitHub repository name.
     * @param bool   $is_theme        Optional. True if this is a theme, false for a plugin. Default false.
     * @param string $subdir_path     Optional. Path to the plugin/theme within the repository if it's in a subdirectory.
     */
    public function __construct($file, $github_username, $github_repo, $is_theme = false, $subdir_path = '') {
        $this->is_theme = $is_theme;
        $this->subdir_path = $subdir_path;
        
        if ($is_theme) {
            $this->slug = basename(dirname($file));
        } else {
            $this->plugin_file = $file;
            $this->slug = plugin_basename($file);
            
            add_filter('plugins_api', array($this, 'plugin_info'), 20, 3);
            add_filter('site_transient_update_plugins', array($this, 'update_state'));
            add_filter('upgrader_post_install', array($this, 'after_install'), 10, 3);
        }
        
        $this->username = $github_username;
        $this->repository = $github_repo;
        
        if ($is_theme) {
            add_filter('site_transient_update_themes', array($this, 'theme_update_state'));
            add_filter('upgrader_post_install', array($this, 'after_theme_install'), 10, 3);
        }
        
        add_action('admin_init', array($this, 'set_plugin_properties'));
        
        // Add admin notice for rate limiting issues
        add_action('admin_notices', array($this, 'rate_limit_notice'));
        
        // Clear cache when plugin is updated
        add_action('upgrader_process_complete', array($this, 'clear_update_cache'), 10, 2);
    }
    
    /**
     * Sets plugin or theme properties using WordPress functions.
     * Hooked to 'admin_init'.
     */
    public function set_plugin_properties() {
        if (!$this->is_theme) {
            $this->plugin_data = get_plugin_data($this->plugin_file);
        } else {
            $theme = wp_get_theme($this->slug);
            $this->plugin_data = array(
                'Name' => $theme->get('Name'),
                'Version' => $theme->get('Version'),
                'ThemeURI' => $theme->get('ThemeURI'),
                'Description' => $theme->get('Description'),
                'Author' => $theme->get('Author'),
                'AuthorURI' => $theme->get('AuthorURI'),
            );
        }
    }
    
    /**
     * Retrieves repository information from GitHub API with enhanced caching.
     *
     * Fetches the latest release or, if no releases, the latest commit from the default branch.
     */
    private function get_repository_info() {
        // Define a unique transient key based on the repository and slug
        $transient_key = 'github_updater_repo_info_' . md5($this->username . '/' . $this->repository . '/' . $this->slug);
        $error_transient_key = 'github_updater_error_' . md5($this->username . '/' . $this->repository . '/' . $this->slug);
        
        // Check if we recently had an API error and avoid hammering GitHub
        $recent_error = get_transient($error_transient_key);
        if ($recent_error) {
            $this->github_response = null;
            return;
        }

        // Try to get cached data from the transient
        $cached_response = get_transient($transient_key);

        if (false !== $cached_response) {
            // Cache hit! Use the cached response.
            $this->github_response = $cached_response;
            return;
        }
        
        // Prevent multiple API calls in the same request
        if ($this->update_checked) {
            return;
        }
        $this->update_checked = true;
        
        if (is_null($this->github_response)) {
            // Configure API request options
            $request_options = array(
                'headers' => array(
                    'Accept' => 'application/vnd.github.v3+json',
                    'User-Agent' => 'WordPress/' . get_bloginfo('version') . '; ' . get_bloginfo('url')
                ),
                'timeout' => 15 // Increased timeout
            );
            
            // Get ALL releases (including pre-releases) instead of just the latest
            $releases_uri = sprintf('https://api.github.com/repos/%s/%s/releases', $this->username, $this->repository);
            $releases_response = wp_remote_get($releases_uri, $request_options);
            
            // Check for rate limiting
            if (!is_wp_error($releases_response)) {
                $response_code = wp_remote_retrieve_response_code($releases_response);
                $rate_limit_remaining = wp_remote_retrieve_header($releases_response, 'x-ratelimit-remaining');
                
                if ($response_code === 403 && $rate_limit_remaining === '0') {
                    // We hit the rate limit
                    $rate_limit_reset = wp_remote_retrieve_header($releases_response, 'x-ratelimit-reset');
                    $reset_time = $rate_limit_reset ? (int)$rate_limit_reset : time() + 3600;
                    $wait_time = max(3600, $reset_time - time()); // Wait at least 1 hour
                    
                    set_transient($error_transient_key, true, $wait_time);
                    set_transient($transient_key . '_rate_limited', true, $wait_time);
                    
                    error_log('GitHub Updater: Rate limit exceeded for ' . $this->username . '/' . $this->repository);
                    return;
                }
                
                if ($response_code === 200) {
                    $releases = json_decode(wp_remote_retrieve_body($releases_response), true);
                    
                    // If there are releases (including pre-releases), use the most recent one
                    if (is_array($releases) && !empty($releases)) {
                        $this->github_response = $releases[0]; // First item is the most recent release
                        set_transient($transient_key, $this->github_response, $this->cache_duration);
                        return;
                    }
                }
            } else {
                // Log the error and set a shorter error cache
                error_log('GitHub Updater: API error for releases - ' . $releases_response->get_error_message());
                set_transient($error_transient_key, true, HOUR_IN_SECONDS); // 1 hour error cache
                return;
            }
            
            // If no releases found or error occurred, try the repository's default branch
            $repo_uri = sprintf('https://api.github.com/repos/%s/%s', $this->username, $this->repository);
            $repo_response = wp_remote_get($repo_uri, $request_options);
            
            if (!is_wp_error($repo_response) && 200 === wp_remote_retrieve_response_code($repo_response)) {
                $repo_data = json_decode(wp_remote_retrieve_body($repo_response), true);
                $default_branch = isset($repo_data['default_branch']) ? $repo_data['default_branch'] : 'main';
                
                $branch_uri = sprintf('https://api.github.com/repos/%s/%s/commits/%s', 
                                    $this->username, $this->repository, $default_branch);
                $branch_response = wp_remote_get($branch_uri, $request_options);
                
                if (!is_wp_error($branch_response) && 200 === wp_remote_retrieve_response_code($branch_response)) {
                    $commit_data = json_decode(wp_remote_retrieve_body($branch_response), true);
                    
                    // If we have commit data, create a simulated release response
                    if (is_array($commit_data) && isset($commit_data['sha'])) {
                        // Get the current version from the plugin/theme
                        $current_version_for_sha_tag = null;
                        if ($this->is_theme) {
                            $theme = wp_get_theme($this->slug);
                            if ($theme->exists()) {
                                $current_version_for_sha_tag = $theme->get('Version');
                            }
                        } else {
                            // Ensure plugin_data is initialized if it hasn't been.
                            if (is_null($this->plugin_data) && method_exists($this, 'set_plugin_properties')) {
                                $this->set_plugin_properties(); // Try to initialize it if null
                            }
                            if (is_array($this->plugin_data) && isset($this->plugin_data['Version'])) {
                                $current_version_for_sha_tag = $this->plugin_data['Version'];
                            }
                        }
                        
                        // Use the first 7 characters of commit SHA as version part
                        $sha_short = substr($commit_data['sha'], 0, 7);
                        
                        // Create a simulated release structure
                        $this->github_response = array(
                            'tag_name' => (string) $current_version_for_sha_tag . '+' . $sha_short,
                            'published_at' => isset($commit_data['commit']['author']['date']) ? 
                                date('Y-m-d H:i:s', strtotime($commit_data['commit']['author']['date'])) :
                                date('Y-m-d H:i:s'),
                            'body' => isset($commit_data['commit']['message']) ? 
                                $commit_data['commit']['message'] : 'Latest commit from repository',
                            'html_url' => sprintf('https://github.com/%s/%s/commit/%s', 
                                       $this->username, $this->repository, $commit_data['sha']),
                            'zipball_url' => sprintf('https://github.com/%s/%s/archive/refs/heads/%s.zip',
                                       $this->username, $this->repository, $default_branch)
                        );
                    }
                }
            }
            
            // Cache the response (or null if failed) for the specified duration
            set_transient($transient_key, $this->github_response, $this->cache_duration);
            
            // Log error for debugging if we still don't have a response
            if (is_null($this->github_response)) {
                error_log('GitHub Updater: Failed to get repository info for ' . $this->username . '/' . $this->repository);
                // Set a shorter error cache to retry sooner
                set_transient($error_transient_key, true, HOUR_IN_SECONDS);
            }
        }
    }
    
    /**
     * Checks for updates and modifies the update transient.
     * Enhanced with better caching and rate limit handling.
     *
     * @param object $transient The WordPress update transient.
     * @return object The modified transient.
     */
    public function update_state($transient) {
        if (empty($transient->checked)) {
            return $transient;
        }
        
        // Check if we're rate limited
        $rate_limit_key = 'github_updater_repo_info_' . md5($this->username . '/' . $this->repository . '/' . $this->slug) . '_rate_limited';
        if (get_transient($rate_limit_key)) {
            // We're rate limited, don't make any API calls
            return $transient;
        }
        
        $this->get_repository_info();
        
        if (!is_array($this->github_response)) {
            return $transient;
        }
        
        $current_version_val = null;
        if ($this->is_theme) {
            // For themes, $transient->checked should contain the version.
            if (is_array($transient->checked) && isset($transient->checked[$this->slug])) {
                $current_version_val = $transient->checked[$this->slug];
            } elseif (is_object($transient->checked) && isset($transient->checked->{$this->slug})) {
                $current_version_val = $transient->checked->{$this->slug};
            }
        } else {
            // For plugins, $this->plugin_data should have the version.
            if (is_null($this->plugin_data) && method_exists($this, 'set_plugin_properties')) {
                 $this->set_plugin_properties();
            }
            if (is_array($this->plugin_data) && isset($this->plugin_data['Version'])) {
                $current_version_val = $this->plugin_data['Version'];
            }
        }

        // If current version could not be determined, we can't proceed with comparison.
        if (is_null($current_version_val)) {
            return $transient;
        }
        
        // Clean version numbers for comparison (remove any +commit suffixes)
        $clean_current = preg_replace('/\+.*$/', '', (string) $current_version_val);
        $remote_tag_name = isset($this->github_response['tag_name']) ? (string) $this->github_response['tag_name'] : '';
        $clean_remote = preg_replace('/\+.*$/', '', $remote_tag_name);
        
        // Remove 'v' prefix if present
        $clean_current = ltrim($clean_current, 'v');
        $clean_remote = ltrim($clean_remote, 'v');
        
        // Check if version numbers are equal but remote has a commit suffix
        $force_update = ($clean_current === $clean_remote &&
                         strpos($remote_tag_name, '+') !== false &&
                         $remote_tag_name !== (string) $current_version_val);
        
        // Check if a new version is available
        if (version_compare($clean_remote, $clean_current, '>') || $force_update) {
            $package = $this->get_download_url();
            
            if (!empty($package)) {
                if ($this->is_theme) {
                    $transient->response[$this->slug] = array(
                        'new_version' => $remote_tag_name,
                        'package' => $package,
                        'url' => $this->github_response['html_url']
                    );
                } else {
                    $obj = new stdClass();
                    $obj->slug = $this->slug;
                    $obj->new_version = $remote_tag_name;
                    $obj->url = isset($this->plugin_data['PluginURI']) ? $this->plugin_data['PluginURI'] : 
                          sprintf('https://github.com/%s/%s', $this->username, $this->repository);
                    $obj->package = $package;
                    $transient->response[$this->slug] = $obj;
                }
            }
        }
        
        return $transient;
    }
    
    /**
     * Display admin notice when rate limited
     */
    public function rate_limit_notice() {
        $rate_limit_key = 'github_updater_repo_info_' . md5($this->username . '/' . $this->repository . '/' . $this->slug) . '_rate_limited';
        if (get_transient($rate_limit_key)) {
            echo '<div class="notice notice-warning"><p>';
            echo '<strong>GitHub Rate Limit:</strong> Update checks for ' . esc_html($this->slug) . ' are temporarily paused due to GitHub API rate limiting. ';
            echo 'Updates will resume automatically in about an hour.';
            echo '</p></div>';
        }
    }
    
    /**
     * Clear update cache when plugin/theme is updated
     */
    public function clear_update_cache($upgrader, $options) {
        if (isset($options['plugins']) && in_array($this->slug, $options['plugins'])) {
            $transient_key = 'github_updater_repo_info_' . md5($this->username . '/' . $this->repository . '/' . $this->slug);
            delete_transient($transient_key);
            $this->update_checked = false;
        }
    }
    
    /**
     * Alias for theme updates to use the same update_state logic.
     * Hooked to 'site_transient_update_themes'.
     *
     * @param object $transient The WordPress update transient for themes.
     * @return object The modified transient.
     */
    public function theme_update_state($transient) {
        return $this->update_state($transient);
    }
    
    /**
     * Provides plugin information for the "View details" popup.
     * Hooked to 'plugins_api'.
     *
     * @param false|object|array $false    The result object or array. Default false.
     * @param string             $action   The type of information being requested from the Plugin Installation API.
     * @param object             $response An object of arguments used to solicit information about a plugin.
     * @return false|object The plugin info object or false if not applicable.
     */    
    public function plugin_info($false, $action, $response) {
        if (!isset($response->slug) || $response->slug != $this->slug) {
            return $false;
        }
        
        $this->get_repository_info();
        
        if (!is_array($this->github_response)) {
            return $false;
        }
        
        $response->slug = $this->slug;
        $response->plugin_name = $this->plugin_data['Name'];
        $response->version = $this->github_response['tag_name'];
        $response->author = isset($this->plugin_data['Author']) ? $this->plugin_data['Author'] : '';
        $response->homepage = isset($this->plugin_data['PluginURI']) ? $this->plugin_data['PluginURI'] : 
                       sprintf('https://github.com/%s/%s', $this->username, $this->repository);
        $response->requires = isset($this->plugin_data['RequiresWP']) ? $this->plugin_data['RequiresWP'] : '';
        $response->requires_php = isset($this->plugin_data['RequiresPHP']) ? $this->plugin_data['RequiresPHP'] : '';
        
        $response->downloaded = 0;
        $response->last_updated = $this->github_response['published_at'];
        $response->sections = array(
            'description' => isset($this->plugin_data['Description']) ? $this->plugin_data['Description'] : '',
            'changelog' => $this->github_response['body']
        );
        $response->download_link = $this->get_download_url();
        
        return $response;
    }
    
    /**
     * Gets the download URL for the plugin or theme.
     *
     * Prioritizes specific release assets (webcr.zip or Sanctuary_Watch.zip),
     * then the release's zipball_url, then a direct archive link to the default branch.
     *
     * @return string The download URL.
     */
    private function get_download_url() {
        // First check if there's a dedicated release asset for our component
        $asset_name = $this->is_theme ? 'graphic_data_theme.zip' : 'graphic_data_plugin.zip';
            
        if (isset($this->github_response['assets']) && is_array($this->github_response['assets'])) {
            foreach ($this->github_response['assets'] as $asset) {
                if (strpos($asset['name'], $asset_name) !== false) {
                    return $asset['browser_download_url'];
                }
            }
        }
        
        // If no specific asset found, use the zipball URL from the API
        if (isset($this->github_response['zipball_url'])) {
            return $this->github_response['zipball_url'];
        }
        
        // Final fallback - direct download link
        $branch = 'main'; // Default to main
        $repo_uri = sprintf('https://api.github.com/repos/%s/%s', $this->username, $this->repository);
        $repo_response = wp_remote_get($repo_uri);
        if (!is_wp_error($repo_response) && 200 === wp_remote_retrieve_response_code($repo_response)) {
            $repo_data = json_decode(wp_remote_retrieve_body($repo_response), true);
            if (isset($repo_data['default_branch'])) {
                $branch = $repo_data['default_branch'];
            }
        }
        
        return sprintf('https://github.com/%s/%s/archive/refs/heads/%s.zip', 
                        $this->username, $this->repository, $branch);
    }
    
    /**
     * Post-installation hook for plugins.
     *
     * Moves the plugin from the temporary download location to the correct plugin directory.
     * Handles cases where the plugin is in a subdirectory within the repository zip.
     * Hooked to 'upgrader_post_install'.
     *
     * @param bool   $response    Installation response.
     * @param array  $hook_extra  Extra arguments passed to hooked filters.
     * @param array  $result      Installation result data.
     * @return array The (potentially modified) result data.
     */
    public function after_install($response, $hook_extra, $result) {
        if (!$this->is_theme && isset($hook_extra['plugin'])) {
            global $wp_filesystem;
            
            // Check if this is our plugin
            if ($hook_extra['plugin'] === $this->slug) {
                $proper_destination = plugin_dir_path($this->plugin_file);
                $wp_filesystem->move($result['destination'], $proper_destination);
                $result['destination'] = $proper_destination;
                
                // If we need to move from a subdirectory (e.g., if the zip contains the repo structure)
                $subdir = trailingslashit($proper_destination) . basename($this->repository) . '-*/' . $this->subdir_path;
                $subdir_files = glob($subdir);
                
                if (!empty($subdir_files) && is_dir($subdir_files[0])) {
                    // Move from subdirectory to the proper plugin location
                    $this->recursive_copy($subdir_files[0], $proper_destination);
                    $this->recursive_remove_directory(dirname($subdir_files[0]));
                }
            }
        }
        
        return $result;
    }
    
    /**
     * Post-installation hook for themes.
     *
     * Moves the theme from the temporary download location to the correct theme directory.
     * Handles cases where the theme is in a subdirectory within the repository zip.
     * Hooked to 'upgrader_post_install'.
     *
     * @param bool   $response    Installation response.
     * @param array  $hook_extra  Extra arguments passed to hooked filters.
     * @param array  $result      Installation result data.
     * @return array The (potentially modified) result data.
     */
    public function after_theme_install($response, $hook_extra, $result) {
        if ($this->is_theme && isset($hook_extra['theme'])) {
            global $wp_filesystem;
            
            // Check if this is our theme
            if ($hook_extra['theme'] === $this->slug) {
                $proper_destination = get_theme_root() . '/' . $this->slug;
                
                // If we need to move from a subdirectory (e.g., if the zip contains the repo structure)
                $subdir = trailingslashit($result['destination']) . basename($this->repository) . '-*/' . $this->subdir_path;
                $subdir_files = glob($subdir);
                
                if (!empty($subdir_files) && is_dir($subdir_files[0])) {
                    // Move from subdirectory to the proper theme location
                    $this->recursive_copy($subdir_files[0], $proper_destination);
                    
                    // Clean up
                    $wp_filesystem->delete($result['destination'], true);
                    $result['destination'] = $proper_destination;
                }
            }
        }
        
        return $result;
    }
    
    /**
     * Helper function to recursively copy directories using WP_Filesystem.
     *
     * @param string $src Source directory path.
     * @param string $dst Destination directory path.
     * @return bool True on success, false on failure.
     */
    private function recursive_copy($src, $dst) {
        global $wp_filesystem;
        
        if (!is_dir($src)) return false;
        
        $dir = opendir($src);
        if (!$dir) return false;
        
        if (!is_dir($dst)) {
            wp_mkdir_p($dst);
        }
        
        while (($file = readdir($dir)) !== false) {
            if ($file != '.' && $file != '..') {
                if (is_dir($src . '/' . $file)) {
                    $this->recursive_copy($src . '/' . $file, $dst . '/' . $file);
                } else {
                    $wp_filesystem->copy($src . '/' . $file, $dst . '/' . $file, true);
                }
            }
        }
        
        closedir($dir);
        return true;
    }
    
    /**
     * Helper function to recursively remove a directory using WP_Filesystem.
     * Includes safety checks to prevent accidental deletion of critical directories.
     *
     * @param string $directory Path to the directory to remove.
     * @return bool True on success, false on failure or if safety checks fail.
     */
    private function recursive_remove_directory($directory) {
        global $wp_filesystem;
        
        // Extra safety check to prevent accidentally deleting important directories
        if (empty($directory) || $directory == '/' || $directory == ABSPATH) {
            return false;
        }
        
        return $wp_filesystem->delete($directory, true);
    }
}