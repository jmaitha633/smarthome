/* JK Engineering contact enquiry form. Uses mailto and WhatsApp; no message is stored. */
(() => {
  const form = document.getElementById('jk-contact-form');
  const service = document.getElementById('contact-service');
  const reason = document.getElementById('contact-reason');
  const message = document.getElementById('contact-message');
  const whatsappButton = document.getElementById('contact-whatsapp-button');
  if (!form || !service || !reason || !message || !whatsappButton) return;

  function buildEnquiry() {
    const details = message.value.trim() || 'Please contact me to discuss this enquiry.';
    return `Hello JK Engineering,\n\nService: ${service.value}\nEnquiry type: ${reason.value}\nMessage: ${details}\n\nSent from the JKSmartNest website.`;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const subject = `JKSmartNest enquiry - ${service.value}`;
    const url = `mailto:jmaitha633@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(buildEnquiry())}`;
    window.location.href = url;
  });

  whatsappButton.addEventListener('click', () => {
    const url = `https://wa.me/254743410685?text=${encodeURIComponent(buildEnquiry())}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
})();
