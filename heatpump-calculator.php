<?php
/**
 * Plugin Name: TOP-INSTAL Heat Pump Calculator
 * Plugin URI: https://topinstal.com.pl
 * Description: Profesjonalny kalkulator mocy pompy ciepła i konfigurator maszynowni. Oblicza zapotrzebowanie na moc zgodnie z normami PN-B 02025 i PN-EN 832, dobiera komponenty maszynowni oraz generuje raporty PDF.
 * Version: 1.0.0
 * Author: TOP-INSTAL
 * Author URI: https://topinstal.com.pl
 * License: Proprietary
 * License URI: https://topinstal.com.pl
 * Text Domain: heatpump-calculator
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.4
 * Network: false
 */

// Zabezpieczenie przed bezpośrednim dostępem
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Główna klasa wtyczki
 */
class HeatPump_Calculator {

    /**
     * Wersja wtyczki
     */
    const VERSION = '1.0.0';

    /**
     * Singleton instance
     */
    private static $instance = null;

    /**
     * Ścieżka do katalogu wtyczki
     */
    private $plugin_path;

    /**
     * URL do katalogu wtyczki
     */
    private $plugin_url;

    /**
     * Bazowy URL do zasobów aplikacji
     */
    private $base_url;

    /**
     * Konstruktor
     */
    private function __construct() {
        $this->plugin_path = plugin_dir_path(__FILE__);
        $this->plugin_url = plugin_dir_url(__FILE__);
        $this->base_url = $this->plugin_url . 'main';

        $this->init_hooks();
    }

    /**
     * Pobierz instancję singleton
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Inicjalizacja hooków WordPress
     */
    private function init_hooks() {
        // Rejestracja shortcode
        add_shortcode('heatpump_calc', array($this, 'render_calculator'));

        // Enqueue skryptów i stylów
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));

        // Elementor compatibility - enqueue dla Elementora
        add_action('elementor/frontend/after_enqueue_scripts', array($this, 'enqueue_assets'));
        add_action('elementor/frontend/after_enqueue_styles', array($this, 'enqueue_assets'));

        // Aktywacja wtyczki
        register_activation_hook(__FILE__, array($this, 'activate'));

        // Deaktywacja wtyczki
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }

    /**
     * Aktywacja wtyczki
     */
    public function activate() {
        // Sprawdź wymagania
        if (version_compare(PHP_VERSION, '7.4', '<')) {
            deactivate_plugins(plugin_basename(__FILE__));
            wp_die('Wtyczka wymaga PHP 7.4 lub nowszej wersji.');
        }

        if (version_compare(get_bloginfo('version'), '5.0', '<')) {
            deactivate_plugins(plugin_basename(__FILE__));
            wp_die('Wtyczka wymaga WordPress 5.0 lub nowszej wersji.');
        }

        // Flush rewrite rules jeśli potrzeba
        flush_rewrite_rules();
    }

    /**
     * Deaktywacja wtyczki
     */
    public function deactivate() {
        flush_rewrite_rules();
    }

    /**
     * Enqueue skryptów i stylów
     */
    public function enqueue_assets() {
        // Enqueue tylko jeśli shortcode jest użyty na stronie
        global $post;

        // Sprawdź czy shortcode jest w treści posta
        $has_shortcode = false;
        if (is_a($post, 'WP_Post')) {
            $has_shortcode = has_shortcode($post->post_content, 'heatpump_calc');
        }

        // Sprawdź też w globalnym buforze (dla kompatybilności z niektórymi builderami)
        if (!$has_shortcode && isset($GLOBALS['wp_query'])) {
            $post_id = get_the_ID();
            if ($post_id) {
                $has_shortcode = has_shortcode(get_post_field('post_content', $post_id), 'heatpump_calc');
            }
        }

        // Elementor compatibility - sprawdź czy shortcode jest w Elementor data
        if (!$has_shortcode && class_exists('\Elementor\Plugin')) {
            $elementor = \Elementor\Plugin::$instance;
            if ($elementor && $elementor->frontend) {
                $current_post_id = get_the_ID();
                if ($current_post_id) {
                    $document = $elementor->frontend->get_builder_content_for_display($current_post_id);
                    if ($document && strpos($document, '[heatpump_calc') !== false) {
                        $has_shortcode = true;
                    }
                }
            }
        }

        // Sprawdź też w całym output bufferze (dla widgetów i innych miejsc)
        if (!$has_shortcode) {
            // Sprawdź czy shortcode jest w jakimkolwiek miejscu na stronie
            // To jest fallback dla przypadków, gdy shortcode jest w widget'cie lub innym miejscu
            $has_shortcode = $this->check_shortcode_in_output();
        }

        // Jeśli shortcode jest użyty, załaduj zasoby
        if ($has_shortcode) {
            $this->enqueue_calculator_assets();
        }
    }

    /**
     * Sprawdź czy shortcode jest w output bufferze (dla widgetów, itp.)
     */
    private function check_shortcode_in_output() {
        // Sprawdź wszystkie aktywne widgety
        if (is_active_sidebar('sidebar-1') || is_active_sidebar('sidebar-2') || is_active_sidebar('footer-1')) {
            // Shortcode może być w widget'cie - załaduj zasoby prewencyjnie
            // (lepiej załadować niepotrzebnie niż nie załadować wcale)
            return true;
        }

        return false;
    }

    /**
     * Znajdź plik rekurencyjnie w katalogu
     */
    private function find_file_recursive($directory, $filename) {
        if (!is_dir($directory)) {
            return null;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getFilename() === $filename) {
                return $file->getPathname();
            }
        }

        return null;
    }

    /**
     * Enqueue zasobów kalkulatora
     *
     * @param bool $force Wymuś enqueue nawet jeśli shortcode nie został wykryty
     */
    private function enqueue_calculator_assets($force = false) {
        // Zapobiegaj wielokrotnemu enqueue (WordPress automatycznie zapobiega duplikatom)
        static $enqueued = false;
        if ($enqueued) {
            return; // WordPress już zapobiega duplikatom, więc nie trzeba sprawdzać $force
        }
        $enqueued = true;
        $kalkulator_url = $this->base_url . '/kalkulator';
        $konfigurator_url = $this->base_url . '/konfigurator';
        $img_url = $this->base_url . '/img';
        $libraries_url = $this->base_url . '/libraries';

        // Preconnect i DNS prefetch
        add_action('wp_head', function() {
            echo '<link rel="preconnect" href="https://fonts.googleapis.com" />' . "\n";
            echo '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' . "\n";
            echo '<link rel="dns-prefetch" href="https://topinstal.com.pl" />' . "\n";
            echo '<link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />' . "\n";
        }, 1);

        // Fonty i ikony
        wp_enqueue_style('heatpump-fonts', 'https://fonts.googleapis.com/css2?family=Titillium+Web:wght@300;400;600;700&display=swap', [], null);
        wp_enqueue_style('heatpump-fontawesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', [], '6.0.0');
        wp_enqueue_style('heatpump-remixicon', 'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css', [], '3.5.0');

        // Lokalne style kalkulatora
        wp_enqueue_style('heatpump-main', $kalkulator_url . '/css/main.css', [], self::VERSION);
        wp_enqueue_style('heatpump-error', $kalkulator_url . '/css/error-system.css', [], self::VERSION);
        wp_enqueue_style('heatpump-onboarding', $kalkulator_url . '/css/onboarding-modal.css', [], self::VERSION);
        wp_enqueue_style('heatpump-workflow', $kalkulator_url . '/css/workflow-system.css', [], self::VERSION);
        wp_enqueue_style('heatpump-ai-coach', $kalkulator_url . '/css/ai-coach-dock.css', [], self::VERSION);
        wp_enqueue_style('heatpump-mobile', $kalkulator_url . '/css/mobile-redesign.css', [], self::VERSION);

        // Style konfiguratora
        wp_enqueue_style('heatpump-configurator', $konfigurator_url . '/configurator.css', [], self::VERSION);
        wp_enqueue_style('heatpump-configurator-v2', $konfigurator_url . '/configurator-v2-flat.css', [], self::VERSION);

        // Biblioteki zewnętrzne
        wp_enqueue_script('heatpump-phosphor-icons', 'https://unpkg.com/@phosphor-icons/web', [], null, false);
        wp_enqueue_script('heatpump-html2pdf', $libraries_url . '/html2pdf.bundle.min.js', [], self::VERSION, true);
        wp_enqueue_script('heatpump-html2canvas', $libraries_url . '/html2canvas.min.js', [], self::VERSION, true);
        wp_enqueue_script('heatpump-jspdf', $libraries_url . '/jspdf.umd.min.js', [], self::VERSION, true);

        // Skrypty kalkulatora (w odpowiedniej kolejności)
        $scripts = array(
            'elementor-fix.js',
            'gdpr-compliance.js',
            'tooltipSystem.js',
            'floorRenderer.js',
            'urlManager.js',
            'state.js',
            'rules.js',
            'visibility.js',
            'enablement.js',
            'render.js',
            'engine.js',
            'progressiveDisclosure.js',
            'payloadValidator.js',
            'formDataProcessor.js',
            'engine/ozc/ozc-engine.js',
            'ozc-engine-interface.js',
            'downloadPDF.js',
            'pdfGenerator.js',
            'emailSender.js',
            'aiWatchers.js',
            'errorHandler.js',
            'onboardingSystem.js',
            'workflowController.js',
            'resultsRenderer.js',
            'tabNavigation.js',
            'calculatorUI.js',
            'calculatorInit.js',
            'payloadLogger.js',
            'ai-coach-dock.js',
            'devQuickScenario.js',
            'mobileController.js'
        );

        $dependencies = array();
        foreach ($scripts as $script) {
            $handle = 'heatpump-' . str_replace(array('/', '.js'), array('-', ''), $script);
            $path = strpos($script, 'engine/') === 0
                ? $kalkulator_url . '/' . $script
                : $kalkulator_url . '/js/' . $script;

            wp_enqueue_script($handle, $path, $dependencies, self::VERSION, true);
            $dependencies[] = $handle;
        }

        // Konfigurator (osobne zależności)
        wp_enqueue_script('heatpump-buffer-engine', $konfigurator_url . '/buffer-engine.js', array(), self::VERSION, true);
        wp_enqueue_script('heatpump-configurator', $konfigurator_url . '/configurator-unified.js', array('heatpump-buffer-engine'), self::VERSION, true);

        // Wstrzyknij zmienne JavaScript (użyj pierwszego skryptu jako dependency)
        wp_localize_script('heatpump-elementor-fix', 'HEATPUMP_CONFIG', array(
            'baseUrl' => $this->base_url,
            'kalkulatorUrl' => $kalkulator_url,
            'konfiguratorUrl' => $konfigurator_url,
            'imgUrl' => $img_url,
            'librariesUrl' => $libraries_url,
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('heatpump_calc_nonce')
        ));
    }

    /**
     * Renderowanie kalkulatora (shortcode)
     *
     * @param array $atts Atrybuty shortcode
     * @return string HTML kalkulatora
     */
    public function render_calculator($atts = array()) {
        // Atrybuty shortcode
        $atts = shortcode_atts(array(
            'mode' => 'full', // full, calculator-only, configurator-only
        ), $atts, 'heatpump_calc');

        // Sprawdź czy plik istnieje - spróbuj różnych ścieżek
        $possible_paths = array(
            $this->plugin_path . 'main/kalkulator/calculator.php',
            $this->plugin_path . '/main/kalkulator/calculator.php',
            plugin_dir_path(__FILE__) . 'main/kalkulator/calculator.php',
            plugin_dir_path(__FILE__) . '/main/kalkulator/calculator.php',
            dirname(__FILE__) . '/main/kalkulator/calculator.php',
        );

        // Jeśli żadna ścieżka nie działa, spróbuj znaleźć plik rekurencyjnie
        $calculator_file = null;
        foreach ($possible_paths as $path) {
            if (file_exists($path)) {
                $calculator_file = $path;
                break;
            }
        }

        // Ostatnia deska ratunku: znajdź plik rekurencyjnie w katalogu wtyczki
        if (!$calculator_file) {
            $found_file = $this->find_file_recursive($this->plugin_path, 'calculator.php');
            if ($found_file && strpos($found_file, 'kalkulator') !== false) {
                $calculator_file = $found_file;
            }
        }

        if (!$calculator_file) {
            // Debug: pokaż wszystkie możliwe ścieżki
            $debug_info = '<div class="heatpump-error">';
            $debug_info .= '<p><strong>Błąd: Nie znaleziono pliku kalkulatora.</strong></p>';
            $debug_info .= '<p>Sprawdzane ścieżki:</p><ul>';
            foreach ($possible_paths as $path) {
                $exists = file_exists($path) ? '✅ ISTNIEJE' : '❌ NIE ISTNIEJE';
                $debug_info .= '<li>' . esc_html($path) . ' - ' . $exists . '</li>';
            }
            $debug_info .= '</ul>';
            $debug_info .= '<p><strong>Plugin path:</strong> ' . esc_html($this->plugin_path) . '</p>';
            $debug_info .= '<p><strong>Plugin dir:</strong> ' . esc_html(plugin_dir_path(__FILE__)) . '</p>';
            $debug_info .= '<p><strong>File dir:</strong> ' . esc_html(dirname(__FILE__)) . '</p>';
            $debug_info .= '</div>';
            return $debug_info;
        }

        // Przygotuj zmienne do przekazania do calculator.php
        $kalkulator_url = $this->base_url . '/kalkulator';
        $konfigurator_url = $this->base_url . '/konfigurator';
        $img_url = $this->base_url . '/img';
        $libraries_url = $this->base_url . '/libraries';

        // Zawsze załaduj zasoby (na wypadek gdyby enqueue nie zadziałał)
        // To jest szczególnie ważne dla Elementora, który może renderować shortcode asynchronicznie
        $this->enqueue_calculator_assets(true);

        // Rozpocznij buforowanie outputu
        ob_start();

        // Włącz calculator.php z przekazanymi zmiennymi
        include $calculator_file;

        // Pobierz zawartość z bufora
        $output = ob_get_clean();

        // Jeśli output jest pusty, zwróć komunikat błędu
        if (empty($output)) {
            return '<div class="heatpump-error"><p>Błąd: Kalkulator nie wygenerował treści. Sprawdź logi błędów PHP.</p></div>';
        }

        return $output;
    }
}

/**
 * Inicjalizacja wtyczki
 */
function heatpump_calculator_init() {
    return HeatPump_Calculator::get_instance();
}

// Uruchom wtyczkę
add_action('plugins_loaded', 'heatpump_calculator_init');

