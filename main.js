/* ── MOBILE MENU ── */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
}

/* ── PRODUCT FILTER (products.html only) ── */
function filterCat(cat) {
  document.querySelectorAll('.cat-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.cat === cat);
  });
  document.querySelectorAll('#productGrid .product-card').forEach(card => {
    if (cat === 'all' || card.dataset.cat === cat) {
      card.classList.remove('products-hidden');
    } else {
      card.classList.add('products-hidden');
    }
  });
}

/* ── CONTACT SUBMIT (contact.html only) ── */
function submitContact() {
  const name    = document.getElementById('cf-name').value.trim();
  const email   = document.getElementById('cf-email').value.trim();
  const subject = document.getElementById('cf-subject').value;
  const msg     = document.getElementById('cf-msg').value.trim();

  if (!name || !email || !msg) {
    alert('Please fill in your name, email, and message.');
    return;
  }

  const body = encodeURIComponent(`Name: ${name}\n\n${msg}`);
  const subj = encodeURIComponent(subject || 'Driftocity Inquiry');
  window.location.href = `mailto:driftocity2@gmail.com?subject=${subj}&body=${body}`;

  showToast();
}

function showToast() {
  const t = document.getElementById('toast');
  if (!t) return;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 4000);
}

/* ── AUTO-HIGHLIGHT CURRENT NAV LINK ── */
(function() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
})();
