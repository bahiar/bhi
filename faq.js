async function initializeFAQ() {
  try {
    const response = await fetch('data/faq-data.json');
    if (!response.ok) throw new Error('No se pudo cargar el FAQ');
    
    const data = await response.json();
    const faqBody = document.getElementById('faq-body');
    
    if (!faqBody) return;
    
    let html = '';
    
    data.faq.forEach(category => {
      html += `<div style="padding:14px 20px 4px;">
        <span style="display:inline-block;background:#191971;color:#fff;font-size:10px;font-weight:500;padding:2px 10px;border-radius:999px;letter-spacing:0.04em;">${category.category}</span>
      </div>`;
      
      category.items.forEach((item, index) => {
        const isLast = index === category.items.length - 1;
        const borderStyle = isLast ? 'border-bottom:none;' : '';
        const badge = item.badge ? `<span style="display:inline-flex;align-items:center;gap:4px;background:#EEEDFE;color:#3C3489;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:500;">${item.badge}</span><br><br>` : '';
        
        html += `<div class="faq-i" ${borderStyle ? `style="${borderStyle}"` : ''}>
          <button class="faq-btn" onclick="faqToggle(this)">
            <span>${item.question}</span>
            <svg class="faq-chv" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          <div class="faq-ans">${badge}${item.answer}</div>
        </div>`;
      });
    });
    
    faqBody.innerHTML = html;
  } catch (error) {
    console.error('Error cargando FAQ:', error);
  }
}

function faqToggle(button) {
  const item = button.closest('.faq-i');
  const wasOpen = item.classList.contains('open');
  
  document.querySelectorAll('.faq-i.open').forEach(el => {
    el.classList.remove('open');
  });
  
  if (!wasOpen) {
    item.classList.add('open');
  }
}

// Inicializar cuando el documento esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFAQ);
} else {
  initializeFAQ();
}
