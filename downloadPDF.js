//* downloadPDF.js/

function getElementValue(id) {
  const el = document.getElementById(id);
  return el ? el.textContent.trim() : '';
}

/**
 * ✅ KONSOLIDACJA: Wykorzystuje formEngine.readFieldValue zamiast duplikacji kodu
 * Dodatkowa logika: sprawdza widoczność i filtruje puste wartości dla PDF
 */
function getFormValue(name) {
  // Użyj uniwersalnej funkcji z formEngine
  if (window.formEngine && typeof window.formEngine.readFieldValue === 'function') {
    const value = window.formEngine.readFieldValue(name);
    
    // Dodatkowa walidacja dla PDF - pomiń puste wartości
    if (value === '' || value === null || value === undefined) return null;
    if (Array.isArray(value) && value.length === 0) return null;
    if (value === 'no') return null; // Pomiń wartości "no" dla pól yes/no
    
    return value;
  }
  
  // Fallback - jeśli formEngine nie jest dostępny
  console.warn('[downloadPDF] formEngine.readFieldValue nie jest dostępny - używam fallback');
  const form = document.getElementById('heatCalcFormFull');
  if (!form) return null;
  const el = form.querySelector(`[name="${name}"]`);
  if (!el) return null;
  
  const style = window.getComputedStyle(el);
  const isVisible = !(style.display === 'none' || style.visibility === 'hidden');
  const isInVisibleContainer = el.offsetParent !== null;
  
  if (!isVisible || !isInVisibleContainer) return null;
  
  if (el.type === 'checkbox') return el.checked ? true : null;
  if (el.type === 'radio') {
    const checked = form.querySelector(`[name="${name}"]:checked`);
    return checked ? checked.value : null;
  }
  
  const value = el.value?.trim();
  return value === '' ? null : value;
}

// Helper – czeka na bibliotekę html2pdf
function waitForHtml2Pdf(maxWaitTime = 5000) {
  return new Promise((resolve, reject) => {
    if (typeof html2pdf !== 'undefined') return resolve();
    const start = Date.now();
    const check = setInterval(() => {
      if (typeof html2pdf !== 'undefined') {
        clearInterval(check);
        resolve();
      } else if (Date.now() - start > maxWaitTime) {
        clearInterval(check);
        reject(new Error('Nie załadowano biblioteki html2pdf w wyznaczonym czasie.'));
      }
    }, 200);
  });
}

// ======================
// 🔥 Główna funkcja
// ======================

async function downloadPDF() {
  try {
    console.log('🖱️ Kliknięto „Pobierz raport PDF”');
    await waitForHtml2Pdf(10000);

    if (typeof generateOfferPDF === 'undefined') {
      throw new Error('Brak funkcji generateOfferPDF — sprawdź czy pdfGenerator.js jest załadowany.');
    }

    // =============================================
    // 1️⃣ PROFIL ENERGETYCZNY
    // =============================================
    const profileItems = Array.from(document.querySelectorAll('.energy-profile-section .result-item'));
    const energyProfileRows = profileItems.map(el => {
      let label = el.querySelector('span')?.textContent.trim() || '';
      const value = el.querySelector('strong')?.textContent.trim() || '';
      // Skróty w etykietach profilu energetycznego
      label = label.replace(/Powierzchnia/g, 'Pow.').replace(/Temperatura/g, 'Temp.').replace(/maksymalna/gi, 'maks.');
      return label && value ? { label, value } : null;
    }).filter(Boolean);

    // =============================================
    // 2️⃣ POMPY CIEPŁA
    // =============================================
    const pumpTitle = document.getElementById('pump-power-title')?.textContent.trim() || null;
    const pumps = Array.from(document.querySelectorAll('#pump-recommendation-zone .heat-pump-card')).map(el => ({
      title: el.querySelector('.pump-model-name')?.textContent.trim() || '',
      type: el.querySelector('.pump-specs')?.innerText.trim().split('\n')[1]?.replace('Typ: ', '').trim() || '',
      kit: el.querySelector('.pump-specs')?.innerText.trim().split('\n')[0]?.replace('Model: ', '').trim() || '',
      power_kw: el.querySelector('.pump-specs')?.innerText.match(/Moc:\s*([\d.]+)/)?.[1] || ''
    }));

    // =============================================
    // 3️⃣ STRATY CIEPŁA
    // =============================================
    const energyLosses = Array.from(document.querySelectorAll('#energy-losses-container .loss-item')).map(el => ({
      name: el.querySelector('.loss-label')?.textContent.trim() || '',
      percent: parseFloat(el.querySelector('.loss-percent')?.textContent.replace('%', '').trim() || '0')
    })).filter(l => l.name);

    // =============================================
    // 4️⃣ MODERNIZACJE
    // =============================================
    const improvements = Array.from(document.querySelectorAll('#improvements-container .improvement-item')).map(el => ({
      title: el.querySelector('.improvement-label')?.textContent.trim() || '',
      saving: parseFloat(el.querySelector('.improvement-savings strong')?.textContent.replace('%', '').trim() || '0')
    })).filter(i => i.title);

    // =============================================
    // 5️⃣ KOSZTY OGRZEWANIA
    // =============================================
    const costs = Array.from(document.querySelectorAll('#heating-costs-container .cost-row')).map(el => ({
      variant: el.querySelector('.cost-label')?.textContent.trim() || '',
      efficiency: el.querySelector('.cost-efficiency')?.textContent.trim().replace('%', '') || '',
      annual_cost_pln: parseFloat(el.querySelector('.cost-amount')?.textContent.replace(/[^\d,.-]/g, '').replace(',', '.') || '0')
    })).filter(c => c.variant);

    // =============================================
    // 6️⃣ PUNKTY BIWALENTNE
    // =============================================
    const bivalent_points = Array.from(document.querySelectorAll('#bivalent-points-container .bivalent-point-card')).map(el => ({
      temp: parseFloat(el.querySelector('.bp-temp')?.textContent.replace('°C', '').trim() || '0'),
      power_kw: parseFloat(el.querySelector('.bp-power')?.textContent.replace('kW', '').trim() || '0')
    })).filter(b => !isNaN(b.temp));

    // =============================================
    // 7️⃣ DANE Z FORMULARZA (Informacje o budynku)
    // Używamy buildJsonData() - tej samej funkcji co dla API cieplo.app
    // =============================================
    
    if (typeof window.buildJsonData !== 'function') {
      throw new Error('Brak funkcji buildJsonData — sprawdź czy formDataProcessor.js jest załadowany.');
    }
    
    const apiData = window.buildJsonData();
    console.log('📦 Dane z buildJsonData (te same co do API):', apiData);
    
    // Mapowania wartości na polskie nazwy (jak w formularzu)
    const buildingTypeMap = {
      'single_house': 'Dom jednorodzinny',
      'double_house': 'Bliźniak',
      'row_house': 'Szeregowiec',
      'apartment': 'Mieszkanie',
      'multifamily': 'Budynek wielorodzinny'
    };

    const windowsMap = {
      '2021_triple_glass': 'Trójszybowe 2021+',
      '2021_double_glass': 'Nowoczesne (2021+), dwuszybowe',
      'new_triple_glass': 'Trójszybowe',
      'new_double_glass': 'Dwuszybowe nowe',
      'semi_new_double_glass': 'Dwuszybowe',
      'old_double_glass': 'Dwuszybowe stare',
      'old_single_glass': 'Jednoszybowe'
    };

    // Przekształć dane z API na format dla PDF (tylko te pola, które są w apiData)
    const buildingInfo = {
      building_type: apiData.building_type ? buildingTypeMap[apiData.building_type] || apiData.building_type : '',
      construction_year: apiData.construction_year ? String(apiData.construction_year) : '',
      construction_type: apiData.construction_type === 'traditional' ? 'Tradycyjna' : (apiData.construction_type === 'canadian' ? 'Szkieletowy' : ''),
      building_length: apiData.building_length ? String(apiData.building_length) : '',
      building_width: apiData.building_width ? String(apiData.building_width) : '',
      floor_area: apiData.floor_area ? String(apiData.floor_area) : '',
      floor_perimeter: apiData.floor_perimeter ? String(apiData.floor_perimeter) : '',
      building_floors: apiData.building_floors ? String(apiData.building_floors) : '',
      floor_height: apiData.floor_height ? String(apiData.floor_height) : '',
      building_roof: apiData.building_roof || '',
      has_basement: apiData.has_basement !== undefined ? (apiData.has_basement ? 'Tak' : 'Nie') : '',
      has_balcony: apiData.has_balcony !== undefined ? (apiData.has_balcony ? 'Tak' : 'Nie') : '',
      has_garage: apiData.has_garage !== undefined ? (apiData.has_garage ? 'Tak' : 'Nie') : '',
      garage_type: apiData.garage_type || '',
      wall_size: apiData.wall_size ? String(apiData.wall_size) : '',
      external_wall_isolation_size: apiData.external_wall_isolation?.size ? String(apiData.external_wall_isolation.size) : '',
      external_wall_isolation_material: apiData.external_wall_isolation?.material ? String(apiData.external_wall_isolation.material) : '',
      top_isolation_material: apiData.top_isolation?.material ? String(apiData.top_isolation.material) : '',
      top_isolation_size: apiData.top_isolation?.size ? String(apiData.top_isolation.size) : '',
      bottom_isolation_material: apiData.bottom_isolation?.material ? String(apiData.bottom_isolation.material) : '',
      bottom_isolation_size: apiData.bottom_isolation?.size ? String(apiData.bottom_isolation.size) : '',
      internal_wall_isolation_material: apiData.internal_wall_isolation?.material ? String(apiData.internal_wall_isolation.material) : '',
      internal_wall_isolation_size: apiData.internal_wall_isolation?.size ? String(apiData.internal_wall_isolation.size) : '',
      primary_wall_material: apiData.primary_wall_material ? String(apiData.primary_wall_material) : '',
      secondary_wall_material: apiData.secondary_wall_material ? String(apiData.secondary_wall_material) : '',
      doors_type: apiData.doors_type || '',
      number_doors: apiData.number_doors ? String(apiData.number_doors) : '',
      windows: apiData.windows_type ? (windowsMap[apiData.windows_type] || apiData.windows_type) : '',
      number_windows: apiData.number_windows ? String(apiData.number_windows) : '',
      indoor_temperature: apiData.indoor_temperature ? String(apiData.indoor_temperature) : '',
      ventilation_type: apiData.ventilation_type || '',
      include_hot_water: apiData.include_hot_water !== undefined ? (apiData.include_hot_water ? 'Tak' : 'Nie') : '',
      hot_water_persons: apiData.hot_water_persons ? String(apiData.hot_water_persons) : '',
      hot_water_usage: apiData.hot_water_usage || '',
      on_corner: apiData.on_corner !== undefined ? (apiData.on_corner ? 'Tak' : 'Nie') : '',
      whats_over: apiData.whats_over || '',
      whats_under: apiData.whats_under || '',
      whats_north: apiData.whats_north || '',
      whats_south: apiData.whats_south || '',
      whats_east: apiData.whats_east || '',
      whats_west: apiData.whats_west || '',
    };

    // =============================================
    // 8️⃣ DANE Z KONFIGURATORA MASZYNOWNI
    // =============================================
    const configuratorData = window.configuratorSelection || window.lastCalculationResult?.configurator || null;
    const machineRoomItems = configuratorData?.pricing?.items || [];
    const machineRoomTotal = configuratorData?.pricing?.total_netto_pln || 0;
    const machineRoomTotalBrutto = configuratorData?.pricing?.total_brutto_pln || 0;

    // =============================================
    // 9️⃣ KONSTRUKCJA OBIEKTU DLA PDF
    // =============================================
    const configData = {
      energy_profile_rows: energyProfileRows,
      recommended_power_kw: pumpTitle ? parseFloat(pumpTitle.match(/([\d.]+)/)?.[1] || '0') : null,
      recommended_models: pumps,
      energy_losses: energyLosses,
      improvements: improvements,
      costs_comparison: costs,
      bivalent_points: bivalent_points,
      ...buildingInfo,
      models_intro: 'Wybrane modele gwarantują stabilną, cichą i ekonomiczną pracę przez cały sezon grzewczy.',
      models_outro: 'Zestaw obejmuje pełny pakiet komponentów dopasowanych do Twojego budynku.',
      // Dane maszynowni
      machine_room: {
        items: machineRoomItems,
        total_netto_pln: machineRoomTotal,
        total_brutto_pln: machineRoomTotalBrutto,
        selections: configuratorData?.selections || {},
        products: configuratorData?.products || {},
      },
    };

    console.log('📊 Zebrane dane z DOM do PDF:', configData);

    // =============================================
    // 9️⃣ Wygeneruj PDF
    // =============================================
    await generateOfferPDF(configData);

  } catch (err) {
    console.error('❌ Błąd podczas generowania PDF:', err);
    ErrorHandler.showToast('Nie udało się wygenerować raportu PDF: ' + err.message, 'error', 5000);
  }
}

// ======================
// Obsługa przycisku
// ======================

function setupPDFButtonListener() {
  const btn = document.getElementById('download-pdf-btn');
  const btnProfile = document.getElementById('download-pdf-btn-profile');
  
  if (!btn && !btnProfile) {
    console.warn('⚠️ Nie znaleziono przycisków PDF');
    return;
  }
  
  // Przycisk w widoku konfiguratora
  if (btn) {
    btn.addEventListener('click', e => {
      e.preventDefault();
      downloadPDF();
    });
    console.log('✅ Listener PDF (konfigurator) gotowy');
  }
  
  // Przycisk w widoku profilu energetycznego
  if (btnProfile) {
    btnProfile.addEventListener('click', e => {
      e.preventDefault();
      downloadPDF();
    });
    console.log('✅ Listener PDF (profil) gotowy');
  }
}

document.addEventListener('DOMContentLoaded', setupPDFButtonListener);

// Eksport globalny
window.downloadPDF = downloadPDF;
window.waitForHtml2Pdf = waitForHtml2Pdf;